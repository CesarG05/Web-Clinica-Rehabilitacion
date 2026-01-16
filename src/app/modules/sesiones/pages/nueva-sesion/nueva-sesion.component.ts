import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SesionesService } from '../../services/sesiones.service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';
import { SesionCreate } from '../../models/sesion-create.model';
import { PacienteService } from '../../../pacientes/services/paciente.service';
import { ServicioService } from '../../../servicios/services/servicio.service';
import { Paciente } from '../../../pacientes/models/paciente.model';
import { ServicioGrupo } from '../../../servicios/models/servicio-grupo.model';
import { Tratamiento } from '../../../historiales-clinicos/models/tratamiento.model';
import { Servicio } from '../../../servicios/models/servicio.model';
import { TratamientoService } from '../../../historiales-clinicos/services/tratamiento.service';

@Component({
  selector: 'app-nueva-sesion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BackHeaderComponent
  ],
  templateUrl: './nueva-sesion.component.html',
  styleUrls: ['./nueva-sesion.component.scss']
})
export class NuevaSesionComponent implements OnInit {

  private sesionesService = inject(SesionesService);
  private pacientesService = inject(PacienteService);
  private serviciosService = inject(ServicioService);
  private tartamientosService = inject(TratamientoService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitted = false;
  cargando = false;

  sesion: SesionCreate = {
    pacienteId: null!,
    servicioId: null!,
    tratamientoId: null!, 
    estadoId: 1, 
    fechaAplicacion: null
  };

  // Catálogos 
  pacientes: Paciente[] = [];
  servicios: ServicioGrupo[] = [];
  tratamientos: Tratamiento[] = [];

  // Filtros de Servicios
  disponibleService: boolean = true;

  searchService = '';
  searchPaciente = '';

  pacientesFiltrados: Paciente[] = [];
  serviciosFiltrados: ServicioGrupo[] = [];
  totalTratamientos = 0;

  pacienteSeleccionado: Paciente | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['pacienteId']) {
        this.sesion.pacienteId = +params['pacienteId']; 
      }

      if (params['tratamientoId']) {
        this.sesion.tratamientoId = +params['tratamientoId'];
      }

      this.cargarDatos();

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    });
  }


  cargarDatos(): void {

    this.pacientesService.getAllPacientes().subscribe({
      next: (res) => {
        this.pacientes = res;

        if (this.sesion.pacienteId) {
          const paciente = res.find(p => p.id === this.sesion.pacienteId);

          if (paciente) {
            this.seleccionarPaciente(paciente);
            return;
          }
        }

        this.pacientesFiltrados = res;
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al cargar pacientes');
      }
    });

    this.serviciosService.getServicios(this.disponibleService, this.searchService)
    .subscribe({
      next: (res: ServicioGrupo[]) => {
        this.servicios = res;
        this.serviciosFiltrados = this.servicios;
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al cargar servicios.')
      },
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


  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')                 
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  filtrarServicios(): void {
    const term = this.searchService.toLowerCase();

    this.serviciosFiltrados = this.servicios
      .map(g => ({
        ...g,
        servicios: g.servicios.filter(s =>
          s.nombre.toLowerCase().includes(term)
        )
      }))
      .filter(g => g.servicios.length > 0);
  }

  seleccionarPaciente(p: Paciente): void {
    this.pacienteSeleccionado = p;
    this.sesion.pacienteId = p.id;
    this.searchPaciente = '';
    this.pacientesFiltrados = [p];

    this.tratamientos = [];
    this.totalTratamientos = 0;

    this.tartamientosService.getTratamientosPaciente(p.id).subscribe({
      next: (res) => {
        this.totalTratamientos = res.length;
        this.tratamientos = res.filter(t => t.fechaFinTratamiento === null);

        if (this.sesion.tratamientoId) {
          const tratamiento = this.tratamientos.find(
            t => t.tratamientoId === this.sesion.tratamientoId
          );

          if (tratamiento) {
            this.seleccionarTratamiento(tratamiento);
          }
        }
      },
      error: () => {
        this.tratamientos = [];
        this.totalTratamientos = 0;
      }
    });
  }

  seleccionarTratamiento(t: Tratamiento): void {
    this.sesion.tratamientoId = t.tratamientoId;
  }

  seleccionarServicio(s: Servicio): void {
    this.sesion.servicioId = s.id;
  }

  guardarSesion(): void {
    if (!this.sesion.pacienteId || !this.sesion.servicioId) {
      this.alertService.warning('Seleccione paciente y servicio.');
      return;
    }

    this.cargando = true;

    this.sesionesService.crearSesion(this.sesion).subscribe({
      next: () => {
        this.alertService.success('Sesión registrada correctamente.');
        this.router.navigate(['/sesiones']);
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al crear sesión');
        this.cargando = false;
      }
    });
  }

  //Resets
  resetPaciente(): void {
    this.pacienteSeleccionado = null;
    this.sesion.pacienteId = null!;
    this.sesion.tratamientoId = null!;
    this.tratamientos = [];
    this.totalTratamientos = 0;
    this.searchPaciente = '';
    this.pacientesFiltrados = this.pacientes;
  }

  resetTratamiento(): void {
    this.sesion.tratamientoId = null!;
  }

  resetServicio(): void {
    this.sesion.servicioId = null!;
  }

}