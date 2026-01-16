export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string | null;
  correoElectronico: string;
  rol: string;
  acceso: boolean;
}