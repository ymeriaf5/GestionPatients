import {Component, OnInit} from '@angular/core';
import {DemoListeService} from "../demo-liste-service.service";
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {Employee} from "../model/employee";
import {Patient} from "../model/patient";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-update-patient',
  templateUrl: './update-patient.component.html',
  styleUrl: './update-patient.component.css'
})
export class UpdatePatientComponent implements OnInit{
  patientForm: FormGroup;
  antecedents: any[] = [];
  couvertures: any[] = [];
  provenances: any[] = [];
  patientId?: number;
  constructor(private patientService: DemoListeService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
  ) {
    this.patientForm = this.fb.group({
      id: [''],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      adresse: ['', Validators.required],
      cin: ['', Validators.required],
      sexe: ['', Validators.required],
      telephone: ['', Validators.required],
      antecedent_id: ['', Validators.required],
      couverture_id: ['', Validators.required],
      provenance_id: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.loadAntecedents();
    this.loadCouvertures();
    this.loadProvenances();
    this.route.paramMap.subscribe(params => {
      this.patientId = +params.get('id')!;
      this.loadPatient(this.patientId);
    });
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
  loadPatient(id: number): void {
    this.patientService.getPatientById(id).subscribe((patient: Patient) => {
      this.patientForm.patchValue(patient);
    });
  }


  onSubmit(): void {
    if (this.patientForm.valid) {
      this.patientService.updatePatient(this.patientForm.value).subscribe(() => {
        this.router.navigate(['/dashboard/patients']);
      });
    }
  }

}
