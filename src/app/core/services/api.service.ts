import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams | { [param: string]: string | string[] }): Observable<ApiResponse<T>> {
    const httpParams = params instanceof HttpParams ? params : new HttpParams({ fromObject: params || {} });
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  /**
   * GET request for paginated data
   */
  getPaginated<T>(
    endpoint: string,
    page: number = 1,
    pageSize: number = 10,
    params?: { [param: string]: string | string[] }
  ): Observable<ApiResponse<PaginatedResponse<T>>> {
    const httpParams = new HttpParams({
      fromObject: {
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...params
      }
    });
    return this.http.get<ApiResponse<PaginatedResponse<T>>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`);
  }

  /**
   * Upload file
   */
  upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData);
  }

  /**
   * Download file
   */
  download(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      responseType: 'blob'
    });
  }
}
