export interface DetallePagoCreate {
  servicioId: number;
  servicioNombre?: string | null;
  cantidad: number;
  montoUnidad: number;
}
