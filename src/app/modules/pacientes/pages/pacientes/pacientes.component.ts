import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';
import { PacientePaginado } from '../../models/paciente-paginado.model';
import { InputFieldSearchComponent } from '../../../../shared/input-field-search/input-field-search.component';
import { Router, RouterModule } from '@angular/router';
import { delay } from 'rxjs/operators';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { DatePipe } from '@angular/common';
import { AlertService } from '../../../../shared/alert/alert.service';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, InputFieldSearchComponent, RouterModule, ConfirmModalComponent, DatePipe, BackHeaderComponent],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss'],
})
export class PacientesComponent implements OnInit, OnDestroy {
  private pacientesService = inject(PacienteService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  pacientes = signal<Paciente[]>([]);
  total = signal(0);
  pageNumber = signal(1);
  pageSize = signal(9);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);
  //Filtros
  activoFilter: boolean | null = true;
  orden: 'recientes' | 'a-z' | 'z-a' = 'recientes';
  searchText = '';
  cargando = false;

  //Menu paciente
  menuAbiertoId = signal<number | null>(null);
  private clickListener = (event: MouseEvent) => this.cerrarMenuSiFuera(event);

  //Modal confirmación
  modalAbierto = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmCallback: (() => void) | null = null;

  ngOnInit(): void {
    this.cargarPacientes();
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
  }

  cargarPacientes(): void {
    this.cargando = true;
    this.pacientesService
      .getPacientesPaged(this.pageNumber(), this.pageSize(), this.activoFilter, this.orden, this.searchText)
      //.pipe(delay(1000))
      .subscribe({
        next: (res: PacientePaginado) => {
          this.pacientes.set(res.items);
          this.total.set(res.totalCount);
          this.hasNextPage.set(res.hasNextPage);
          this.hasPreviousPage.set(res.hasPreviousPage);
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar pacientes:', err);
          this.cargando = false;
        },
      });
  }

  buscar(valor?: string): void {
    if (valor !== undefined) this.searchText = valor;
    this.pageNumber.set(1);
    this.cargarPacientes();
  }

  cambiarFiltro(activo: boolean | null): void {
    this.activoFilter = activo;
    this.pageNumber.set(1);
    this.cargarPacientes();
  }

  cambiarOrden(orden: 'recientes' | 'a-z' | 'z-a'): void {
    this.orden = orden;
    this.cargarPacientes();
  }

  siguientePagina(): void {
    if (this.hasNextPage()) {
      this.pageNumber.set(this.pageNumber() + 1);
      this.cargarPacientes();
    }
  }

  paginaAnterior(): void {
    if (this.hasPreviousPage()) {
      this.pageNumber.set(this.pageNumber() - 1);
      this.cargarPacientes();
    }
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.menuAbiertoId.set(this.menuAbiertoId() === id ? null : id);
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

  //Ver Ficha
  verFichaPaciente(paciente: Paciente) {
    this.router.navigate(['/pacientes/ficha', paciente.id], { state: { paciente } });
  }

  // Cambiar estado
  cambiarEstadoPaciente(paciente: Paciente): void {
    this.menuAbiertoId.set(null);

    const nuevoEstado = !paciente.activo;
    const accion = nuevoEstado ? 'activar' : 'inactivar';

    this.abrirModal(
      `${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${paciente.primerApellido} ${paciente.primerNombre}`,
      `¿Seguro que desea ${accion} a este paciente?`,
      () => {
        this.cargando = true;

        this.pacientesService.updatePaciente(paciente.id, { activo: nuevoEstado }).subscribe({
          next: () => {
            this.cargarPacientes();
            //this.pacientes.update((lista) => lista.filter((p) => p.id !== paciente.id));
            this.alertService.success(
              `Paciente ${nuevoEstado ? 'activado' : 'inactivado'} correctamente.`
            );
            this.cargando = false;
          },
          error: (err) => {
            this.alertService.error(err?.message || 'Error al actualizar el estado del paciente.');
            this.cargando = false;
          },
        });
      }
    );
  }

  // Eliminar
  eliminarPaciente(paciente: Paciente): void {
    this.menuAbiertoId.set(null);

    this.abrirModal(
      `Eliminar a ${paciente.primerApellido} ${paciente.primerNombre}`,
      '¿Seguro que desea eliminar de manera permanente a este paciente?',
      () => {
        this.cargando = true;
        this.pacientesService.deletePaciente(paciente.id).subscribe({
          next: () => {
            this.cargarPacientes();
            this.alertService.success('Paciente eliminado exitosamente.');
            this.cargando = false;
          },
          error: (err) => {
            this.alertService.error(err?.message || 'Error al eliminar al paciente.');
            this.cargando = false;
          },
        });
      }
    );
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
