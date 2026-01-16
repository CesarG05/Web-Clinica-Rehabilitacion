import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputFieldFormComponent } from '../../../../shared/input-field-form/input-field-form.component';
import { PacienteUpdate } from '../../models/paciente-update.model';
import { DateFieldFormComponent } from '../../../../shared/date-field-form/date-field-form.component';
import { SelectFieldFormComponent } from '../../../../shared/select-field-form/select-field-form.component';
import { AlertService } from '../../../../shared/alert/alert.service';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-editar-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldFormComponent, DateFieldFormComponent, SelectFieldFormComponent, BackHeaderComponent],
  templateUrl: './editar-paciente.component.html',
  styleUrls: ['./editar-paciente.component.scss']
})
export class EditarPacienteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private pacienteService = inject(PacienteService);

  paciente: Paciente = {} as Paciente;
  sexos: { id: number; nombre: string }[] = [];
  cargando = false;
  submitted = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSexos();
    this.obtenerPaciente(id);
  }

  cargarSexos(): void {
    this.sexos = [
      { id: 1, nombre: 'Masculino' },
      { id: 2, nombre: 'Femenino' }
    ];
  }

  obtenerPaciente(id: number): void {
    this.pacienteService.getPacienteById(id).subscribe({
      next: (data) => {
        const sexoEncontrado = this.sexos.find(s => s.nombre === data.sexo);

        this.paciente = {
          ...data,
          sexoId: sexoEncontrado ? sexoEncontrado.id : 1
        };
      },
      error: (err) =>  this.alertService.error(err?.message || 'Ocurrió un error al obtener al paciente.')
    });
  }

  guardarCambios(): void {
    this.submitted = true;

     if (!this.paciente.primerNombre || !this.paciente.primerApellido || !this.paciente.fechaNacimiento) {
      this.alertService.warning('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.cargando = true;

    // Convertir Paciente → PacienteUpdate
    const payload: Partial<PacienteUpdate> = {
      primerNombre: this.paciente.primerNombre,
      segundoNombre: this.paciente.segundoNombre,
      primerApellido: this.paciente.primerApellido,
      segundoApellido: this.paciente.segundoApellido,
      fechaNacimiento: this.paciente.fechaNacimiento,
      direccion: this.paciente.direccion,
      telefono: this.paciente.telefono,
      correoElectronico: this.paciente.correoElectronico,
      activo: this.paciente.activo,
      sexoId: this.paciente.sexoId 
    };

    this.pacienteService.updatePaciente(this.paciente.id, payload).subscribe({
      next: () => {
        this.cargando = false;
        this.alertService.success('Paciente actualizado exitosamente.');
        this.router.navigate(['/pacientes']);
        //this.location.back();
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al actualizar los datos del paciente.')
        this.cargando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }
}
