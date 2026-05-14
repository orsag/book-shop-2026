import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '@store/shared-models';
import { Observable } from 'rxjs';

export interface LoginResponse {
  user: User;
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api/auth';

  login(username: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username });
  }

  getUser(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}`, {
      params: { username },
    });
  }

  logout(): Observable<object> {
    return this.http.get(`${this.apiUrl}/logout`);
  }

  updateUserFavorites(favorites: string[]): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/favorites`, { favorites });
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/update`, { updates });
  }
}
