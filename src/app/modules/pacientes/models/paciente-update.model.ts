export interface PacienteUpdate {
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  fechaNacimiento?: string | null;
  sexoId?: number | null;
  direccion?: string | null;
  telefono?: string | null;
  correoElectronico?: string | null;
  activo?: boolean | null;
}