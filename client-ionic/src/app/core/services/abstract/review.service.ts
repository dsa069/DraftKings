// src/app/services/abstract/review.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Review } from '../../models/review.model';
import { AuthService } from './auth.service'; // Ajusta el path según tu proyecto

@Injectable()
export abstract class ReviewService {
  protected abstract apiUrl: string; // Cada hijo definirá su URL base correspondiente
  protected http = inject(HttpClient);
  protected authService = inject(AuthService);

  // Subjects reactivos para mantener la interfaz actualizada en tiempo real
  reviewCreated$ = new Subject<Review>();
  reviewUpdated$ = new Subject<Review>();
  reviewDeleted$ = new Subject<string | number>();

  // 10) Obtener comentarios de un jugador
  abstract getReviewsByPlayer(playerId: string | number): Promise<Review[]>;

  // 11) Crear un comentario para un jugador
  abstract createReview(
    playerId: string | number,
    review: Partial<Review>
  ): Promise<Review>;

  // 12) Editar comentario (unused)
  abstract updateReview(
    id: string | number,
    review: Partial<Review>
  ): Promise<Review>;

  // 13) Eliminar comentario
  abstract deleteReview(id: string | number): Promise<void>;
}
