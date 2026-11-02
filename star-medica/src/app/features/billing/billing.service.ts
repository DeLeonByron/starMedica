import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BillingDraft, CreateBillingDraftRequest } from './billing.model';

interface ApiResult<T> {
  isSuccess: boolean;
  value: T | null;
  error: string | null;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly draftsUrl = `${environment.apiUrl}/billing/drafts`;

  getDrafts(): Observable<BillingDraft[]> {
    return this.unwrap(this.http.get<ApiResult<BillingDraft[]>>(this.draftsUrl));
  }

  createDraft(request: CreateBillingDraftRequest): Observable<BillingDraft> {
    return this.unwrap(this.http.post<ApiResult<BillingDraft>>(this.draftsUrl, request));
  }

  private unwrap<T>(response: Observable<ApiResult<T>>): Observable<T> {
    return response.pipe(
      map((result) => {
        if (!result.isSuccess || result.value === null) {
          throw new Error(result.error ?? 'La operación no se pudo completar.');
        }

        return result.value;
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          const message = this.responseMessage(error.error);
          if (message) {
            return throwError(() => new Error(message));
          }
        }

        return throwError(() => error);
      })
    );
  }

  private responseMessage(body: unknown): string | null {
    if (typeof body !== 'object' || body === null) {
      return null;
    }

    for (const key of ['detail', 'title', 'error']) {
      const value = (body as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        return value;
      }
    }

    return null;
  }
}
