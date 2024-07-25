import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Employee } from './employee';

@Injectable({
  providedIn: 'root'
})
export class DemoListeService {
  private apiUrl = 'http://127.0.0.1:3000/api';
  private token: string | null = null;
  username?: string;

  constructor(private http: HttpClient) {}

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const token = localStorage.getItem('token');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`, { headers: this.getHeaders() });
  }

  addEmployee(employee: Employee): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.apiUrl}/employees`, employee, { headers: this.getHeaders(), observe: 'response' });
  }

  updateEmployee(employee: Employee): Observable<HttpResponse<void>> {
    return this.http.put<void>(`${this.apiUrl}/employees/${employee.id}`, employee, { headers: this.getHeaders(), observe: 'response' });
  }

  deleteEmployee(employeeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/employees/${employeeId}`, { headers: this.getHeaders() });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${id}`, { headers: this.getHeaders() });
  }

  authenticate(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, { email, password })
      .pipe(tap(response => {
        localStorage.setItem('otp-email', email);
        this.username = response.name; // Ensure this is correctly set
      }));
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { email, otp })
      .pipe(tap(response => {
        localStorage.setItem('token', response.token);
        this.username = response.name; // Ensure this is correctly set
      }));
  }
}
