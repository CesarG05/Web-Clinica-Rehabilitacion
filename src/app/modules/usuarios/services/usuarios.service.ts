import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { UsuarioPaginado } from '../models/usuario-paginado.model';
import { UsuarioCreate } from '../models/usuario-create.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Usuarios`;

  // Obtener usuarios con paginación, acceso, orden y búsqueda
  getUsuarios(
    pageNumber: number,
    pageSize: number,
    acceso?: boolean | null,
    orden?: 'recientes' | 'a-z' | 'z-a',
    search?: string
  ): Observable<UsuarioPaginado> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (acceso !== undefined && acceso !== null) params = params.set('acceso', acceso);
    if (orden) params = params.set('orden', orden);
    if (search) params = params.set('search', search);

    return this.http.get<UsuarioPaginado>(`${this.baseUrl}/paged`, { params });
  }

  // Agregar usuario
  addUsuario(usuario: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  // Actualizar rol
  updateRol(id: number, nuevoRolId: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/rol/${id}`, { rolId: nuevoRolId });
  }

  // Actualizar acceso (activar/desactivar usuario)
  updateAcceso(id: number, acceso: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/acceso/${id}`, { acceso });
  }

  // Eliminar usuario
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
