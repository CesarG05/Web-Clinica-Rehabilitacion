import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { SesionesPaginado } from "../models/sesiones-paginado.model";
import { SesionCreate } from "../models/sesion-create.model";
import { Sesion } from "../models/sesion.model";
import { SesionUpdate } from "../models/sesion-update.model";

@Injectable({
    providedIn: 'root'
})
export class SesionesService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/Sesiones`;

    //GET Obtener sesiones
    getSesionesPaged(pageNumber: number, pageSize: number, estado?: number | null, orden?: string | null, search?: string | null)
    : Observable<SesionesPaginado> {
        let params = new HttpParams()
        .set('pageNumber', pageNumber)
        .set('pageSize', pageSize);

        //if (estado) params = params.set('estado', estado);
        if (estado !== null && estado !== undefined) params = params.set('estado', estado);
        if (orden) params = params.set('orden', orden);
        if (search) params = params.set('search', search);

        return this.http.get<SesionesPaginado>(`${this.baseUrl}/paged`, { params });
    }

    // GET Sesión por ID
    getSesionById(sesionId: number): Observable<Sesion> {
        return this.http.get<Sesion>(`${this.baseUrl}/${sesionId}`);
    }

    // POST crear sesion
    crearSesion(data: SesionCreate): Observable<Sesion> {
        return this.http.post<Sesion>(this.baseUrl, data);
    }

    // PUT actualizar sesion
    actualizarSesion(sesionId: number, data: SesionUpdate): Observable<Sesion> {
        return this.http.put<Sesion>(`${this.baseUrl}/${sesionId}`, data);
    }

    // DELETE Eliminar sesion 
    eliminarSesion(sesionId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${sesionId}`);
    }
}