import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatService {
  apiUrl = 'http://172.16.0.237:8006/api';

  constructor(private http: HttpClient) {}

  startChat(token: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<{ thread_id: string, greeting: string }>(
      `${this.apiUrl}/chat/start/`, { headers }
    );
  }
  continueChat(token: string, thread_id: string, message: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<{ response: string }>(
      `${this.apiUrl}/chat/continue/`,
      { thread_id, message },
      { headers }
    );
  }
}