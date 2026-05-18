//Patron Strategy
import { Injectable } from '@angular/core';
import { ReviewService } from '../abstract/review.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class ReviewNodeService extends ReviewService {
  protected apiUrl = environment.nodeApiUrl;
}
