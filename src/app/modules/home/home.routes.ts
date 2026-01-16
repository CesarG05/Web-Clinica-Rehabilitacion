import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { InfoClinicaComponent } from './pages/info-clinica/info-clinica.component';

export const HOME_ROUTES: Routes = [
  { path: '', component: InicioComponent },
  { path: 'info-clinica', component: InfoClinicaComponent }
];

