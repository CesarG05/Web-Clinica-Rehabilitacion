import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { InfoClinica } from "../models/info-clinica.model";
import { InfoClinicaUpdate } from "../models/info-clinica-update.model";

@Injectable({
  providedIn: 'root'
})
export class InfoClinicaService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/configuracion-clinica`;

  getInfoClinica(): Observable<InfoClinica> {
    return this.http.get<InfoClinica>(this.baseUrl);
  }

  updateInfoClinica(data: InfoClinicaUpdate): Observable<InfoClinica> {
    const formData = new FormData();

    if (data.nombreClinica) formData.append('nombreClinica', data.nombreClinica);
    if (data.rfc) formData.append('rfc', data.rfc);
    if (data.direccion) formData.append('direccion', data.direccion);
    if (data.telefono) formData.append('telefono', data.telefono);
    if (data.logo) formData.append('logo', data.logo);

    return this.http.put<InfoClinica>(this.baseUrl, formData);
  }
}
