import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.model';
import { UsuarioPaginado } from '../../models/usuario-paginado.model';
import { InputFieldSearchComponent } from '../../../../shared/input-field-search/input-field-search.component';
import { delay } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { SelectModalComponent } from '../../../../shared/select-modal/select-modal.component';
import { AlertService } from '../../../../shared/alert/alert.service';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, InputFieldSearchComponent, RouterModule, ConfirmModalComponent, SelectModalComponent, BackHeaderComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit, OnDestroy {
  private usuariosService = inject(UsuariosService);
  private alertService = inject(AlertService);

  usuarios = signal<Usuario[]>([]);
  total = signal(0);
  pageNumber = signal(1);
  pageSize = signal(9);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);
  //Filtros
  accesoFilter: boolean | null = true;
  orden: 'recientes' | 'a-z' | 'z-a' = 'recientes';
  searchText = '';
  //Loader
  cargando = false;
  //Menu usuario
  menuAbiertoId = signal<number | null>(null);
  private clickListener = (event: MouseEvent) => this.cerrarMenuSiFuera(event);
  // Modal confirmacion
  modalAbierto = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmCallback: (() => void) | null = null;
  //Modal de roles
  modalRolAbierto = false;
  usuarioSeleccionado: Usuario | null = null;

  rolesDisponibles = [
    { value: 1, label: 'Administrador' },
    { value: 2, label: 'Fisioterapeuta' },
    { value: 3, label: 'Recepcionista' }
  ];
 
  ngOnInit(): void {
    this.cargarUsuarios();
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuariosService
      .getUsuarios(
        this.pageNumber(),
        this.pageSize(),
        this.accesoFilter,
        this.orden,
        this.searchText,
      )
      //.pipe(delay(1000))
      .subscribe({
        next: (res: UsuarioPaginado) => {
          this.usuarios.set(res.items);
          this.total.set(res.totalCount);
          this.hasNextPage.set(res.hasNextPage);
          this.hasPreviousPage.set(res.hasPreviousPage);
          this.cargando = false;
        },
        error: (err) => {
            this.cargando = false;
        }
      });
  }

  buscar(valor?: string): void {
    if (valor !== undefined) {
      this.searchText = valor;
    }
    this.pageNumber.set(1);
    this.cargarUsuarios();
  }

  cambiarFiltro(acceso: boolean | null): void {
    this.accesoFilter = acceso;
    this.pageNumber.set(1);
    this.cargarUsuarios();
  }

  cambiarOrden(orden: 'recientes' | 'a-z' | 'z-a'): void {
    this.orden = orden;
    this.cargarUsuarios();
  }

  siguientePagina(): void {
    if (this.hasNextPage()) {
      this.pageNumber.set(this.pageNumber() + 1);
      this.cargarUsuarios();
    }
  }

  paginaAnterior(): void {
    if (this.hasPreviousPage()) {
      this.pageNumber.set(this.pageNumber() - 1);
      this.cargarUsuarios();
    }
  }

  // Acciones del menu de cada card
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

  // Cambiar acceso (bloquear/habilitar usuario)
  cambiarAcceso(usuario: Usuario): void {
    const nuevoEstado = !usuario.acceso;
    this.menuAbiertoId.set(null);

    this.abrirModal(
      `${ usuario.acceso ? 'Bloquear a' : 'Habilitar a' } ${usuario.primerApellido} ${usuario.nombre}`,
      `¿Seguro que desea ${ usuario.acceso ? 'bloquear' : 'habilitar' } el acceso a este usuario?`,
      () => {
      this.cargando = true;
      this.usuariosService.updateAcceso(usuario.id, nuevoEstado).subscribe({
        next: () => {
          this.cargarUsuarios();
          //this.usuarios.update((lista) => lista.filter((u) => u.id !== usuario.id));
          this.alertService.success( `Usuario ${ nuevoEstado ? 'habilitado' : 'bloqueado' } exitosamente`);
          this.cargando = false;
        },
        error: (err) => {
          this.alertService.error(err?.message || 'Error al cambiar el acceso al usuario.');
          this.cargando = false;
        },
      });
    });
  }

  // Eliminar usuario
  eliminarUsuario(usuario: Usuario): void {
    this.menuAbiertoId.set(null);

    this.abrirModal(
      `Eliminar a ${usuario.primerApellido} ${usuario.nombre}`,
      '¿Seguro que desea eliminar de manera permanente a este usuario?',
      () => {
      this.cargando = true;
      this.usuariosService.deleteUsuario(usuario.id).subscribe({
        next: () => {
          this.cargarUsuarios();
          //this.usuarios.update((lista) => lista.filter((u) => u.id !== usuario.id));
          this.alertService.success('Usuario eliminado exitosamente');
          this.cargando = false;
        },
        error: (err) => {
          this.alertService.error(err?.message || 'Error al eliminar al usuario eliminado.');
          this.cargando = false;
        },
      });
    });
  }

  // Cambiar rol
  cambiarRol(usuario: Usuario) {
    this.menuAbiertoId.set(null);
    this.usuarioSeleccionado = usuario;
    this.modalRolAbierto = true;
  }

  onConfirmRol(selectedValue: number) {
    if (!this.usuarioSeleccionado) return;
    this.cargando = true;

    this.usuariosService.updateRol(this.usuarioSeleccionado.id, selectedValue).subscribe({
      next: () => {
         this.cargarUsuarios();
         this.alertService.success('Cambio de rol exitoso.');
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al cambiar de rol al usuario.');
        this.cargando = false
      }
    });

    this.modalRolAbierto = false;
    this.usuarioSeleccionado = null;
  }
}
