import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Patient } from '../patients/patients.model';
import {
  AvailableConsultationAppointment,
  Consultation,
  CreateConsultationRequest
} from './consultations.model';

interface ApiResult<T> {
  isSuccess: boolean;
  value: T | null;
  error: string | null;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class ConsultationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPatients() {
    return this.unwrap(this.http.get<ApiResult<Patient[]>>(`${this.apiUrl}/patients`));
  }

  getHistory(patientId: number) {
    return this.unwrap(this.http.get<ApiResult<Consultation[]>>(
      `${this.apiUrl}/consultations/patients/${patientId}`));
  }

  getAvailableAppointments(patientId: number) {
    return this.unwrap(this.http.get<ApiResult<AvailableConsultationAppointment[]>>(
      `${this.apiUrl}/consultations/patients/${patientId}/available-appointments`));
  }

  create(request: CreateConsultationRequest) {
    return this.unwrap(this.http.post<ApiResult<Consultation>>(
      `${this.apiUrl}/consultations`, request));
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