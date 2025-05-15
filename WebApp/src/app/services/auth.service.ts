import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = 'http://172.16.0.237:8006/api';

  token$ = new BehaviorSubject<string | null>(null);
  refresh$ = new BehaviorSubject<string | null>(null);
  email$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  register(email: string) {
    return this.http.post<{ verification_code: string }>(
      `${this.apiUrl}/register/`,
      { email }
    );
  }
  confirm(email: string, user_code: string) {
    return this.http.post<{ registered: boolean }>(
      `${this.apiUrl}/confirm/`,
      { email, user_code }
    );
  }
  requestOtp(email: string) {
    return this.http.post<{ otp: string }>(
      `${this.apiUrl}/login/request/`,
      { email }
    );
  }
  verifyOtp(email: string, otp: string) {
    return this.http.post<any>(
      `${this.apiUrl}/login/verify/`,
      { email, otp }
    );
  }
  logout(refresh: string, access: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<{ logout: boolean }>(
      `${this.apiUrl}/logout/`,
      { refresh },
      { headers }
    );
  }
  setSession(access: string, refresh: string, email: string) {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('email', email);
    this.token$.next(access);
    this.refresh$.next(refresh);
    this.email$.next(email);
  }
  clearSession() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('email');
    this.token$.next(null);
    this.refresh$.next(null);
    this.email$.next(null);
  }
  loadSession() {
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');
    const email = localStorage.getItem('email');
    if (access && refresh && email) {
      this.token$.next(access);
      this.refresh$.next(refresh);
      this.email$.next(email);
    }
  }
}