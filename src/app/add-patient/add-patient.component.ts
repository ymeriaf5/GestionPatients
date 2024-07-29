import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemoListeService } from "../demo-liste-service.service";

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.css']
})
export class AddPatientComponent implements OnInit {
  antecedents: any[] = [];
  couvertures: any[] = [];
  provenances: any[] = [];

  constructor(private patientService: DemoListeService) { }

  ngOnInit(): void {
    this.loadAntecedents();
    this.loadCouvertures();
    this.loadProvenances();
  }

  loadAntecedents(): void {
    this.patientService.getAntecedents().subscribe(
      data => this.antecedents = data,
      error => console.error('Error fetching antecedents', error)
    );
  }

  loadCouvertures(): void {
    this.patientService.getCouvertures().subscribe(
      data => this.couvertures = data,
      error => console.error('Error fetching couvertures', error)
    );
  }

  loadProvenances(): void {
    this.patientService.getProvenances().subscribe(
      data => this.provenances = data,
      error => console.error('Error fetching provenances', error)
    );
  }

  onSubmit(form: NgForm): void {
    this.patientService.addPatient(form.value).subscribe(
      response => {
        console.log('Patient added successfully', response);
        form.reset();
      },
      error => console.error('Error adding patient', error)
    );
  }
}
