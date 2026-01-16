import { Usuario } from './usuario.model';

export interface UsuarioPaginado {
  items: Usuario[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
