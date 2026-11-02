import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Patient } from '../patients/patients.model';
import {
  AdministerVaccineRequest,
  CreateVaccineRequest,
  PatientVaccination,
  Vaccine
} from './vaccines.model';

interface ApiResult<T> {
  isSuccess: boolean;
  value: T | null;
  error: string | null;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class VaccinesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCatalog() {
    return this.unwrap(this.http.get<ApiResult<Vaccine[]>>(`${this.apiUrl}/vaccines`));
  }

  getPatients() {
    return this.unwrap(this.http.get<ApiResult<Patient[]>>(`${this.apiUrl}/patients`));
  }

  getPatientHistory(patientId: number) {
    return this.unwrap(this.http.get<ApiResult<PatientVaccination[]>>(
      `${this.apiUrl}/vaccines/patients/${patientId}/vaccinations`));
  }

  createVaccine(request: CreateVaccineRequest) {
    return this.unwrap(this.http.post<ApiResult<Vaccine>>(`${this.apiUrl}/vaccines`, request));
  }

  administer(patientId: number, request: AdministerVaccineRequest) {
    return this.unwrap(this.http.post<ApiResult<PatientVaccination>>(
      `${this.apiUrl}/vaccines/patients/${patientId}/vaccinations`, request));
  }

  private unwrap<T>(response: Observable<ApiResult<T>>) {
    return response.pipe(
      map((result) => {
        if (!result.isSuccess || result.value === null) {
          throw new Error(result.error ?? 'La operación no se pudo completar.');
        }

        return result.value;
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          const body = error.error as { detail?: unknown; title?: unknown; error?: unknown } | null;
          const message = body?.detail ?? body?.title ?? body?.error;
          if (typeof message === 'string') {
            return throwError(() => new Error(message));
          }
        }

        return throwError(() => error);
      })
    );
  }
}