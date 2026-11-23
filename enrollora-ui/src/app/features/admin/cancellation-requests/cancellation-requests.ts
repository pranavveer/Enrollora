
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CancellationRequest } from './cancellation-request.models';
import { CancellationRequestService } from './cancellation-request.service';

@Component({
  selector: 'app-cancellation-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cancellation-requests.html',
  styleUrl: './cancellation-requests.css'
})
export class CancellationRequestsComponent implements OnInit {

  private service = inject(CancellationRequestService);

  requests = signal<CancellationRequest[]>([]);

  isLoading = signal(false);
  isProcessing = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  searchText = '';
  selectedStatus = '';

  pageNumber = signal(1);
  pageSize = signal(10);

  totalRecords = signal(0);
  totalPages = signal(0);

  selectedRequest = signal<CancellationRequest | null>(null);
  showDetails = signal(false);

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.service.getRequests(
      this.pageNumber(),
      this.pageSize(),
      this.searchText,
      this.selectedStatus
    ).subscribe({
      next: response => {
        this.requests.set(response.items);
        this.totalRecords.set(response.totalRecords);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: error => {
        console.error(error);
        this.errorMessage.set(
          error.error?.detail ||
          error.error?.message ||
          'Unable to load cancellation requests.'
        );
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadRequests();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = '';
    this.pageNumber.set(1);
    this.loadRequests();
  }

  viewRequest(request: CancellationRequest): void {
    this.selectedRequest.set(request);
    this.showDetails.set(true);
  }

  closeDetails(): void {
    this.showDetails.set(false);
    this.selectedRequest.set(null);
  }

  approve(request: CancellationRequest): void {
    if (!window.confirm(
      `Approve cancellation for ${request.studentName} - ${request.courseName}?`
    )) {
      return;
    }

    this.processRequest(request, 'approve');
  }

  reject(request: CancellationRequest): void {
    if (!window.confirm(
      `Reject cancellation request from ${request.studentName}?`
    )) {
      return;
    }

    this.processRequest(request, 'reject');
  }

  private processRequest(
    request: CancellationRequest,
    action: 'approve' | 'reject'
  ): void {

    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const operation = action === 'approve'
      ? this.service.approveRequest(request.cancellationRequestId)
      : this.service.rejectRequest(request.cancellationRequestId);

    operation.subscribe({
      next: () => {
        this.isProcessing.set(false);

        this.successMessage.set(
          action === 'approve'
            ? 'Cancellation request approved.'
            : 'Cancellation request rejected.'
        );

        this.closeDetails();
        this.loadRequests();
      },
      error: error => {
        console.error(error);
        this.isProcessing.set(false);

        this.errorMessage.set(
          error.error?.detail ||
          error.error?.message ||
          `Unable to ${action} cancellation request.`
        );
      }
    });
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update(p => p + 1);
      this.loadRequests();
    }
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update(p => p - 1);
      this.loadRequests();
    }
  }
}
