export interface Paciente {
  id: number;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  fechaNacimiento: string;
  sexo: string;
  sexoId?: number | null;
  direccion: string;
  telefono: string;
  correoElectronico: string;
  activo: boolean;
  fechaRegistro: string;
}