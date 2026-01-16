import { Sesion } from "./sesion.model";

export interface SesionesPaginado {
  items: Sesion[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}