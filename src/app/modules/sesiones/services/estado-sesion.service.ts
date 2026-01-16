import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { EstadoSesion } from "../models/estado-sesion.model";

@Injectable({
    providedIn: 'root'
})
export class EstadoSesionService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/EstadosSesion`;

    getEstadosSesion(): Observable<EstadoSesion[]> {
        return this.http.get<EstadoSesion[]>(this.baseUrl)
    }
}