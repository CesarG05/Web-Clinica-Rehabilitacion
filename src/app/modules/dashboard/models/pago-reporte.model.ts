export interface PagoReporte {
  pagoId: number;
  fechaPago: string;  
  totalNeto: number;
  metodoPago: MetodoPago;
}

export enum MetodoPago {
  Efectivo = 'Efectivo',
  Tarjeta = 'Tarjeta'
}
