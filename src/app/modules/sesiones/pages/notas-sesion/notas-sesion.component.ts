import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';
import { SesionesService } from '../../services/sesiones.service';
import { NotaSesionService } from '../../services/nota-sesion.service';
import { NotaSesion } from '../../models/nota-sesion.model';
import { Sesion } from '../../models/sesion.model';
import { AlertService } from '../../../../shared/alert/alert.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notas-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule, BackHeaderComponent, ConfirmModalComponent],
  templateUrl: './notas-sesion.component.html',
  styleUrls: ['./notas-sesion.component.scss']
})
export class NotasSesionComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private notasService = inject(NotaSesionService);
  private sesionService = inject(SesionesService);
  private alertService = inject(AlertService);

  sesionId!: number;
  notas = signal<NotaSesion | null>(null);
  sesion = signal<Sesion | null>(null);
  cargando = true;

  // Modal confirmacion
  modalAbierto = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmCallback: (() => void) | null = null;

  //Modal nota nueva
  modalNotaAbierto = false;
  notaTexto = '';
  guardandoNota = false;

  ngOnInit(): void {
    this.sesionId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSesion();
  }

  cargarSesion() {
    this.cargando = true;

    this.sesionService.getSesionById(this.sesionId).subscribe({
      next: (sesion) => {
        this.sesion.set(sesion);
        this.cargando = false;
      },
      error: (err) => {
        this.alertService.error(err?.message ||'Error al cargar las notas de la sesión.');
        this.cargando = false;
      }
    });
  }

  eliminarNota(notaId: number) {
    this.abrirModal(
        'Eliminar nota',
        '¿Deseas eliminar esta nota de forma permanente?',
        () => {
        this.notasService.deleteNotaSesion(notaId).subscribe({
            next: () => {
                this.cargarSesion();
                this.alertService.success('Nota eliminada correctamente.');
            },
            error: (err) => {
                this.alertService.error(err?.message || 'Error al eliminar la nota.');
            }
        });
        }
    );
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

    guardarNota() {
        if (!this.notaTexto.trim()) {
            this.alertService.warning('La nota no puede estar vacía.');
            return;
        }

        const userRaw = localStorage.getItem('user');
        const user = userRaw ? JSON.parse(userRaw) : null;

        const hoy = new Date();

        // Formato YYYY-MM-DD usando fecha local
        const fechaLocal = [
        hoy.getFullYear(),
        String(hoy.getMonth() + 1).padStart(2, '0'),
        String(hoy.getDate()).padStart(2, '0')
        ].join('-');

        const data = {
        sesionId: this.sesionId,
        notas: this.notaTexto.trim(),
        autor: user
            ? `${user.nombre} ${user.primerApellido}`
            : 'Usuario',
        fecha: fechaLocal
        };

        this.guardandoNota = true;

        this.notasService.createNotaSesion(data).subscribe({
            next: () => {
            this.alertService.success('Nota agregada correctamente.');
            this.cerrarModalNota();
            this.cargarSesion();
            this.guardandoNota = false;
            },
            error: (err) => {
            this.alertService.error(err?.message || 'Error al guardar la nota.');
            this.guardandoNota = false;
            }
        });
    }

    // Acciones modal nota nueva
    abrirModalNota() {
        this.notaTexto = '';
        this.modalNotaAbierto = true;
    }

    cerrarModalNota() {
        this.modalNotaAbierto = false;
    }

}
