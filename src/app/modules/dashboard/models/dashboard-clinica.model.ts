import { ServicioMasUsado } from "./servicio-mas-usado.model";

export interface DashboardClinica {
  pacientesActivos: number;
  pacientesInactivos: number;
  nuevosPacientesHoy: number;
  nuevosPacientesMes: number;

  serviciosDisponibles: number;
  serviciosNoDisponibles: number;
  serviciosMasUsadosMes: ServicioMasUsado[];

  sesionesHoy: number;
  sesionesPendientes: number;
  sesionesCompletadas: number;
  sesionesCanceladas: number;
}
