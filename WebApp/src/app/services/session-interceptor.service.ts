import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {

  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check for 401 or 403 status
        if (error.status === 401 || error.status === 403) {
          // Optionally show a toast or alert to user only once:
          this.authService.clearSession();
          // Optionally clear chat thread/other session things here as well
          this.router.navigate(['/login'], { queryParams: { reason: 'expired' } });
        }
        return throwError(() => error);
      })
    );
  }
}