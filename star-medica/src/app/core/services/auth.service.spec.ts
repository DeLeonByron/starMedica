import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
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
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    auth = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
  });

  it('restores a valid cookie session even when session storage has no access token', () => {
    let isAuthenticated: boolean | undefined;

    auth.ensureSession().subscribe((result) => {
      isAuthenticated = result;
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    request.flush(authResponse);

    expect(isAuthenticated).toBeTrue();
    expect(auth.user()).toEqual(authResponse.user);
    expect(auth.getToken()).toBe(authResponse.accessToken);
  });

  it('rejects restoration when the refresh cookie is invalid', () => {
    sessionStorage.setItem('sm_access_token', 'expired-access-token');
    let isAuthenticated: boolean | undefined;

    auth.ensureSession().subscribe((result) => {
      isAuthenticated = result;
    });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(request.request.withCredentials).toBeTrue();
    request.flush(
      { title: 'No hay una sesión activa.' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(isAuthenticated).toBeFalse();
    expect(auth.user()).toBeNull();
    expect(sessionStorage.getItem('sm_access_token')).toBeNull();
  });

  it('shares one refresh request between concurrent callers', () => {
    const responses: AuthResponse[] = [];

    auth.refreshSession().subscribe((response) => responses.push(response));
    auth.refreshSession().subscribe((response) => responses.push(response));

    const requests = httpTestingController.match(`${environment.apiUrl}/auth/refresh`);
    expect(requests.length).toBe(1);
    requests[0].flush(authResponse);

    expect(responses).toEqual([authResponse, authResponse]);
    expect(auth.getToken()).toBe(authResponse.accessToken);
  });

  it('clears local session after logout succeeds', () => {
    sessionStorage.setItem('sm_access_token', 'active-access-token');
    let completed = false;

    auth.logout().subscribe({ complete: () => completed = true });

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    request.flush(null);

    expect(completed).toBeTrue();
    expect(auth.user()).toBeNull();
    expect(sessionStorage.getItem('sm_access_token')).toBeNull();
    expect(auth.logoutError()).toBeNull();
  });

  it('surfaces logout revocation failure while clearing local session', () => {
    sessionStorage.setItem('sm_access_token', 'active-access-token');
    let completed = false;

    auth.logout().subscribe({ complete: () => completed = true });

    httpTestingController.expectOne(`${environment.apiUrl}/auth/logout`).flush(
      { title: 'Server unavailable.' },
      { status: 503, statusText: 'Service Unavailable' }
    );

    expect(completed).toBeTrue();
    expect(auth.user()).toBeNull();
    expect(sessionStorage.getItem('sm_access_token')).toBeNull();
    expect(auth.logoutError()).toContain('no se pudo confirmar su revocación');
  });
});
