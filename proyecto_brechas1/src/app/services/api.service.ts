import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api/proxy/worldbank';
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor(private http: HttpClient) { }

  // ================== CONEXIÓN ==================
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/topics`).pipe( // Cambiado a /topics para una prueba más robusta
      tap(() => {
        this.connectionStatus.next(true);
        console.log('✅ Conexión a API establecida correctamente (vía backend)');
      }),
      catchError((error: HttpErrorResponse) => {
        this.connectionStatus.next(false);
        console.error('❌ Error conectando a la API (vía backend):', error.message);
        return throwError(() => new Error('Error de conexión con la API'));
      })
    );
  }

  // ================== INDICADORES ==================
  getIndicators(topicId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/topics/${topicId}/indicators`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error obteniendo indicadores:', error.message);
        return throwError(() => new Error('Error obteniendo indicadores de la API'));
      })
    );
  }

}
