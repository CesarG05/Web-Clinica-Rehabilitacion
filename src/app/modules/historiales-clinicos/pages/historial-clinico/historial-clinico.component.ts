import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HistorialClinicoService } from '../../services/historial-clinico.service';
import { HistorialClinico } from '../../models/historial-clinico.model';
import { AlertService } from '../../../../shared/alert/alert.service';
import { SesionTratamiento } from '../../models/sesion-tratamiento.model';
import { SessionItemComponent } from '../../../../shared/session-item/session-item.component';
import { SesionesService } from '../../../sesiones/services/sesiones.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { SesionUpdate } from '../../../sesiones/models/sesion-update.model';
import { SelectModalComponent } from '../../../../shared/select-modal/select-modal.component';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, SessionItemComponent, ConfirmModalComponent, SelectModalComponent, BackHeaderComponent],
  templateUrl: './historial-clinico.component.html',
  styleUrls: ['./historial-clinico.component.scss'],
})
export class HistorialClinicoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private historialService = inject(HistorialClinicoService);
  private alertService = inject(AlertService);
  private sesionService = inject(SesionesService);
  private router = inject(Router);

  historial = signal<HistorialClinico | null>(null);
  cargando = false;

  // Modal confirmacion
  modalAbierto = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmCallback: (() => void) | null = null;
  //Modal de estados
  modalEstadoAbierto = false;
  sesionSeleccionado: SesionTratamiento | null = null;

  // Estados de sesion
  estadosSesion = [
    { value: 1, label: 'Pendiente' },
    { value: 2, label: 'Realizado' },
    { value: 3, label: 'Cancelado' }
  ];

  ngOnInit(): void {
    const pacienteId = Number(this.route.snapshot.paramMap.get('id'));

    if (!pacienteId) {
      this.alertService.error('Paciente no válido');
      return;
    }
    this.cargarHistorial(pacienteId);
  }

  irNuevaSesion(): void {
    this.router.navigate(['/sesiones/nueva-sesion']);
  }

  cargarHistorial(pacienteId: number): void {
    this.cargando = true;

    this.historialService.getHistorialClinico(pacienteId).subscribe({
      next: (res) => {
        this.historial.set(res);
        this.cargando = false;
      },
      error: (e) => {
        this.alertService.error(e?.message || 'No se pudo cargar el historial clínico');
        this.cargando = false;
      }
    });
  }

  //Acciones del modal de confirmacion
  abrirModal(title: string, message: string, confirmCallback: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmCallback = confirmCallback;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalConfirmCallback = null;
  }

  descargarPdf(): void {
    const pacienteId = this.historial()?.paciente.id;
    if (!pacienteId) return;

    const paciente = this.historial()?.paciente;
    if (!paciente) return;

    const nombre = [
      paciente.primerNombre,
      paciente.segundoNombre,
      paciente.primerApellido,
      paciente.segundoApellido
    ]
      .filter(Boolean)
      .join('-');

    this.historialService.getHistorialClinicoPdf(pacienteId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Historial-Clinico-${nombre}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (e) => {
        this.alertService.error(e?.message || 'Error al descargar el PDF');
      }
    });
  }

  abrirPdf(): void {
    const pacienteId = this.historial()?.paciente.id;
    if (!pacienteId) return;

    this.historialService.getHistorialClinicoPdf(pacienteId).subscribe({
        next: (blob) => {
        const url = window.URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' })
        );
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        error: (e) => {
          this.alertService.error(e?.message || 'Error al abrir el PDF');
        }
    });
  }

  // Ver notas
  verNotasSesion(sesion: SesionTratamiento) {
    this.router.navigate(['/sesiones', sesion.id, 'notas']);
  }

  // Cambiar estado
  cambiarEstadoSesion(sesion: SesionTratamiento) {
    this.sesionSeleccionado = sesion;
    this.modalEstadoAbierto = true;
  }

  onConfirmRol(selectedValue: number) {
    if (!this.sesionSeleccionado) return;

    const pacienteId = this.sesionSeleccionado.pacienteId;
    const sesionId = this.sesionSeleccionado.id;

    this.cargando = true;

    const sesionUpdate: SesionUpdate = {
      estadoId: selectedValue,
      fechaAplicacion: selectedValue === 2
        ? new Date().toISOString() 
        : null  
    };

    this.sesionService.actualizarSesion(sesionId, sesionUpdate).subscribe({
      next: () => {
        this.cargarHistorial(pacienteId);
        this.alertService.success('Cambio de estado de sesión exitoso.');
        this.cargando = false;
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al cambiar el estado de la sesión.');
        this.cargando = false;
      }
    });

    this.modalEstadoAbierto = false;
    this.sesionSeleccionado = null; 
  }


  // Eliminar sesion
  eliminarSesion(sesion: SesionTratamiento): void {
    this.abrirModal(
      `Eliminar sesion ${sesion.servicio.nombreServicio}`,
      '¿Seguro que desea eliminar de manera permanente esta sesión?',
      () => {
      this.cargando = true;
      this.sesionService.eliminarSesion(sesion.id).subscribe({
        next: () => {
          this.cargarHistorial(sesion.pacienteId);
          this.alertService.success('Sesión eliminada exitosamente');
          this.cargando = false;
        },
        error: (err) => {
          this.alertService.error(err?.message || 'Error al eliminar la sesión.');
          this.cargando = false;
        },
      });
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
    return edad;
  }
}
