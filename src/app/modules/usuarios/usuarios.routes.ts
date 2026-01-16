import { Routes } from '@angular/router';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './pages/nuevo-usuario/nuevo-usuario.component';

export const USUARIOS_ROUTES: Routes = [
  { path: '', component: UsuariosComponent },
  { path: 'nuevo-usuario', component: NuevoUsuarioComponent }
];
