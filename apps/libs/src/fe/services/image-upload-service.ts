import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private api = inject(ApiService);
  private readonly API_URL = '/api/uploads/image';

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file); // NestJS @UploadedFile() key

    return this.api.post<{ url: string }>(
      this.API_URL,
      formData,
    );
  }
}
