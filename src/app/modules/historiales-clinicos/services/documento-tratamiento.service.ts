import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { DocumentoTratamientoCreate } from "../models/documento-tratamiento-create.model";
import { DocumentoTratamiento } from "../models/documento-tratamiento.model";

@Injectable({
    providedIn: 'root'
})
export class DocumentoTratamientoService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/DocumentosTratamiento`;

    // POST subir documento
    uploadDocumento(request: DocumentoTratamientoCreate): Observable<DocumentoTratamiento> {
        const formData = new FormData();
        formData.append('tratamientoId', request.tratamientoId.toString());
        formData.append('archivo', request.archivo);

        return this.http.post<DocumentoTratamiento>(this.baseUrl, formData);
    }

    // DELETE eliminar documento
    deleteDocumento(documentoId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${documentoId}`);
    }
}