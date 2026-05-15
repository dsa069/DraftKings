import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../models/review.model';
import { Injectable, inject } from '@angular/core';

@Injectable()
export abstract class ReviewService {
  protected abstract apiUrl: string; // Cada hijo dirá su URL

  protected http = inject(HttpClient);

  getReview(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews`);
  }
  // ... el resto de métodos CRUD aquí una sola vez
}
