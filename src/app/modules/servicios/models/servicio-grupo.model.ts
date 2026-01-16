import { Servicio } from './servicio.model';

export interface ServicioGrupo {
  categoria: string;         
  servicios: Servicio[]; 
}
