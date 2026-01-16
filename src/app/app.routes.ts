import { Routes } from '@angular/router';
import { authGuard } from './modules/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
  },
  {
    path: 'pacientes',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES)
  },
  {
    path: 'servicios',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/servicios/servicios.routes').then(m => m.SERVICIOS_ROUTES)
  },
  {
    path: 'sesiones',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/sesiones/sesiones.routes').then(m => m.SESIONES_ROUTES)
  },
  {
    path: 'pagos',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/pagos/pagos.routes').then(m => m.PAGOS_ROUTES)
  },
  {
    path: 'reportes',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/dashboard/reporte.routes').then(m => m.REPORTES_ROUTES)
  },
  { path: '**', redirectTo: 'login' }
];