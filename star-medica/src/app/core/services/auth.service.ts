import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly state = signal<{ user: AuthUser | null; accessToken: string | null }>({
    user: null,
    accessToken: null
  });
  private googleInitialized = false;
  private refreshRequest: Observable<AuthResponse> | null = null;

  readonly user = computed(() => this.state().user);
  readonly accessToken = computed(() => this.state().accessToken);
  readonly isLoggedIn = computed(() => this.state().user !== null);
  readonly error = signal<string | null>(null);
  readonly logoutError = signal<string | null>(null);
  readonly isLoading = signal(false);

  getPostLoginRoute(user: AuthUser | null = this.state().user): string[] {
    const roles = user?.roles ?? [];
    if (roles.some((role) => ['SuperAdmin', 'Médico', 'Recepcionista'].includes(role))) {
      return ['/patients'];
    }
    if (roles.includes('Farmacéutico')) {
      return ['/pharmacy'];
    }
    return ['/auth/pending-approval'];
  }

  getToken(): string | null {
    return this.state().accessToken ??
      (this.isBrowser ? sessionStorage.getItem('sm_access_token') : null);
  }

  ensureSession(): Observable<boolean> {
    if (this.state().user) {
      return of(true);
    }

    if (!this.isBrowser) {
      return of(false);
    }

    return this.refreshSession().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession(false);
        return of(false);
      })
    );
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    this.error.set(null);
    this.logoutError.set(null);
    this.isLoading.set(true);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { idToken }, {
      withCredentials: true
    }).pipe(
      tap((response) => this.setSession(response)),
      catchError((error: HttpErrorResponse) => {
        const detail = error.error?.detail ?? error.error?.title;
        this.error.set(detail ?? 'No se pudo iniciar sesión. Inténtalo nuevamente.');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  refreshSession(): Observable<AuthResponse> {
    if (this.refreshRequest) {
      return this.refreshRequest;
    }

    let sharedRequest: Observable<AuthResponse>;
    sharedRequest = this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap((response) => this.setSession(response)),
      finalize(() => {
        if (this.refreshRequest === sharedRequest) {
          this.refreshRequest = null;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.refreshRequest = sharedRequest;
    return sharedRequest;
  }

  logout(): Observable<void> {
    this.logoutError.set(null);
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      catchError(() => {
        this.logoutError.set(
          'La sesión se cerró en este dispositivo, pero no se pudo confirmar su revocación en el servidor.');
        return EMPTY;
      }),
      finalize(() => this.clearSession())
    );
  }

  expireSession(): void {
    this.clearSession();
  }

  renderGoogleButton(element: HTMLElement): () => void {
    if (!environment.googleClientId) {
      this.error.set('Falta configurar el Client ID de Google para este entorno.');
      return () => undefined;
    }

    let attempts = 0;
    const timer = window.setInterval(() => {
      const googleId = window.google?.accounts.id;
      if (googleId) {
        window.clearInterval(timer);
        if (this.googleInitialized) {
          googleId.renderButton(element, {
            theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular',
            locale: 'es', width: 320
          });
          return;
        }

        this.googleInitialized = true;
        googleId.initialize({
          client_id: environment.googleClientId,
          callback: (response) => {
            this.loginWithGoogle(response.credential).subscribe({
              next: (result) => {
                void this.router.navigate(this.getPostLoginRoute(result.user));
              },
              error: () => undefined
            });
          },
          context: 'signin'
        });
        googleId.renderButton(element, {
          theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular',
          locale: 'es', width: 320
        });
        this.error.set(null);
      } else if (++attempts >= 40) {
        window.clearInterval(timer);
        this.error.set('No se pudo cargar Google Identity Services.');
      }
    }, 250);

    return () => window.clearInterval(timer);
  }

  private setSession(response: AuthResponse): void {
    if (this.isBrowser) {
      sessionStorage.setItem('sm_access_token', response.accessToken);
    }
    this.state.set({ user: response.user, accessToken: response.accessToken });
  }

  private clearSession(redirectToLogin = true): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('sm_access_token');
    }
    this.state.set({ user: null, accessToken: null });
    if (redirectToLogin) {
      void this.router.navigate(['/auth/login']);
    }
  }
}