import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { SesionesService } from "../../services/sesiones.service";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { InputFieldSearchComponent } from "../../../../shared/input-field-search/input-field-search.component";
import { BackHeaderComponent } from "../../../../shared/back-header/back-header.component";
import { CommonModule, DatePipe } from "@angular/common";
import { Sesion } from "../../models/sesion.model";
import { SesionUpdate } from "../../models/sesion-update.model";
import { AlertService } from "../../../../shared/alert/alert.service";
import { ConfirmModalComponent } from "../../../../shared/confirm-modal/confirm-modal.component";
import { SelectModalComponent } from "../../../../shared/select-modal/select-modal.component";

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, InputFieldSearchComponent, BackHeaderComponent, DatePipe, ConfirmModalComponent, SelectModalComponent
  ],
  templateUrl: './sesiones.component.html',
  styleUrls: ['./sesiones.component.scss'],
})
export class SesionesComponent implements OnInit, OnDestroy {

  private sesionService = inject(SesionesService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  sesiones = signal<Sesion[]>([]);
  total = signal(0);
  pageNumber = signal(1);
  pageSize = signal(12);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);

  searchText = '';
  estadoFilter: number | null = 1;
  orden: 'recientes' | 'antiguos' = 'recientes';
  cargando = false;

  menuAbiertoId = signal<number | null>(null);
  private clickListener = (e: MouseEvent) => this.cerrarMenuFuera(e);

  // Modal confirmacion
  modalAbierto = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmCallback: (() => void) | null = null;

  //Modal de estados
  modalEstadoAbierto = false;
  sesionSeleccionado: Sesion | null = null;
  
  // Estados de sesion
  estadosSesion = [
    { value: 1, label: 'Pendiente' },
    { value: 2, label: 'Realizado' },
    { value: 3, label: 'Cancelado' }
  ];

  ngOnInit(): void {
    this.cargarSesiones();
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
  }

  cargarSesiones(): void {
    this.cargando = true;

    this.sesionService
      .getSesionesPaged(
        this.pageNumber(),
        this.pageSize(),
        this.estadoFilter,
        this.orden,
        this.searchText
      )
      .subscribe({
        next: (res) => {
          this.sesiones.set(res.items);
          this.total.set(res.totalCount);
          this.hasNextPage.set(res.hasNextPage);
          this.hasPreviousPage.set(res.hasPreviousPage);
          this.cargando = false;
        },
        error: (err) => {
            this.alertService.error(err?.message ||'Error al cargar las sesiones.');
            this.cargando = false
        }
      });
  }

  buscar(valor?: string) {
    if (valor !== undefined) this.searchText = valor;
    this.pageNumber.set(1);
    this.cargarSesiones();
  }

  cambiarEstadoFilter(estado: number | null) {
    this.estadoFilter = estado;
    this.pageNumber.set(1);
    this.cargarSesiones();
  }

  cambiarOrden(orden: any) {
    this.orden = orden;
    this.cargarSesiones();
  }

  siguientePagina() {
    if (this.hasNextPage()) {
      this.pageNumber.set(this.pageNumber() + 1);
      this.cargarSesiones();
    }
  }

  paginaAnterior() {
    if (this.hasPreviousPage()) {
      this.pageNumber.set(this.pageNumber() - 1);
      this.cargarSesiones();
    }
  }

  toggleMenu(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.menuAbiertoId.set(this.menuAbiertoId() === id ? null : id);
  }

  cerrarMenuFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-dropdown') && !target.closest('.menu-btn')) {
      this.menuAbiertoId.set(null);
    }
  }

   // this.router.navigate(['sesion', sesion.id, 'notas'], {
    //     relativeTo: this.router.routerState.root
    // });

   
  verNotasSesion(sesion: Sesion) {
    this.router.navigate(['/sesiones', sesion.id, 'notas']);
  }

  // Cambiar estado
  cambiarEstadoSesion(sesion: Sesion) {
    this.sesionSeleccionado = sesion;
    this.modalEstadoAbierto = true;
  }

    onConfirmRol(selectedValue: number) {
        if (!this.sesionSeleccionado) return;

        const tratamientoId = this.sesionSeleccionado.tratamiento.tratamientoId;
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
            this.cargarSesiones();
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
    eliminarSesion(sesion: Sesion): void {
        this.abrirModal(
        `Eliminar sesion ${sesion.servicio.nombreServicio}`,
        '¿Seguro que desea eliminar de manera permanente esta sesión?',
        () => {
        this.cargando = true;
        this.sesionService.eliminarSesion(sesion.id).subscribe({
            next: () => {
                this.cargarSesiones();
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
}
