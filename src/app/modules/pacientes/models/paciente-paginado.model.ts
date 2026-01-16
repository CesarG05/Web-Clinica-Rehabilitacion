import { Paciente } from './paciente.model';

export interface PacientePaginado {
  items: Paciente[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}


// export interface PagedResponse<T> {
//   items: T[];
//   totalCount: number;
//   pageNumber: number;
//   pageSize: number;
//   totalPages: number;
//   hasPreviousPage: boolean;
//   hasNextPage: boolean;
// }