import { Injectable, inject} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente} from '../models/paciente.model';
import { PacientePaginado} from '../models/paciente-paginado.model';
import { PacienteCreate } from '../models/paciente-create.model';
import { PacienteUpdate } from '../models/paciente-update.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Pacientes`;
  
  //Obtener todos los pacientes
  getAllPacientes():Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  //Obtener pacientes
  getPacientesPaged(
    pageNumber: number,
    pageSize: number,
    activo?: boolean | null,
    orden?: string | null,
    search?: string | null
  ): Observable<PacientePaginado> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (activo !== null && activo !== undefined)
      params = params.set('activo', activo);

    if (orden) params = params.set('orden', orden);
    if (search) params = params.set('search', search);

    return this.http.get<PacientePaginado>(`${this.baseUrl}/paged`, { params });
  }

  getPacienteById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/${id}`);
  }

  createPaciente(paciente: PacienteCreate): Observable<Paciente> {
    return this.http.post<Paciente>(this.baseUrl, paciente);
  }

  updatePaciente(id: number, paciente: Partial<PacienteUpdate>): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.baseUrl}/${id}`, paciente);
  }

  deletePaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
