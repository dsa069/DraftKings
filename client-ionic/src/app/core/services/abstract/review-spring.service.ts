//Patron Strategy
import { Injectable } from '@angular/core';
import { ReviewService } from '../implementations/review.service';

@Injectable()
export class ReviewSpringService extends ReviewService {
  protected apiUrl = 'http://localhost:3000';
}
