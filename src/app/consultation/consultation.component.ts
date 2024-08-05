import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Consultation} from "../model/Consultation";
import {DemoListeService} from "../demo-liste-service.service";
import {Patient_show} from "../model/patient_show";
import {MatTableDataSource} from "@angular/material/table";
import {Consultation_show} from "../model/Consultation_show";

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements OnInit {
  consultationFormGroup!: FormGroup;
  clinicalFormGroup!: FormGroup;
  paraclinicalFormGroup!: FormGroup;
  treatmentFormGroup!: FormGroup;
  followUpFormGroup!: FormGroup;
  public patientId: number;
  showStepper: boolean = false;
  displayedColumns: string[] = [
    'date_Consultation',
    'prestataire',
    'motif_Consultation',
    'signes_Fonctionnels',
    'signes_Physiques',
    'diagnostics',
    'examens_Paracliniques',
    'resultats_Examens',
    'traitements_Prescrits',
    'posologie',
    'recommandations',
    'reference_Info',
    'prochain_Rendez_Vous',
    'remarques_Suivi'
  ];
  dataSource: MatTableDataSource<Consultation_show> = new MatTableDataSource<Consultation_show>();

  constructor(
    public dialogRef: MatDialogRef<ConsultationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private consultationService:DemoListeService
  ) {
    this.patientId = data.id;
  }

  onAddConsultationClick(): void {
    this.showStepper = true;
  }
  ngOnInit() {
    this.getConsulation();
    this.consultationFormGroup = this._formBuilder.group({
      dateConsultation: ['', Validators.required],
      prestataire: ['', Validators.required],
      motifConsultation: ['', Validators.required]
    });

    this.clinicalFormGroup = this._formBuilder.group({
      signesFonctionnels: ['', Validators.required],
      signesPhysiques: ['', Validators.required],
      diagnostics: ['', Validators.required]
    });

    this.paraclinicalFormGroup = this._formBuilder.group({
      examensParacliniques: ['', Validators.required],
      resultatsExamens: ['', Validators.required]
    });

    this.treatmentFormGroup = this._formBuilder.group({
      traitementsPrescrits: ['', Validators.required],
      posologie: ['', Validators.required],
      recommandations: ['', Validators.required]
    });

    this.followUpFormGroup = this._formBuilder.group({
      references: ['', Validators.required],
      prochainRendezVous: ['', Validators.required],
      remarquesSuivi: ['', Validators.required]
    });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    console.log('Submit button clicked');
    if (
      this.consultationFormGroup.valid &&
      this.clinicalFormGroup.valid &&
      this.paraclinicalFormGroup.valid &&
      this.treatmentFormGroup.valid &&
      this.followUpFormGroup.valid

    ) {
      console.log('All forms are valid');
      const consultation: Consultation = {
        dateConsultation:this.consultationFormGroup.value.dateConsultation,
        prestataire: this.consultationFormGroup.value.prestataire,
        motifConsultation: this.consultationFormGroup.value.motifConsultation,
        signesFonctionnels: this.clinicalFormGroup.value.signesFonctionnels,
        signesPhysiques: this.clinicalFormGroup.value.signesPhysiques,
        diagnostics: this.clinicalFormGroup.value.diagnostics,
        examensParacliniques: this.paraclinicalFormGroup.value.examensParacliniques,
        resultatsExamens: this.paraclinicalFormGroup.value.resultatsExamens,
        traitementsPrescrits: this.treatmentFormGroup.value.traitementsPrescrits,
        posologie: this.treatmentFormGroup.value.posologie,
        recommandations: this.treatmentFormGroup.value.recommandations,
        referenceInfo: this.followUpFormGroup.value.references,
        prochainRendezVous: this.followUpFormGroup.value.prochainRendezVous,
        remarquesSuivi: this.followUpFormGroup.value.remarquesSuivi,
        patientId: this.patientId
      };
      console.log('Consultation Form Values:', this.consultationFormGroup.value);
      console.log('Clinical Form Values:', this.clinicalFormGroup.value);
      console.log('Paraclinical Form Values:', this.paraclinicalFormGroup.value);
      console.log('Treatment Form Values:', this.treatmentFormGroup.value);
      console.log('Follow-Up Form Values:', this.followUpFormGroup.value);
      console.log(this.patientId+"Patient ****************");
      this.consultationService.addConsultation(consultation).subscribe(response => {
        console.log('Consultation added successfully');
        this.showStepper = false;

      }, error => {
        console.error('Error adding consultation:', error.message);
      });
    }
  }
  getConsulation(): void {
    this.consultationService.getConsultationtById(this.patientId).subscribe(
      (response: Consultation_show[]) => {
        this.dataSource.data = response;
        console.log(this.dataSource.data);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching Consultations:', error);
      }
    );
  }
}
