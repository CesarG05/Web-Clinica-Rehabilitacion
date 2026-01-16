import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { NotaSesionCreate } from "../models/nota-sesion-create.model";
import { NotaSesion } from "../models/nota-sesion.model";

@Injectable({
    providedIn: 'root'
})
export class NotaSesionService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/NotasSesion`;

    // GET notas de una sesion
    getNotasSesion(sesionId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/sesion/${sesionId}`);
    }

    // POST crear nota
    createNotaSesion(data: NotaSesionCreate): Observable<NotaSesion> {
        return this.http.post<NotaSesion>(this.baseUrl, data);
    }

    //DELETE eliminar nota
    deleteNotaSesion(sesionId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${sesionId}`);
    }
}