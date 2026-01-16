export interface LoginResponse {
  token: string;
  id: number;
  nombreUsuario: string;
  nombre: string;
  primerApellido: string;
  rol: string;
  correoElectronico: string;
}

export interface InfoUserResponse {
  id: number;
  nombreUsuario: string;
  nombre: string;
  primerApellido: string;
  rol: string;
  correoElectronico: string;
}