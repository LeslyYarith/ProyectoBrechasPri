// src/app/services/prioritization.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PriorityRegion {
  countryCode: string;
  countryName: string;
  currentValue: number;
  growthRate: number;
  priorityScore: number;
  latestYear: number;
}

@Injectable({
  providedIn: 'root'
})
export class PrioritizationService {
  private apiUrl = 'http://localhost:8080/api/prioritization';

  constructor(private http: HttpClient) { }

  getPriorityRegions(
    indicator: string,
    minYear: number = 2010,
    maxYear: number = 2025
  ): Observable<PriorityRegion[]> {
    let params = new HttpParams()
      .set('indicator', indicator)
      .set('minYear', minYear.toString())
      .set('maxYear', maxYear.toString());

    return this.http.get<PriorityRegion[]>(`${this.apiUrl}/regions`, { params });
  }

  getAvailableIndicators(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/indicators`);
  }
}
