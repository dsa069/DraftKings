//Patron Strategy
import { Injectable } from '@angular/core';
import { ReviewService } from '../abstract/review.service';

@Injectable()
export class ReviewNodeService extends ReviewService {
  protected apiUrl = 'http://localhost:3000';
}
