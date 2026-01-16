export interface Tratamiento {
  tratamientoId: number;
  pacienteId: number;
  padecimiento: string;
  tratamiento: string;
  fechaInicioTratamiento: string;
  fechaFinTratamiento: string | null;
  observaciones: string;
}
