import { inject, Injectable } from '@angular/core';
import { User } from '@store/libs';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginResponse {
  user: User;
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private apiUrl = '/api/auth';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(`${this.apiUrl}/login`, {
      username,
      password,
    });
  }

  register(credentials: {
    email: string;
    username: string;
    password: string;
  }): Observable<{ user: User }> {
    const { email, username, password } = credentials;
    return this.api.post<LoginResponse>(`${this.apiUrl}/register`, {
      email,
      username,
      password,
    });
  }

  getUser(username: string): Observable<User> {
    return this.api.get<User>(`${this.apiUrl}`, {
      params: { username },
    });
  }

  logout(): Observable<object> {
    return this.api.get(`${this.apiUrl}/logout`);
  }

  updateUserFavorites(favorites: string[]): Observable<User> {
    return this.api.patch<User>(`${this.apiUrl}/favorites`, { favorites });
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.api.patch<User>(`${this.apiUrl}/update`, { updates });
  }
}
