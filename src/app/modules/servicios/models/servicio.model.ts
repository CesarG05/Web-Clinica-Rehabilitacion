export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  costo: number;
  duracionEstimada: string;
  disponible: boolean;
  fechaRegistro: string;
  categoriaNombre: string | null;
  categoriaId?: number | null;
}