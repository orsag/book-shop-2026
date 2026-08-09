import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PremiumStatus, UserDetailSmall } from '@store/libs';
import { CreateUserDetailDto as UserDetail } from '@api';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  private api = inject(ApiService);
  private readonly API_URL = '/api/user-detail';

  updateUserDetail(
    userId: string,
    updated: Partial<UserDetailSmall>,
  ): Observable<UserDetail> {
    return this.api.patch<UserDetail>(`${this.API_URL}/${userId}`, updated);
  }

  getUserDetailById(userId: string): Observable<UserDetail> {
    return this.api.get<UserDetail>(`${this.API_URL}/${userId}`);
  }

  findPremiumStatus(userId: string): Observable<PremiumStatus> {
    return this.api.get<PremiumStatus>(`${this.API_URL}/premium/${userId}`);
  }
}
