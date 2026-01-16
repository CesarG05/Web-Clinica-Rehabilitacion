import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { HistorialClinico } from "../models/historial-clinico.model";

@Injectable({
    providedIn: 'root'
})
export class HistorialClinicoService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/HistorialesClinicos/paciente`;

    // GET Historial Clinico
    getHistorialClinico(pacienteId: number): Observable<HistorialClinico>{
        return this.http.get<HistorialClinico>(`${this.baseUrl}/${pacienteId}`);
    }

    // GET Historial Clinico PDF
    getHistorialClinicoPdf(pacienteId: number): Observable<Blob>{
        return this.http.get(`${this.baseUrl}/${pacienteId}/pdf`,  { responseType: 'blob' });
    }
}