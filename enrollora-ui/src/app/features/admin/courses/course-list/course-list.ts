
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourseService } from '../course.service';
import { CourseResponse, SaveCourseRequest } from '../course.models';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);

  courses = signal<CourseResponse[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);

  errorMessage = signal('');
  successMessage = signal('');
  formError = signal('');

  showForm = signal(false);
  editingCourseId = signal<number | null>(null);

  pageNumber = signal(1);
  pageSize = signal(10);

  totalRecords = signal(0);
  totalPages = signal(0);

  courseForm: SaveCourseRequest = this.emptyCourseForm();

  private emptyCourseForm(): SaveCourseRequest {
    return {
      courseName: '',
      duration: '',
      fees: 0,
      capacity: 1,
      isActive: true,
    };
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.courseService.getCourses(this.pageNumber(), this.pageSize()).subscribe({
      next: (response) => {
        this.courses.set(response.items);
        this.totalRecords.set(response.totalRecords);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage.set('Unable to load courses.');
        this.isLoading.set(false);
      },
    });
  }

  // Open form for creating a new course
  openCreateForm(): void {
    this.courseForm = this.emptyCourseForm();
    this.editingCourseId.set(null);
    this.formError.set('');
    this.successMessage.set('');
    this.showForm.set(true);
  }

  // Open form with existing course details
  openEditForm(course: CourseResponse): void {
    this.courseForm = {
      courseName: course.courseName,
      duration: course.duration,
      fees: course.fees,
      capacity: course.capacity,
      isActive: course.isActive,
    };

    this.editingCourseId.set(course.courseId);
    this.formError.set('');
    this.successMessage.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    if (this.isSaving()) return;

    this.showForm.set(false);
    this.formError.set('');
  }

  // Create or update a course
  saveCourse(): void {
    this.formError.set('');
    this.successMessage.set('');

    if (
      !this.courseForm.courseName.trim() ||
      !this.courseForm.duration.trim() ||
      this.courseForm.fees < 0 ||
      this.courseForm.capacity < 1
    ) {
      this.formError.set('Please enter valid course details.');
      return;
    }

    const request: SaveCourseRequest = {
      ...this.courseForm,
      courseName: this.courseForm.courseName.trim(),
      duration: this.courseForm.duration.trim(),
    };

    this.isSaving.set(true);

    const courseId = this.editingCourseId();

    const operation = courseId === null
      ? this.courseService.createCourse(request)
      : this.courseService.updateCourse(courseId, request);

    operation.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showForm.set(false);

        this.successMessage.set(
          courseId === null
            ? 'Course created successfully.'
            : 'Course updated successfully.'
        );

        this.loadCourses();
      },
      error: (error) => {
        console.error('Error saving course:', error);
        this.isSaving.set(false);
        this.formError.set(
          error.error?.detail ||
          error.error?.message ||
          'Unable to save course. Please try again.'
        );
      },
    });
  }

  // Deactivate a course
  deactivateCourse(course: CourseResponse): void {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${course.courseName}"?`
    );

    if (!confirmed) return;

    this.courseService.deactivateCourse(course.courseId).subscribe({
      next: () => {
        this.successMessage.set('Course deactivated successfully.');
        this.loadCourses();
      },
      error: (error) => {
        console.error('Error deactivating course:', error);
        this.errorMessage.set(
          error.error?.detail ||
          error.error?.message ||
          'Unable to deactivate course.'
        );
      },
    });
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update(page => page + 1);
      this.loadCourses();
    }
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update(page => page - 1);
      this.loadCourses();
    }
  }
}
