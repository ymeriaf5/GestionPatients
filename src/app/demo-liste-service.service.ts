import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee';

@Injectable({
  providedIn: 'root'
})
/*export class DemoListeService {
  private apiUrl2 = 'http://127.0.0.1:3000/api/data';
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}
  getEmployees(): Observable<any> {
    return this.http.get<any>(this.apiUrl2);
  }

  /*public getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees/all`);
  }

  public addEmployee(employee: Employee): Observable<HttpResponse<string>> {
    // @ts-ignore
    return this.http.post<string>(`${this.apiUrl}/employees/add`, employee, { observe: 'response', responseType: 'text' });
  }
/*
  public updateEmployee(employeeId: number): void {
     this.http.get<Employee>(`${this.apiUrl}/employees/update/${employeeId}`);
  }

  public deleteEmployee(employeeId: number): Observable<HttpResponse<string>>  {
    // @ts-ignore
    return this.http.delete<string>(`${this.apiUrl}/employees/delete/${employeeId}`);
  }
  public getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employees/get/${id}`);
  }


  public updateEmployee(employee: Employee): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/employees/update`,employee);
  }
}*/
export class DemoListeService {
  private apiUrl = 'http://127.0.0.1:3000/api';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  addEmployee(employee: Employee): Observable<HttpResponse<string>> {
    // @ts-ignore
    return this.http.post<string>(`${this.apiUrl}/employees`, employee, { observe: 'response', responseType: 'text' });
  }

  updateEmployee(employee: Employee): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/employees/${employee.id}`, employee);
  }

  deleteEmployee(employeeId: number): Observable<HttpResponse<string>> {
    // @ts-ignore
    return this.http.delete<string>(`${this.apiUrl}/employees/${employeeId}`, { observe: 'response', responseType: 'text' });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${id}`);
  }
}
