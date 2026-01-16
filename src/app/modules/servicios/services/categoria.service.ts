import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Categoria } from '../models/categoria.model';
import { CategoriaCreate } from '../models/categoria-create.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Categorias`;

  // Obtener todas las categorías
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  // Crear nueva categoría
  crearCategoria(data: CategoriaCreate): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, data);
  }

  // Editar categoría por ID
  editarCategoria(id: number, data: CategoriaCreate): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, data);
  }

  // Eliminar categoría por ID
  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}
