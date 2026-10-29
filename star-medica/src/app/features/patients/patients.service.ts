import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreatePatientRequest, Patient } from './patients.model';

interface ApiResult<T> {
  isSuccess: boolean;
  value: T | null;
  error: string | null;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private readonly http = inject(HttpClient);
  private readonly patientsUrl = `${environment.apiUrl}/patients`;

  getPatients() {
    return this.http.get<ApiResult<Patient[]>>(this.patientsUrl).pipe(
      map((result) => {
        if (!result.isSuccess || !result.value) {
          throw new Error(result.error ?? 'No se pudo cargar la lista de pacientes.');
        }

        return result.value;
      })
    );
  }

  createPatient(patient: CreatePatientRequest) {
    return this.http.post<ApiResult<Patient>>(this.patientsUrl, patient).pipe(
      map((result) => {
        if (!result.isSuccess || !result.value) {
          throw new Error(result.error ?? 'No se pudo registrar el paciente.');
        }

        return result.value;
      })
    );
  }
}
