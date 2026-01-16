import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { DashboardClinica } from "../models/dashboard-clinica.model";
import { ReporteIngresos } from "../models/reporte-ingresos.model";

@Injectable({
    providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  getReporteIngresos(fechaInicio: string, fechaFin: string): Observable<ReporteIngresos> {
    return this.http.get<ReporteIngresos>(`${this.baseUrl}/Pagos/ingresos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  }

  getReporteIngresosPdf(fechaInicio: string, fechaFin: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/Pagos/ingresos/pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, 
        { responseType: 'blob' });
  }

  getDashboard(): Observable<DashboardClinica> {
    return this.http.get<DashboardClinica>(`${this.baseUrl}/Reportes`);
  }
}