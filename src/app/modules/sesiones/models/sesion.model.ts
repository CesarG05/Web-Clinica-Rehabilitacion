import { EstadoSesion } from "./estado-sesion.model";
import { NotaSesion } from "./nota-sesion.model";

export interface Sesion {
  id: number;
  paciente: PacienteSesion;
  servicio: ServicioSesion;
  estado: EstadoSesion;
  tratamiento: TratamientoSesion;
  fechaRegistro: string;
  fechaAplicacion: string | null;
  notas: NotaSesion[];
}

interface PacienteSesion {
  pacienteId: number;
  nombrePaciente: string;
}

export interface ServicioSesion {
  servicioId: number;
  nombreServicio: string;
}

interface TratamientoSesion {
  tratamientoId: number;
  nombreTratamiento: string;
}
