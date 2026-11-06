import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const isAuthRequest = request.url.includes('/auth/');
  const token = auth.getToken();
  const authorizedRequest = isApiRequest && token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !isApiRequest || isAuthRequest || !token) {
        return throwError(() => error);
      }

      const currentToken = auth.getToken();
      if (!currentToken) {
        return throwError(() => error);
      }

      if (currentToken !== token) {
        return next(request.clone({
          setHeaders: { Authorization: `Bearer ${currentToken}` }
        }));
      }

      return auth.refreshSession().pipe(
        catchError((refreshError: unknown) => {
          auth.expireSession();
          return throwError(() => refreshError);
        }),
        switchMap((response) => next(request.clone({
          setHeaders: { Authorization: `Bearer ${response.accessToken}` }
        }))),
      );
    })
  );
};