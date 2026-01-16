import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioCreate } from '../../models/usuario-create.model';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { InputFieldFormComponent } from '../../../../shared/input-field-form/input-field-form.component';
import { AlertService } from '../../../../shared/alert/alert.service';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-usuario-create',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldFormComponent, BackHeaderComponent],
  templateUrl: './nuevo-usuario.component.html',
  styleUrls: ['./nuevo-usuario.component.scss']
})
export class NuevoUsuarioComponent {
  private alertService = inject(AlertService);
  private usuariosService = inject (UsuariosService);
  private router = inject(Router);

  usuario: UsuarioCreate = {
    nombreUsuario: '',
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    correoElectronico: '',
    password: '',
    rolId: 1,
    acceso: true
  };

  roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Fisioterapeuta' },
    { id: 3, nombre: 'Recepcionista' },
  ];

  guardarUsuario(): void {
    if (!this.usuario.nombre || !this.usuario.primerApellido || !this.usuario.correoElectronico) {
      this.alertService.warning('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.usuariosService.addUsuario(this.usuario).subscribe({
      next: () => {
        this.alertService.success('Usuario creado exitosamente.');
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Ocurrió un error al crear el usuario.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }
}
