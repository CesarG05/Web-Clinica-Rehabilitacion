import { Routes } from '@angular/router';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { NuevoServicioComponent } from './pages/nuevo-servicio/nuevo-servicio.component';
import { EditarServicioComponent } from './pages/editar-servicio/editar-servicio.component';

export const SERVICIOS_ROUTES: Routes = [
  { path: '', component: ServiciosComponent },
  { path: 'nuevo-servicio', component: NuevoServicioComponent },
  { path: 'editar/:id', component: EditarServicioComponent }
];