export interface ServicioCreate {
  nombre: string;
  descripcion: string;
  costo: number | null;
  duracionEstimada: string;
  disponible: boolean;
  categoriaId: number | null;  
}
