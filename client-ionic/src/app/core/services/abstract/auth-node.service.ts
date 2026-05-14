//Patron Strategy
import { Injectable } from '@angular/core';
import { AuthService } from '../implementations/auth.service';

@Injectable()
export class AuthNodeService extends AuthService {
  protected apiUrl = 'http://localhost:3000';
}
