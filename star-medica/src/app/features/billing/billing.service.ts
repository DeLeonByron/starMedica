import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BillingDraft, BillingDraftPage, CreateBillingDraftRequest } from './billing.model';

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

  getDrafts(search: string, pageNumber: number, pageSize: number): Observable<BillingDraftPage> {
    return this.unwrap(this.http.get<ApiResult<BillingDraftPage>>(this.draftsUrl, {
      params: { search, pageNumber, pageSize }
    }));
  }

  createDraft(request: CreateBillingDraftRequest): Observable<BillingDraft> {
    return this.unwrap(this.http.post<ApiResult<BillingDraft>>(this.draftsUrl, request));
  }

  updateDraft(id: number, request: CreateBillingDraftRequest): Observable<BillingDraft> {
    return this.unwrap(this.http.put<ApiResult<BillingDraft>>(`${this.draftsUrl}/${id}`, request));
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
