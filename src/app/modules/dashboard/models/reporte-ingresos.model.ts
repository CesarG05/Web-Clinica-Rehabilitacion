import { PagoReporte } from "./pago-reporte.model";

export interface ReporteIngresos {
  periodo: string;

  fechaInicio: string; 
  fechaFin: string;   

  totalIngresos: number;
  totalDescuentos: number;
  totalPagos: number;

  pagos: PagoReporte[];
}
