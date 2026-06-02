// src/app/services/implementations/review-node.service.ts
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReviewService } from '../abstract/review.service';
import { environment } from '../../../../environments/environment';
import { Review } from '../../models/review.model';

@Injectable()
export class ReviewNodeService extends ReviewService {
  // Ej: http://localhost:8092/api
  protected apiUrl = environment.nodeApiUrl;

  // 10) Obtener comentarios de un jugador (GET /api/players/{id}/reviews)
  async getReviewsByPlayer(playerId: string | number): Promise<Review[]> {
    return firstValueFrom(
      this.http.get<Review[]>(`${this.apiUrl}/players/${playerId}/reviews`)
    );
  }

  // 11) Crear un comentario para un jugador (POST /api/players/{id}/reviews)
  async createReview(
    playerId: string | number,
    review: Partial<Review>
  ): Promise<Review> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const savedReview = await firstValueFrom(
      this.http.post<Review>(
        `${this.apiUrl}/players/${playerId}/reviews`,
        review,
        { headers }
      )
    );

    this.reviewCreated$.next(savedReview);
    return savedReview;
  }

  // 12) Editar comentario (PUT /api/reviews/{id})
  async updateReview(
    id: string | number,
    review: Partial<Review>
  ): Promise<Review> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const updatedReview = await firstValueFrom(
      this.http.put<Review>(`${this.apiUrl}/reviews/${id}`, review, { headers })
    );

    this.reviewUpdated$.next(updatedReview);
    return updatedReview;
  }

  // 13) Eliminar comentario (DELETE /api/reviews/{id})
  async deleteReview(id: string | number): Promise<void> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/reviews/${id}`, { headers })
    );

    this.reviewDeleted$.next(id);
  }
}
