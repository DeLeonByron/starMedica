import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Appointment,
  AppointmentOptions,
  AppointmentStatus,
  CreateAppointmentRequest
} from './appointments.model';

interface ApiResult<T> {
  isSuccess: boolean;
  value: T | null;
  error: string | null;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly appointmentsUrl = `${environment.apiUrl}/appointments`;

  getAppointments(from: string, to: string) {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.unwrap(this.http.get<ApiResult<Appointment[]>>(this.appointmentsUrl, { params }));
  }

  getOptions() {
    return this.unwrap(this.http.get<ApiResult<AppointmentOptions>>(`${this.appointmentsUrl}/options`));
  }

  createAppointment(request: CreateAppointmentRequest) {
    return this.unwrap(this.http.post<ApiResult<Appointment>>(this.appointmentsUrl, request));
  }

  changeStatus(id: number, status: AppointmentStatus) {
    return this.unwrap(this.http.patch<ApiResult<Appointment>>(
      `${this.appointmentsUrl}/${id}/status`, { status }));
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