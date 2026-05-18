//Patron Strategy
import { Injectable } from '@angular/core';
import { ReviewService } from '../abstract/review.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ReviewSpringService extends ReviewService {
  protected apiUrl = environment.springApiUrl + '/reviewms';
}
