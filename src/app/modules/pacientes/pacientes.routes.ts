import { Routes } from '@angular/router';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { FichaPacienteComponent } from './pages/ficha-paciente/ficha-paciente.component';
import { NuevoPacienteComponent } from './pages/nuevo-paciente/nuevo-paciente.component';
import { EditarPacienteComponent } from './pages/editar-paciente/editar-paciente.component';

export const PACIENTES_ROUTES: Routes = [
  { path: '', component: PacientesComponent },
  { path: 'ficha/:id', component: FichaPacienteComponent },
  { path: 'nuevo-paciente', component: NuevoPacienteComponent },
  { path: 'editar/:id', component: EditarPacienteComponent },
  {
    path: ':id',
    loadChildren: () =>
      import('../historiales-clinicos/historial-clinico.routes')
        .then(m => m.HISTORIAL_CLINICO_ROUTES)
  },
];