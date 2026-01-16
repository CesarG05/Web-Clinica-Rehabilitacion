import { DetallePagoCreate } from "./detalle-pago-create.model";

export interface PagoCreate {
  fechaPago: string; 
  metodoPagoId: number;
  totalBruto: number;
  valorDescuento: number;
  totalNeto: number;
  usuarioId: number;
  detalles: DetallePagoCreate[];
}