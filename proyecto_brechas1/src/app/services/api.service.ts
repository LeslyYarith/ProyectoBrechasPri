import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api/proxy/worldbank';
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor(private http: HttpClient) { }

  // ================== CONEXIÓN ==================
  testConnection(): Observable<any> {
    // Cambiado a responseType: 'text' para evitar fallo de parseo
    return this.http.get(`${this.apiUrl}/test`, { responseType: 'text' }).pipe(
      tap((res: string) => {
        this.connectionStatus.next(true);
        console.log('✅ Conexión a API establecida correctamente (vía backend)');
        console.log('Respuesta recibida:', res); // ver qué devuelve realmente
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
