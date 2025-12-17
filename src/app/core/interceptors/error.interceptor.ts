import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiError = this.parseError(error);

        // Handle specific error codes
        switch (error.status) {
          case 400:
            // Bad request - validation errors
            console.error('Validation error:', apiError);
            break;

          case 401:
            // Unauthorized - handled by AuthInterceptor
            break;

          case 403:
            // Forbidden
            console.error('Access denied:', apiError);
            this.router.navigate(['/forbidden']);
            break;

          case 404:
            // Not found
            console.error('Resource not found:', apiError);
            break;

          case 422:
            // Unprocessable entity - validation errors
            console.error('Validation error:', apiError);
            break;

          case 429:
            // Too many requests
            console.error('Rate limit exceeded:', apiError);
            break;

          case 500:
          case 502:
          case 503:
          case 504:
            // Server errors
            console.error('Server error:', apiError);
            break;

          case 0:
            // Network error
            console.error('Network error - unable to connect to server');
            break;

          default:
            console.error('HTTP error:', apiError);
        }

        return throwError(() => apiError);
      })
    );
  }

  /**
   * Parse HTTP error into ApiError format
   */
  private parseError(error: HttpErrorResponse): ApiError {
    // Network error
    if (error.status === 0) {
      return {
        status: 0,
        message: 'Unable to connect to server. Please check your internet connection.'
      };
    }

    // Server returned error response
    if (error.error) {
      // API returns structured error
      if (typeof error.error === 'object') {
        return {
          status: error.status,
          message: error.error.message || this.getDefaultMessage(error.status),
          errors: error.error.errors
        };
      }

      // API returns string error
      if (typeof error.error === 'string') {
        return {
          status: error.status,
          message: error.error
        };
      }
    }

    // Default error
    return {
      status: error.status,
      message: error.message || this.getDefaultMessage(error.status)
    };
  }

  /**
   * Get default error message for status code
   */
  private getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Please log in to continue.',
      403: 'You do not have permission to access this resource.',
      404: 'The requested resource was not found.',
      422: 'The provided data is invalid.',
      429: 'Too many requests. Please try again later.',
      500: 'An unexpected error occurred. Please try again.',
      502: 'Server is temporarily unavailable. Please try again.',
      503: 'Service is temporarily unavailable. Please try again.',
      504: 'Request timed out. Please try again.'
    };

    return messages[status] || 'An unexpected error occurred.';
  }
}
