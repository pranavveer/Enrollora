
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CancellationRequest,
  CancellationRequestPagedResult
} from './cancellation-request.models';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CancellationRequestService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/cancellation-requests`;

  getRequests(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string,
    status?: string
  ): Observable<CancellationRequestPagedResult> {

    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<CancellationRequestPagedResult>(
      this.apiUrl,
      { params }
    );
  }

  getRequestById(id: number): Observable<CancellationRequest> {
    return this.http.get<CancellationRequest>(`${this.apiUrl}/${id}`);
  }

  approveRequest(id: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }
}
