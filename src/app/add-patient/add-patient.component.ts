import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DemoListeService } from "../demo-liste-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.css']
})
export class AddPatientComponent implements OnInit {
  antecedents: any[] = [];
  couvertures: any[] = [];
  provenances: any[] = [];
  etablissemnts: any[] = [];
  niveaus: any[] = [];

  constructor(
    private patientService: DemoListeService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    this.loadAntecedents();
    this.loadCouvertures();
    this.loadProvenances();
    this.loadEtablissement();
    this.loadNiveau();
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

  loadEtablissement(): void {
    this.patientService.getEtablissements().subscribe(
      data => this.etablissemnts = data,
      error => console.error('Error fetching etablissement', error)
    );
  }
  loadNiveau(): void {
    this.patientService.getNiveauScollaire().subscribe(
      data => this.niveaus = data,
      error => console.error('Error fetching niveau scollaire', error)
    );
  }

  onSubmit(form: NgForm): void {
    this.patientService.addPatient(form.value).subscribe(
      response => {
        console.log('Patient added successfully', response);
        this.router.navigate(['/dashboard/patients']);
      },
      error => console.error('Error adding patient', error)
    );
  }
}
