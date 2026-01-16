import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { PagoCreate } from "../models/pago-create.model";
import { Pago } from "../models/pago.model";
import { Observable } from "rxjs";

@Injectable ({
    providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Pagos`;

  createPago(pago: PagoCreate): Observable<Pago> {
    return this.http.post<Pago>(this.baseUrl, pago);
  }

  getTicketPago(pagoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${pagoId}/ticket`,  { responseType: 'blob' });
  }
}