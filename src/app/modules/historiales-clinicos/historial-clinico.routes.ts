import { Routes } from '@angular/router';
import { HistorialClinicoComponent } from './pages/historial-clinico/historial-clinico.component';
import { TratamientoComponent } from './pages/tratamiento/tratamiento.component';
import { NuevoTratamientoComponent } from './pages/nuevo-tratamiento/nuevo-tratamiento.component';

export const HISTORIAL_CLINICO_ROUTES: Routes = [
  {
    path: 'historial-clinico',
    component: HistorialClinicoComponent
  },
  {
    path: 'tratamientos/nuevo-tratamiento',
    component: NuevoTratamientoComponent
  },
  {
    path: 'tratamientos/:idTratamiento',
    component: TratamientoComponent
  }
];