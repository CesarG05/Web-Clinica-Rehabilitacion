export interface TratamientoUpdate {
  padecimiento: string;
  tratamiento: string;
  fechaInicioTratamiento: string;
  fechaFinTratamiento?: string | null;
  observaciones: string;
}