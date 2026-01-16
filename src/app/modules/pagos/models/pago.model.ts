import { DetallePago } from './detalles-pago.model';
import { MetodoPago } from './metodo-pago.model';

export interface Pago {
  id: number;
  codComprobante: string;
  fechaPago: string;
  totalBruto: number;
  valorDescuento: number;
  totalNeto: number;
  metodoPago: MetodoPago;
  usuarioId: number;
  usuarioNombre: string;
  detalles: DetallePago[];
}
