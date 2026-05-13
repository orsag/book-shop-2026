import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/uploads/image';

  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file); // NestJS @UploadedFile() key

    return this.http.post<{ url: string }>(
      this.API_URL,
      formData,
    );
  }
}
