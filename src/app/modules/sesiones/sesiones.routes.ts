import { Routes } from '@angular/router';
import { NuevaSesionComponent } from './pages/nueva-sesion/nueva-sesion.component';
import { SesionesComponent } from './pages/sesiones/sesiones.component';
import { NotasSesionComponent } from './pages/notas-sesion/notas-sesion.component';

export const SESIONES_ROUTES: Routes = [
  { path: '', component: SesionesComponent },
  { path: 'nueva-sesion', component: NuevaSesionComponent },
  { path: ':id/notas', component: NotasSesionComponent }
];