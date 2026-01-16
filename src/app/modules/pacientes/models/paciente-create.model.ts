export interface PacienteCreate {
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  fechaNacimiento: string;
  sexoId: number;
  direccion: string;
  telefono: string;
  correoElectronico?: string | null;
}