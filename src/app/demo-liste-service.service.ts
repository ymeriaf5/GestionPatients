import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Employee } from './model/employee';
import {Patient} from "./model/patient";
import {Patient_show} from "./model/patient_show";
import {Consultation} from "./model/Consultation";
import {Consultation_show} from "./model/Consultation_show";

@Injectable({
  providedIn: 'root'
})
export class DemoListeService {
  private apiUrl = 'http://127.0.0.1:3000/api';
  private token: string | null = null;
  username?: string;

  constructor(private http: HttpClient) {}

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
  //employee

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
  // Patient methods
  getPatients(): Observable<Patient_show[]> {
    return this.http.get<Patient_show[]>(`${this.apiUrl}/patients`, { headers: this.getHeaders() });
  }

  addPatient(patient: Patient): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.apiUrl}/patients`, patient, { headers: this.getHeaders(), observe: 'response' });
  }
  // Fetch antecedents
  getAntecedents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/antecedents`, { headers: this.getHeaders() });
  }

  // Fetch couvertures
  getCouvertures(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/couvertures`, { headers: this.getHeaders() });
  }

  // Fetch provenances
  getProvenances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/provenances`, { headers: this.getHeaders() });
  }

  getNiveauScollaire(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/niveaux-scolaires`, { headers: this.getHeaders() });
  }

  getEtablissements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/etablissements`, { headers: this.getHeaders() });
  }

  getPrestataire(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/prestataire`, { headers: this.getHeaders() });
  }
  getSoufle(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/soufle`, { headers: this.getHeaders() });
  }
  getComplication(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/complication`, { headers: this.getHeaders() });
  }
  getTrouble(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trouble`, { headers: this.getHeaders() });
  }
  getBU(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/BU`, { headers: this.getHeaders() });
  }
  gettp(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tp`, { headers: this.getHeaders() });
  }
  getantihta(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/antihta`, { headers: this.getHeaders() });
  }
  getandid(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/antid`, { headers: this.getHeaders() });
  }
  getmesure(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mesure`, { headers: this.getHeaders() });
  }

  updatePatient(patient: Patient): Observable<HttpResponse<void>> {
    return this.http.put<void>(`${this.apiUrl}/patients/${patient.Id_Patient}`, patient, { headers: this.getHeaders(), observe: 'response' });
  }

  deletePatient(patientId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/patients/${patientId}`, { headers: this.getHeaders() });
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`, { headers: this.getHeaders() });
  }
  // Consultation methods
  addConsultation(consultation: Consultation): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.apiUrl}/consultations`, consultation, { headers: this.getHeaders(), observe: 'response' });
  }

  getConsultationtById(id: number): Observable<Consultation_show[]> {
    return this.http.get<Consultation_show[]>(`${this.apiUrl}/consultations/${id}`, { headers: this.getHeaders() });
  }

  getDoctors():Observable<Employee[]>{
    return this.http.get<Employee[]>(`${this.apiUrl}/doctors`, { headers: this.getHeaders() });
  }
  getConsultationsByProvenance(provenanceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/registre/${provenanceId}`, { headers: this.getHeaders() });
  }
  getProvenanceName(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/provenanceName/${id}`, { headers: this.getHeaders() });
  }
  getStat(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stat`, { headers: this.getHeaders() });
  }
  sendHelp(email: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-help`, { email, message }, { headers: this.getHeaders() });
  }


  authenticate(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, { email, password })
      .pipe(tap(response => {
        if (response.id !== undefined) {
          localStorage.setItem('otp-email', email);
          localStorage.setItem('username', response.name);
          localStorage.setItem('id', response.id);
          localStorage.setItem('provenance_id', response.provenance_id);
          console.log(' ID stored in localStorage: ', localStorage.getItem('id'));
        } else {
          console.error('ID is undefined in the response.');
        }
      }));
  }



  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { email, otp })
      .pipe(tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.name);
      }));
  }
}
