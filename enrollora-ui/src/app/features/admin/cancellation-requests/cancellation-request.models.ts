
export interface CancellationRequest {
  cancellationRequestId: number;
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseName: string;
  requestedAt: string;
  reason: string;
  status: string;
}

export interface CancellationRequestFilter {
  search?: string;
  status?: string;
}

export interface CancellationRequestPagedResult {
  items: CancellationRequest[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
