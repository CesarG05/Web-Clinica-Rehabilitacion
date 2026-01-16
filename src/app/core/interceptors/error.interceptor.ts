import { HttpInterceptorFn, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err) => {
      
      if (err.error instanceof Blob) {
        return throwError(() => err);
      }

      let message = 'Ocurrió un error inesperado.';

      if (err.error?.message) {
        message = err.error.message;
      } else if (err.status === 401) {
        message = 'No autorizado o sesión expirada.';
      } else if (err.status === 404) {
        message = 'Recurso no encontrado.';
      } else if (err.status === 409) {
        message = 'El recurso ya existe.';
      } else if (err.status === 400) {
        message = 'Petición inválida.';
      }

      return throwError(() => new Error(message));
    })
  );
};