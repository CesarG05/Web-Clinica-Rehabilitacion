import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../services/servicio.service';
import { Servicio } from '../../models/servicio.model';
import { ServicioGrupo } from '../../models/servicio-grupo.model';
import { Router, RouterModule } from '@angular/router';
import { InputFieldSearchComponent } from '../../../../shared/input-field-search/input-field-search.component';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { AlertService } from '../../../../shared/alert/alert.service';
import { CategoriasService } from '../../services/categoria.service';
import { AddCategoryModalComponent } from '../../../../shared/add-category-modal/add-category-modal.component';
import { Categoria } from '../../models/categoria.model';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [FormsModule, RouterModule, InputFieldSearchComponent, ConfirmModalComponent,AddCategoryModalComponent, BackHeaderComponent],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss'],
})
export class ServiciosComponent implements OnInit, OnDestroy {

  private servicioService = inject(ServicioService);
  private categoriasService = inject(CategoriasService)
  private alertService = inject(AlertService);
  router = inject(Router);

  // Lista agrupada
  grupos = signal<ServicioGrupo[]>([]);

  // Control de expansión por categoría
  expanded = signal<{ [key: string]: boolean }>({});

  // Filtros
  disponibleFilter: boolean | null = true;
  searchText = '';

  // Estado
  cargando = false;

  // Menú por servicio
  menuAbiertoId = signal<number | null>(null);
  private clickListener = (event: MouseEvent) => this.cerrarMenuSiFuera(event);

  // Modal
  modalAbierto = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmCallback: (() => void) | null = null;

  //Modal agregar categoria
  mostrarModalAddCategoria = false;

  ngOnInit(): void {
    this.cargarServicios();
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
  }

  // Cargar servicios agrupados
  cargarServicios(): void {
    this.cargando = true;
    this.servicioService
      .getServicios(this.disponibleFilter, this.searchText)
      .subscribe({
        next: (res: ServicioGrupo[]) => {
          this.grupos.set(res);

          // Inicializamos los grupos cerrados al cargar
          const map: any = {};
          res.forEach(g => map[g.categoria] = true);
          this.expanded.set(map);

          this.cargando = false;
        },
        error: (err) => {
          this.alertService.error(err?.message || 'Error al cargar servicios.')
          this.cargando = false;
        },
      });
  }

  // Buscar
  buscar(valor?: string) {
    if (valor !== undefined) this.searchText = valor;
    this.cargarServicios();
  }

  // Filtro disponible
  cambiarFiltro(disponible: boolean | null) {
    this.disponibleFilter = disponible;
    this.cargarServicios();
  }

  // Expandir / Contraer categoría
  toggleCategoria(cat: string) {
    this.expanded.set({
      ...this.expanded(),
      [cat]: !this.expanded()[cat]
    });
  }

  // Menú contextual por servicio
  toggleMenu(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.menuAbiertoId.set(this.menuAbiertoId() === id ? null : id);
  }

  cerrarMenuSiFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-dropdown') && !target.closest('.menu-btn')) {
      this.menuAbiertoId.set(null);
    }
  }

  // Modal
  abrirModal(title: string, message: string, confirmCallback: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmCallback = confirmCallback;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  abrirModalAddCategoria() {
    this.mostrarModalAddCategoria = true;
  }

  cerrarModalAddCategoria() {
    this.mostrarModalAddCategoria = false;
  }

  guardarCategoria(nombre: string) {
    this.categoriasService.crearCategoria({ nombre }).subscribe({
        next: () => {
            this.alertService.success("Categoría creada");
            this.mostrarModalAddCategoria = false;
        },
        error: (err) => this.alertService.error(err?.message || 'Error al crear categoría.')
    });
  }

  categorias: Categoria[] = [];
  mostrarModalCategorias = false;

  cargarCategorias(): void {

    this.categoriasService.getCategorias().subscribe({
    next: (data) => {
        this.categorias = data;
    },
    error: (err) => {
        this.alertService.error(err?.message || 'No se pudieron cargar las categorías.');
    }
    });
  }

  abrirModalListaCategorias() {
    this.cargarCategorias();
    this.mostrarModalCategorias = true;
  }

  cerrarModalCategorias() {
    this.mostrarModalCategorias = false;
  }

  eliminarCategoria(id: number) {
    this.categoriasService.eliminarCategoria(id).subscribe({
        next: () => {
            // this.categorias = this.categorias.filter(c => c.id !== id);
            this.cerrarModalCategorias();
            this.alertService.success('Categoría eliminada correctamente.');
        },
        error: (err) => {
            this.cerrarModalCategorias();
            this.alertService.error(err?.message || 'Error al eliminar la categoría.')
        }
    });
  }

  get totalServicios(): number {
    return this.grupos().reduce((sum, g) => sum + g.servicios.length, 0);
    }

  convertirDuracionAMinutos(duracion: string): number {
    const [horas, minutos, segundos] = duracion.split(':').map(Number);
    return horas * 60 + minutos + Math.floor(segundos / 60);
    }

  // Cambiar disponibilidad
  cambiarDisponibilidad(servicio: Servicio) {
    this.menuAbiertoId.set(null);

    const nuevaDisponibilidad = !servicio.disponible;

    // Construir objeto completo para enviar al update
    const data = {
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      costo: servicio.costo,
      duracionEstimada: servicio.duracionEstimada,
      disponible: nuevaDisponibilidad,
      categoriaId: servicio.categoriaId ?? null,
    };

    this.abrirModal(
      `${nuevaDisponibilidad ? 'Cambiar a disponible' : 'Cambiar a no disponible'} el servicio`,
      `¿Desea ${nuevaDisponibilidad ? 'cambiar a disponible' : 'cambiar a no disponible'} este servicio?`,
      () => {
        this.servicioService.updateServicio(servicio.id, data).subscribe({
          next: () => {
            this.cargarServicios();
            this.alertService.success('Disponibilidad de servicio actualizada.');
          },
          error: (err) => {
            this.alertService.error(err?.message || 'Error al cambiar disponibilidad.');
          },
        });
      }
    );
  }

  // Eliminar
  eliminarServicio(servicio: Servicio) {
    this.menuAbiertoId.set(null);

    this.abrirModal(
      `Eliminar servicio`,
      '¿Está seguro de eliminar este servicio?',
      () => {
        this.servicioService.deleteServicio(servicio.id).subscribe({
          next: () => {
            this.cargarServicios();
            this.alertService.success('Servicio eliminado exitosamente.');
          },
          error: (err) => {
            this.alertService.error(err?.message || 'Error al eliminar servicio.');
          },
        });
      }
    );
  }
}
