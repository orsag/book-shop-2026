import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { AuthService, LoginResponse } from './auth-service';
import { User } from '@store/shared-models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Mock data definitions for clean assertions
  const mockUser: User = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    favorites: ['book-1'],
    // Include any other mandatory fields from your User model
  } as unknown as User;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(), // Intercepts the backend HTTP traffic
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Double checks that no unexpected backend calls slipped through
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- Testing POST (Login) ---
  describe('login', () => {
    it('should send a POST request with the username and return a LoginResponse', () => {
      const mockResponse: LoginResponse = {
        user: mockUser,
        access_token: 'mock-jwt-token',
      };

      service.login('testuser', 'testpassword').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'testuser',
        password: 'testpassword',
      });

      req.flush(mockResponse);
    });
  });

  // --- Testing GET with Query Params ---
  describe('getUser', () => {
    it('should send a GET request with query parameters to retrieve the user profile', () => {
      service.getUser('testuser').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      // Angular constructs query parameters by appending them to the path string
      const req = httpMock.expectOne('/api/auth?username=testuser');
      expect(req.request.method).toBe('GET');

      req.flush(mockUser);
    });
  });

  // --- Testing GET (Logout) ---
  describe('logout', () => {
    it('should send a GET request to log the user out', () => {
      const mockResponse = { success: true };

      service.logout().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);
    });
  });

  // --- Testing PATCH (Favorites updates) ---
  describe('updateUserFavorites', () => {
    it('should send a PATCH request containing the updated array of favorites', () => {
      const updatedFavorites = ['book-1', 'book-2', 'book-3'];
      const mockUpdatedUser = { ...mockUser, favorites: updatedFavorites };

      service.updateUserFavorites(updatedFavorites).subscribe((user) => {
        expect(user.favorites).toEqual(updatedFavorites);
      });

      const req = httpMock.expectOne('/api/auth/favorites');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ favorites: updatedFavorites });

      req.flush(mockUpdatedUser);
    });
  });

  // --- Testing PATCH (Profile updates) ---
  describe('updateProfile', () => {
    it('should send a PATCH request containing partial user profile updates', () => {
      const profileUpdates: Partial<User> = { email: 'newemail@example.com' };
      const mockUpdatedUser = { ...mockUser, ...profileUpdates };

      service.updateProfile(profileUpdates).subscribe((user) => {
        expect(user.email).toBe('newemail@example.com');
      });

      const req = httpMock.expectOne('/api/auth/update');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ updates: profileUpdates });

      req.flush(mockUpdatedUser);
    });
  });
});
