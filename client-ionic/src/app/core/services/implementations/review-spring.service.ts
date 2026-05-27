// src/app/services/implementations/review-spring.service.ts
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReviewService } from '../abstract/review.service';
import { environment } from '../../../../environments/environment';
import { Review } from '../../models/review.model';

@Injectable()
export class ReviewSpringService extends ReviewService {
  // CONFIGURACIÓN DE RUTA BASE PARA RESEÑAS
  protected apiUrl = environment.springApiUrl + '/reviewms/api';

  // 10) OBTENER COMENTARIOS DE UN JUGADOR
  // Cumple con el backend Spring -> GET a /players/{id}/reviews
  async getReviewsByPlayer(playerId: string | number): Promise<Review[]> {
    return firstValueFrom(
      this.http.get<Review[]>(`${this.apiUrl}/players/${playerId}/reviews`)
    );
  }

  // 11) CREAR UN COMENTARIO PARA UN JUGADOR
  async createReview(
    playerId: string | number,
    review: Partial<Review>
  ): Promise<Review> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return firstValueFrom(
      this.http.post<Review>(`${this.apiUrl}/players/${playerId}/reviews`, review, {
        headers,
      })
    );
  }

  // 12) EDITAR COMENTARIO (Directo al recurso individual /reviews/{id})
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

    // Si tu estructura base maneja Subjects de actualización, los disparas aquí:
    // this.reviewUpdated$.next(updatedReview);
    return updatedReview;
  }

  // 13) ELIMINAR COMENTARIO (Directo al recurso individual /reviews/{id})
  async deleteReview(id: string | number): Promise<void> {
    const token = await this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    await firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/reviews/${id}`, { headers })
    );

    // Si tu estructura base maneja Subjects de eliminación, los disparas aquí:
    // this.reviewDeleted$.next(id);
  }
}
