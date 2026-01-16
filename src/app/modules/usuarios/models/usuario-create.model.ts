export interface UsuarioCreate {
  nombreUsuario: string;
  nombre: string;
  primerApellido: string;
  segundoApellido?: string | null;
  correoElectronico: string;
  password: string;
  rolId: number;
  acceso: boolean;
}