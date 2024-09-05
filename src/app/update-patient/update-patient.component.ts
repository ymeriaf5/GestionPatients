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
  etablissemnts: any[] = [];
  niveaus: any[] = [];
  patientId?: number;
  constructor(private patientService: DemoListeService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
  ) {
    this.patientForm = this.fb.group({
      Id_Patient: [''],
      Nom: ['', Validators.required],
      Prenom: ['', Validators.required],
      DateNaissance: ['', Validators.required],
      CNIE: ['', Validators.required],
      Sexe: ['', Validators.required],
      Telephone: ['', Validators.required],
      Id_Antecedent: [[], Validators.required],  // [] for multiple select
      Id_Couverture: ['', Validators.required],
      Adresse: ['', Validators.required],
      Id_Provenance: ['', Validators.required],
      Id_NiveauScolarite: ['', Validators.required],
      Id_Etablissement: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.loadAntecedents();
    this.loadCouvertures();
    this.loadProvenances();
    this.loadEtablissement();
    this.loadNiveau();
    this.route.paramMap.subscribe(params => {
      this.patientId = +params.get('id')!;
      console.log(this.patientId)
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


  onSubmit(): void {
    if (this.patientForm.valid) {
      this.patientService.updatePatient(this.patientForm.value).subscribe(() => {
        this.router.navigate(['/dashboard/patients']);
      });
    }
  }

}
