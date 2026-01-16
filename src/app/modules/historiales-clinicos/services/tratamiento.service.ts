import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { TratamientoDetalle } from "../models/tratamiento-detalle.model";
import { Observable } from "rxjs";
import { Tratamiento } from "../models/tratamiento.model";
import { TratamientoCreate } from "../models/tratamiento-create.model";
import { TratamientoUpdate } from "../models/tratamiento-update.model";

@Injectable({
    providedIn: 'root'
})
export class TratamientoService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/TratamientosPaciente`;

    // GET Tratamiento Detalles
    getTratamientoDetalle(tratamientoId: number): Observable<TratamientoDetalle>{
        return this.http.get<TratamientoDetalle>(`${this.baseUrl}/${tratamientoId}`);
    }

    // GET Tratamiento Detalles
    getTratamientosPaciente(pacienteId: number): Observable<Tratamiento[]>{
        return this.http.get<Tratamiento[]>(`${this.baseUrl}/paciente/${pacienteId}`);
    }

    // POST crear tratamiento
    createTratamiento(data: TratamientoCreate): Observable<Tratamiento> {
        return this.http.post<Tratamiento>(this.baseUrl, data);
    }

    // PUT editar tratamiento
    updateTratamiento(tratamientoId: number, data: TratamientoUpdate): Observable<Tratamiento> {
        return this.http.put<Tratamiento>(`${this.baseUrl}/${tratamientoId}`, data);
    }

    // DELETE eliminar tratamiento
    deleteTratamiento(tratamientoId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${tratamientoId}`);
    }
}