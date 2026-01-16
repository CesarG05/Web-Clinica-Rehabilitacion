import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputFieldFormComponent } from '../../../../shared/input-field-form/input-field-form.component';
import { ServicioService } from '../../services/servicio.service';
import { CategoriasService } from '../../services/categoria.service';
import { AlertService } from '../../../../shared/alert/alert.service';
import { SelectFieldFormComponent } from '../../../../shared/select-field-form/select-field-form.component';
import { Categoria } from '../../models/categoria.model';
import { ServicioUpdate } from '../../models/servicio-update.model';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';


@Component({
  selector: 'app-editar-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldFormComponent, SelectFieldFormComponent, BackHeaderComponent],
  templateUrl: './editar-servicio.component.html',
  styleUrls: ['./editar-servicio.component.scss']
})
export class EditarServicioComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serviciosService = inject(ServicioService);
  private categoriasService = inject(CategoriasService);
  private alertService = inject(AlertService);

  id!: number;
  cargando: boolean = true;
  submitted: boolean = false;

  categorias: Categoria[] = [];
  cargandoCategorias = false;

  servicio: ServicioUpdate = {
      nombre: '',
      descripcion: '',
      costo: null,
      duracionEstimada: '',
      disponible: true,
      categoriaId: null
    };


  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarCategorias();
    this.cargarServicio();
  }

  cargarCategorias() {
    this.categoriasService.getCategorias().subscribe({
      next: data => {
        this.categorias = [
          { id: null, nombre: 'Sin categoría' },
          ...data
        ];
      },
      error: () => this.alertService.error('Error al cargar categorías')
    });
  }

  cargarServicio() {
    this.serviciosService.getServicioById(this.id).subscribe({
      next: (data) => {
        this.servicio = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            costo: data.costo,
            duracionEstimada: data.duracionEstimada,
            disponible: data.disponible,
            categoriaId: data.categoriaId ?? null
        };
        this.cargando = false;
      },
      error: () => {
        this.alertService.error('Error al cargar el servicio');
        this.router.navigate(['/servicios']);
      }
    });
  }

  actualizar() {
    this.submitted = true;

    if (!this.servicio.nombre || !this.servicio.descripcion || !this.servicio.costo) {
      this.alertService.warning('Todos los campos obligatorios deben estar completos.');
      return;
    }

    this.cargando = true;

    this.serviciosService.updateServicio(this.id, this.servicio).subscribe({
      next: () => {
        this.cargando = false;
        this.alertService.success('Servicio actualizado exitosamente');
        this.router.navigate(['/servicios']);
      },
      error: () => {
        this.alertService.error('Error al actualizar el servicio')
        this.cargando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/servicios']);
  }
}
