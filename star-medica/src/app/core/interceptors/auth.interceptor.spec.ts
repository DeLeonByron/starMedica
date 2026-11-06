import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  const authResponse: AuthResponse = {
    accessToken: 'refreshed-access-token',
    expiresAt: '2026-11-06T02:00:00Z',
    user: {
      id: 1,
      fullName: 'Usuario de prueba',
      email: 'usuario@example.com',
      photoUrl: null,
      roles: ['Médico']
    }
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('uses one refresh request for concurrent 401 responses and retries both requests', () => {
    sessionStorage.setItem('sm_access_token', 'expired-access-token');
    const results: string[] = [];

    http.get<{ result: string }>(`${environment.apiUrl}/patients`).subscribe((response) => {
      results.push(response.result);
    });
    http.get<{ result: string }>(`${environment.apiUrl}/appointments`).subscribe((response) => {
      results.push(response.result);
    });

    const patientRequest = httpTestingController.expectOne(`${environment.apiUrl}/patients`);
    const appointmentRequest = httpTestingController.expectOne(`${environment.apiUrl}/appointments`);
    expect(patientRequest.request.headers.get('Authorization')).toBe('Bearer expired-access-token');
    expect(appointmentRequest.request.headers.get('Authorization')).toBe('Bearer expired-access-token');

    patientRequest.flush({}, { status: 401, statusText: 'Unauthorized' });
    appointmentRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequests = httpTestingController.match(`${environment.apiUrl}/auth/refresh`);
    expect(refreshRequests.length).toBe(1);
    expect(refreshRequests[0].request.withCredentials).toBeTrue();
    refreshRequests[0].flush(authResponse);

    const retriedPatientRequest = httpTestingController.expectOne(`${environment.apiUrl}/patients`);
    const retriedAppointmentRequest = httpTestingController.expectOne(`${environment.apiUrl}/appointments`);
    expect(retriedPatientRequest.request.headers.get('Authorization')).toBe('Bearer refreshed-access-token');
    expect(retriedAppointmentRequest.request.headers.get('Authorization')).toBe('Bearer refreshed-access-token');

    retriedPatientRequest.flush({ result: 'patients loaded' });
    retriedAppointmentRequest.flush({ result: 'appointments loaded' });

    expect(results).toEqual(['patients loaded', 'appointments loaded']);
  });

  it('retries a late 401 with the token already refreshed by another request', () => {
    sessionStorage.setItem('sm_access_token', 'expired-access-token');
    const results: string[] = [];

    http.get<{ result: string }>(`${environment.apiUrl}/patients`).subscribe((response) => {
      results.push(response.result);
    });
    http.get<{ result: string }>(`${environment.apiUrl}/appointments`).subscribe((response) => {
      results.push(response.result);
    });

    httpTestingController.expectOne(`${environment.apiUrl}/patients`).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );
    httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`).flush(authResponse);

    httpTestingController.expectOne(`${environment.apiUrl}/appointments`).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );
    httpTestingController.expectNone(`${environment.apiUrl}/auth/refresh`);

    const retriedAppointmentRequest = httpTestingController.expectOne(`${environment.apiUrl}/appointments`);
    expect(retriedAppointmentRequest.request.headers.get('Authorization')).toBe('Bearer refreshed-access-token');
    retriedAppointmentRequest.flush({ result: 'appointments loaded' });

    const retriedPatientRequest = httpTestingController.expectOne(`${environment.apiUrl}/patients`);
    retriedPatientRequest.flush({ result: 'patients loaded' });

    expect(results).toEqual(['appointments loaded', 'patients loaded']);
  });

  it('does not retry or refresh a rejected auth endpoint', () => {
    sessionStorage.setItem('sm_access_token', 'expired-access-token');
    const errors: number[] = [];

    http.post(`${environment.apiUrl}/auth/refresh`, {}).subscribe({
      error: (error: { status: number }) => errors.push(error.status)
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`);
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(errors).toEqual([401]);
    httpTestingController.expectNone(`${environment.apiUrl}/auth/refresh`);
  });

  it('keeps the refreshed session when the retried request fails with a non-auth error', () => {
    sessionStorage.setItem('sm_access_token', 'expired-access-token');
    const errors: number[] = [];

    http.get(`${environment.apiUrl}/patients`).subscribe({
      error: (error: { status: number }) => errors.push(error.status)
    });

    httpTestingController.expectOne(`${environment.apiUrl}/patients`).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );
    httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`).flush(authResponse);

    const retriedRequest = httpTestingController.expectOne(`${environment.apiUrl}/patients`);
    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer refreshed-access-token');
    retriedRequest.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(errors).toEqual([403]);
    expect(sessionStorage.getItem('sm_access_token')).toBe(authResponse.accessToken);
  });

  it('expires the session when the refresh request fails', () => {
    sessionStorage.setItem('sm_access_token', 'expired-access-token');
    const errors: number[] = [];

    http.get(`${environment.apiUrl}/patients`).subscribe({
      error: (error: { status: number }) => errors.push(error.status)
    });

    httpTestingController.expectOne(`${environment.apiUrl}/patients`).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );
    httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`).flush(
      {},
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(errors).toEqual([401]);
    expect(sessionStorage.getItem('sm_access_token')).toBeNull();
  });
});
