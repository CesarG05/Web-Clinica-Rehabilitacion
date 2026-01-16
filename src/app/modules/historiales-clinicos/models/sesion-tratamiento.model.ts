import { EstadoSesion } from "../../sesiones/models/estado-sesion.model";
import { NotaSesion } from "../../sesiones/models/nota-sesion.model";
import { ServicioSesion } from "../../sesiones/models/sesion.model";

export interface SesionTratamiento {
  id: number;
  pacienteId: number;
  tratamientoId: number | null;
  servicio: ServicioSesion;
  estado: EstadoSesion;
  fechaRegistro: string;     
  fechaAplicacion: string | null;   
  notas: NotaSesion[];
}