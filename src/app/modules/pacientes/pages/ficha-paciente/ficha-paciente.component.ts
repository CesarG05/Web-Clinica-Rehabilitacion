import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Paciente } from '../../models/paciente.model';
import { DatePipe } from '@angular/common';
import { PacienteService } from '../../services/paciente.service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-ficha-paciente',
  standalone: true,
  imports: [DatePipe, RouterModule, ConfirmModalComponent, BackHeaderComponent],
  templateUrl: './ficha-paciente.component.html',
  styleUrls: ['./ficha-paciente.component.scss']
})
export class FichaPacienteComponent {
  private router = inject(Router);
  private pacientesService = inject(PacienteService)
  private alertService = inject(AlertService)

  paciente: Paciente | null = null;

  constructor() {
    const navigation = this.router.currentNavigation();
    this.paciente = navigation?.extras?.state?.['paciente'] || null;
  }
  
  //Menu paciente
  menuAbiertoId = signal<number | null>(null);
  private clickListener = (event: MouseEvent) => this.cerrarMenuSiFuera(event);

  //Modal confirmación
  modalAbierto = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmCallback: (() => void) | null = null;


  // Eliminar
  eliminarPaciente(paciente: Paciente): void {
    this.menuAbiertoId.set(null);

    this.abrirModal(
      `Eliminar a ${paciente.primerApellido} ${paciente.primerNombre}`,
      '¿Seguro que desea eliminar de manera permanente a este paciente?',
      () => {
        this.pacientesService.deletePaciente(paciente.id).subscribe({
          next: () => {
            this.alertService.success('Paciente eliminado exitosamente.');
             this.router.navigate(['/pacientes']);
          },
          error: (err) => {
            this.alertService.error(err?.message || 'Error al eliminar al paciente.');
          },
        });
      }
    );
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }

  calcularEdad(fechaNacimiento: string): number {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
    return edad;
  }

  cerrarMenuSiFuera(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-dropdown') && !target.closest('.menu-btn')) {
      this.menuAbiertoId.set(null);
    }
  }

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
}
