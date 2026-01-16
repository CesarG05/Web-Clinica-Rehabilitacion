export interface SesionCreate {
  pacienteId: number;
  servicioId: number;
  tratamientoId: number;
  estadoId: number;
  fechaAplicacion: string | null;
}