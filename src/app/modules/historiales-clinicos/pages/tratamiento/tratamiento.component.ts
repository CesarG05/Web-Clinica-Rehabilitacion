import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TratamientoService } from '../../services/tratamiento.service';
import { TratamientoDetalle } from '../../models/tratamiento-detalle.model';
import { DatePipe } from '@angular/common';
import { SessionItemComponent } from '../../../../shared/session-item/session-item.component';
import { SesionTratamiento } from '../../models/sesion-tratamiento.model';
import { SesionUpdate } from '../../../sesiones/models/sesion-update.model';
import { SesionesService } from '../../../sesiones/services/sesiones.service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { SelectModalComponent } from '../../../../shared/select-modal/select-modal.component';
import { DocumentoItemComponent } from '../../../../shared/documento-item/documento-item.component';
import { DocumentoTratamiento } from '../../models/documento-tratamiento.model';
import { DocumentoTratamientoService } from '../../services/documento-tratamiento.service';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-tratamiento',
  standalone: true,
  imports: [DatePipe,RouterModule, SessionItemComponent, ConfirmModalComponent, SelectModalComponent, DocumentoItemComponent, BackHeaderComponent],
  templateUrl: './tratamiento.component.html',
  styleUrls: ['./tratamiento.component.scss']
})
export class TratamientoComponent {
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);
  private tratamientoService = inject(TratamientoService);
  private documentoService = inject(DocumentoTratamientoService);
  private sesionService = inject(SesionesService);
  private router = inject(Router);

  tratamientoDetalle: TratamientoDetalle | null = null;
  cargando = true;

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
    const tratamientoId = Number(this.route.snapshot.paramMap.get('idTratamiento'));

    if (!tratamientoId) {
      this.alertService.error('Tratamiento no válido');
      return;
    }

    this.cargarDetallesTratamiento(tratamientoId)
  }

  cargarDetallesTratamiento(tratamientoId: number): void {
    this.cargando = true;

    this.tratamientoService.getTratamientoDetalle(tratamientoId).subscribe({
      next: (data) => {
        this.tratamientoDetalle = data;
        this.cargando = false;
      },
      error: (e) => {
        this.alertService.error(e?.message || 'No se pudo cargar los detalles del tratamiento');
        this.cargando = false;
      }
    });
  }

  //Ir a nueva sesion
  irNuevaSesion(): void {
    this.router.navigate(['/sesiones/nueva-sesion']);
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

  confirmarFinalizarTratamiento(): void {
    if (!this.tratamientoDetalle) return;

    this.abrirModal(
      'Finalizar tratamiento',
      '¿Está seguro de que desea finalizar este tratamiento? Esta acción no se puede deshacer.',
      () => this.finalizarTratamiento()
    );
  }

  finalizarTratamiento(): void {
    if (!this.tratamientoDetalle) return;

    const tratamientoId = this.tratamientoDetalle.tratamientoId;
    const hoy = new Date();
    const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    const updateData = {
      padecimiento: this.tratamientoDetalle.padecimiento,
      tratamiento: this.tratamientoDetalle.tratamiento,
      fechaInicioTratamiento: this.tratamientoDetalle.fechaInicioTratamiento,
      fechaFinTratamiento: fechaLocal,
      observaciones: this.tratamientoDetalle.observaciones
    };

    this.cargando = true;

    this.tratamientoService.updateTratamiento(tratamientoId, updateData).subscribe({
      next: () => {
        this.alertService.success('Tratamiento finalizado correctamente');
        this.cargarDetallesTratamiento(tratamientoId);
        this.cargando = false;
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al finalizar el tratamiento');
        console.log(err);
        this.cargando = false;
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

    const tratamientoId = this.sesionSeleccionado.tratamientoId;
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
        this.cargarDetallesTratamiento(tratamientoId!);
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
          this.cargarDetallesTratamiento(sesion.tratamientoId!);
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

  verDocumento(doc: DocumentoTratamiento) {
    window.open(doc.rutaDocumento, '_blank');
  }

   descargarDocumento(doc: DocumentoTratamiento) {
    fetch(doc.rutaDocumento)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = doc.nombreDocumento;
        link.click();

        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        this.alertService.error(err?.message || 'No se pudo descargar el documento');
        console.log(err);
      });
  }

  eliminarDocumento(doc: DocumentoTratamiento) {
    this.abrirModal(
      `Eliminar documento`,
      `¿Desea eliminar el documento "${doc.nombreDocumento}"?`,
      () => {
        this.documentoService
          .deleteDocumento(doc.id)
          .subscribe({
            next: () => {
              this.alertService.success('Documento eliminado correctamente');
              this.cargarDetallesTratamiento(this.tratamientoDetalle!.tratamientoId);
            },
            error: (err) => {
              this.alertService.error(err?.message || 'No se pudo eliminar el documento');
            }
          });
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!this.tratamientoDetalle) return;

    const request = {
      tratamientoId: this.tratamientoDetalle.tratamientoId,
      archivo: file
    };

    this.cargando = true;

    this.documentoService.uploadDocumento(request).subscribe({
      next: () => {
        this.alertService.success('Documento subido correctamente');
        this.cargarDetallesTratamiento(this.tratamientoDetalle!.tratamientoId);
        input.value = '';
        this.cargando = false;
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al subir el documento');
        this.cargando = false;
      }
    });
  }
}
