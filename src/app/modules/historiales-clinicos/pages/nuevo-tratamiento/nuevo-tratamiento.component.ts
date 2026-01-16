import { Component, inject, OnInit } from "@angular/core";
import { TratamientoService } from "../../services/tratamiento.service";
import { AlertService } from "../../../../shared/alert/alert.service";
import { TratamientoCreate } from "../../models/tratamiento-create.model";
import { BackHeaderComponent } from "../../../../shared/back-header/back-header.component";
import { Paciente } from "../../../pacientes/models/paciente.model";
import { FormsModule } from "@angular/forms";
import { PacienteService } from "../../../pacientes/services/paciente.service";
import { InputFieldFormComponent } from "../../../../shared/input-field-form/input-field-form.component";
import { DateFieldFormComponent } from "../../../../shared/date-field-form/date-field-form.component";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'app-nuevo-tratamiento',
    standalone: true,
    imports: [FormsModule, BackHeaderComponent, InputFieldFormComponent, DateFieldFormComponent],
    templateUrl: './nuevo-tratamiento.component.html',
    styleUrls: ['./nuevo-tratamiento.component.scss']
})
export class NuevoTratamientoComponent {

    private tratamientoService = inject(TratamientoService);
    private pacientesService = inject(PacienteService);
    private alertService = inject(AlertService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    tratamiento: TratamientoCreate = {
        pacienteId: null!,
        padecimiento: "",
        tratamiento: "",
        fechaInicioTratamiento: "",
        observaciones: ""
    };

    submitted = false;
    cargando = false;

    // Lista pacientes
    pacientes: Paciente[] = [];

    searchPaciente = '';
    pacientesFiltrados: Paciente[] = [];
    pacienteSeleccionado: Paciente | null = null;

    ngOnInit(): void {
        const pacienteId = Number(
            this.route.parent?.snapshot.paramMap.get('id')
        );

        if (pacienteId) {
            this.tratamiento.pacienteId = pacienteId;
        }

        this.cargarPacientes();
    }

    cargarPacientes(): void {
        this.pacientesService.getAllPacientes().subscribe({
            next: (res: Paciente[]) => {
            this.pacientes = res;

            if (this.tratamiento.pacienteId) {
                const paciente = res.find(
                p => p.id === this.tratamiento.pacienteId
                );

                if (paciente) {
                this.seleccionarPaciente(paciente);
                return;
                }
            }

            this.pacientesFiltrados = res;
            },
            error: (err) => {
            this.alertService.error(err?.message || 'Error al cargar pacientes.');
            }
        });
    }

    filtrarPacientes(): void {
        const term = this.normalizarTexto(this.searchPaciente);

        if (!term) {
        this.pacientesFiltrados = this.pacienteSeleccionado
            ? [this.pacienteSeleccionado]
            : [];
        return;
        }

        const palabras = term.split(/\s+/);

        let resultados = this.pacientes.filter(p => {
        const nombreCompleto = this.normalizarTexto(
            [
            p.primerNombre,
            p.segundoNombre,
            p.primerApellido,
            p.segundoApellido
            ].filter(Boolean).join(' ')
        );

        return palabras.every(palabra =>
            nombreCompleto.includes(palabra)
        );
        });

        if (
        this.pacienteSeleccionado &&
        !resultados.some(p => p.id === this.pacienteSeleccionado!.id)
        ) {
        resultados = [this.pacienteSeleccionado, ...resultados];
        }

        this.pacientesFiltrados = resultados;
    }

    seleccionarPaciente(p: Paciente): void {
        this.pacienteSeleccionado = p;
        this.tratamiento.pacienteId = p.id;
        this.searchPaciente = '';
        this.pacientesFiltrados = [p];
    }

    guardarTratamiento(): void {
        this.submitted = true;

        if (!this.tratamiento.pacienteId || !this.tratamiento.padecimiento || !this.tratamiento.tratamiento) {
        this.alertService.warning('Por favor, complete todos los campos obligatorios.');
        return;
        }

        this.cargando = true;

        this.tratamientoService.createTratamiento(this.tratamiento).subscribe({
        next: () => {
            this.alertService.success('Tratamiento registrado correctamente.');
            this.router.navigate(['../../historial-clinico'], { relativeTo: this.route });
        },
        error: (err) => {
            this.alertService.error(err?.message || 'Error al crear el tratamiento');
            this.cargando = false;
        }
        });
    }

    //Resets
    resetPaciente(): void {
        this.pacienteSeleccionado = null;
        this.tratamiento.pacienteId = null!;
        this.searchPaciente = '';
        this.pacientesFiltrados = this.pacientes;
    }

    private normalizarTexto(texto: string): string {
        return texto
        .toLowerCase()
        .normalize('NFD')                 
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
    }
}