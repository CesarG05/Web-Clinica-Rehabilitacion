import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicioCreate } from '../../models/servicio-create.model';
import { ServicioService } from '../../services/servicio.service';
import { Router } from '@angular/router';
import { InputFieldFormComponent } from '../../../../shared/input-field-form/input-field-form.component';
import { SelectFieldFormComponent } from '../../../../shared/select-field-form/select-field-form.component';
import { AlertService } from '../../../../shared/alert/alert.service';
import { Categoria } from '../../models/categoria.model';
import { CategoriasService } from '../../services/categoria.service';
import { AddCategoryModalComponent } from '../../../../shared/add-category-modal/add-category-modal.component';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-nuevo-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldFormComponent, SelectFieldFormComponent, AddCategoryModalComponent, BackHeaderComponent],
  templateUrl: './nuevo-servicio.component.html',
  styleUrls: ['./nuevo-servicio.component.scss']
})
export class NuevoServicioComponent implements OnInit {

  private alertService = inject(AlertService);
  private servicioService = inject(ServicioService);
  private categoriasService = inject(CategoriasService);
  private router = inject(Router);

  servicio: ServicioCreate = {
    nombre: '',
    descripcion: '',
    costo: null,
    duracionEstimada: '00:30:00',
    disponible: true,
    categoriaId: null
  };

  categorias: Categoria[] = [];
  cargandoCategorias = false;

  cargando = false;
  submitted = false;

  //Modal agregar categoria
  mostrarModalCategoria = false;

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;

    this.categoriasService.getCategorias().subscribe({
      next: (data) => {
         this.categorias = [
          { id: null, nombre: 'Sin categoría' },
          ...data
        ];
        // this.categorias = data;
        this.cargandoCategorias = false;
      },
      error: () => {
        this.alertService.error('No se pudieron cargar las categorías.');
        this.cargandoCategorias = false;
      }
    });
  }

  abrirModalCategoria() {
    this.mostrarModalCategoria = true;
  }

  cerrarModalCategoria() {
    this.mostrarModalCategoria = false;
  }

    guardarCategoria(nombre: string) {
        this.categoriasService.crearCategoria({ nombre }).subscribe({
            next: () => {
                this.alertService.success("Categoría creada");
                this.cargarCategorias(); // refresca lista
                this.mostrarModalCategoria = false;
            },
            error: () => this.alertService.error("Error al crear categoría")
        });
    }

  guardarServicio(): void {
    this.submitted = true;

    if (!this.servicio.nombre || !this.servicio.descripcion || !this.servicio.costo) {
      this.alertService.warning('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.cargando = true;

    this.servicioService.createServicio(this.servicio).subscribe({
      next: () => {
        this.cargando = false;
        this.alertService.success('Servicio registrado exitosamente.');
        this.router.navigate(['/servicios']);
      },
      error: (err) => {
        this.cargando = false;
        this.alertService.error(err?.message || 'Ocurrió un error al registrar el servicio.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/servicios']);
  }
}
