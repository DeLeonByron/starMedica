import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateMedicineRequest,
  DispenseStockRequest,
  Medicine,
  MedicineBatch,
  PharmacyPatientOption,
  ReceiveStockRequest,
  StockMovement
} from './pharmacy.model';

interface ApiResult<T> {
  isSuccess: boolean;
  value: T | null;
  error: string | null;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private readonly http = inject(HttpClient);
  private readonly pharmacyUrl = `${environment.apiUrl}/pharmacy`;

  getDashboardData() {
    return forkJoin({
      medicines: this.unwrap(this.http.get<ApiResult<Medicine[]>>(`${this.pharmacyUrl}/medicines`)),
      stock: this.unwrap(this.http.get<ApiResult<MedicineBatch[]>>(`${this.pharmacyUrl}/stock`)),
      movements: this.unwrap(this.http.get<ApiResult<StockMovement[]>>(`${this.pharmacyUrl}/movements`)),
      patients: this.unwrap(this.http.get<ApiResult<PharmacyPatientOption[]>>(`${this.pharmacyUrl}/patients`))
    });
  }

  createMedicine(request: CreateMedicineRequest) {
    return this.unwrap(this.http.post<ApiResult<Medicine>>(`${this.pharmacyUrl}/medicines`, request));
  }

  receiveStock(request: ReceiveStockRequest) {
    return this.unwrap(this.http.post<ApiResult<boolean>>(`${this.pharmacyUrl}/stock/receipts`, request));
  }

  dispense(request: DispenseStockRequest) {
    return this.unwrap(this.http.post<ApiResult<boolean>>(`${this.pharmacyUrl}/stock/dispenses`, request));
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