import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../models/servicio.model';
import { ServicioGrupo } from '../models/servicio-grupo.model';
import { ServicioCreate } from '../models/servicio-create.model';
import { ServicioUpdate } from '../models/servicio-update.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Servicio`;

  // GET servicios agrupados por categoría 
  getServicios(disponible?: boolean | null, search?: string | null): Observable<ServicioGrupo[]> {
    let params = new HttpParams();

    if (disponible !== null && disponible !== undefined)
      params = params.set('disponible', disponible);

    if (search)
      params = params.set('search', search);

    return this.http.get<ServicioGrupo[]>(this.baseUrl, { params });
  }

  // GET un servicio por ID
  getServicioById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.baseUrl}/${id}`);
  }

  // POST crear servicio
  createServicio(data: ServicioCreate): Observable<Servicio> {
    return this.http.post<Servicio>(this.baseUrl, data);
  }

  // PUT editar servicio
  updateServicio(id: number, data: ServicioUpdate): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.baseUrl}/${id}`, data);
  }

  // DELETE eliminar servicio
  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
