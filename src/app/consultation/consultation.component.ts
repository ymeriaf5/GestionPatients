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
import {Employee} from "../model/employee";

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
    'date_consultation',
    'prestataire',
    'tabagisme',
    'diabete',
    'glycemie_j',
    'cholesterol_total_mol',
    'dateRendezVous',
    'complication',
    'specialite',
  ];
  dataSource: MatTableDataSource<Consultation_show> = new MatTableDataSource<Consultation_show>();

  prestataires = ['Youness Meriaf', 'Other Provider'];
  tabagismeOptions = ['Non-fumeur', 'Fumeur'];
  diabeteOptions = ['Non Diabétique', 'Diabétique'];
  specialiteOptions = [
    'Cardiologie',
    'Endocrinologie',
    'Diabétologie',
    'Neurologie',
    'Gastroentérologie',
    'Pneumologie',
    'Rhumatologie',
    'Dermatologie',
    'Néphrologie',
    'Ophtalmologie'
  ];

  mesureHygienoDiabetiqueOptions = [
    'Exercice physique régulier',
    'Alimentation équilibrée',
    'Réduction du stress',
    'Suivi glycémique',
    'Arrêt du tabac',
    'Prise de médicaments',
    'Consultations régulières',
    'Contrôle de la pression artérielle',
    'Surveillance du poids',
    'Hydratation adéquate'
  ];
  docteurList?:Employee[];


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
    this.loadDoctors();
    this.consultationFormGroup = this._formBuilder.group({
      dateConsultation: ['', Validators.required],
      prestataire: ['', Validators.required],
      tabagisme: ['', Validators.required],
      diabete: ['', Validators.required]
    });

    this.clinicalFormGroup = this._formBuilder.group({
      poids: ['', Validators.required],
      tailleM: ['', Validators.required],
      tailleC: [''],
      tourTaille: [''],
      freqC: [''],
      pas: ['', Validators.required],
      pad: ['', Validators.required],
      souffle: ['', Validators.required],
      complication: ['', Validators.required]
    });

    this.paraclinicalFormGroup = this._formBuilder.group({
      glycemieJ: ['',Validators.required],
      hemoglobine: ['',Validators.required],
      cholesterolTotalMol: ['',Validators.required],
      cholesterolTotalG: ['',Validators.required],
      hdlMol: ['',Validators.required],
      hdlG: ['',Validators.required],
      ldlMol: ['',Validators.required],
      ldlG: ['',Validators.required],
      triglyceridesMol: ['',Validators.required],
      triglyceridesG: ['',Validators.required],
      creatineM:['',Validators.required],
      creatinel:['',Validators.required],
      ureeL:['',Validators.required],
      ureeLG:['',Validators.required],
      filtrationGlo:['',Validators.required],
      bonduletteUri:['',Validators.required],
      albuminurie:['',Validators.required],
      proteinurie:['',Validators.required],
      asat:['',Validators.required],
      alat:['',Validators.required],
      tsh:['',Validators.required],
      kaliemie: ['',Validators.required],
      vitamineD: ['',Validators.required],
      acideUrique: ['',Validators.required],
      ecgResults:['',Validators.required],
      foResults:['',Validators.required],
    });



    this.treatmentFormGroup = this._formBuilder.group({
      mesuresHyg: ['', Validators.required],
      antiDiabetique: ['', Validators.required],
      traitementPre: ['', Validators.required],
      antiHTA: ['', Validators.required]
    });

    this.followUpFormGroup = this._formBuilder.group({
      specialite: ['',Validators.required],
      dateRendezVous: ['',Validators.required],
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

      // Create a Consultation object with form data
      const newConsultation: Consultation = {
        dateConsultation: this.consultationFormGroup.value.dateConsultation,
        prestataire: this.consultationFormGroup.value.prestataire,
        tabagisme: this.consultationFormGroup.value.tabagisme,
        diabete: this.consultationFormGroup.value.diabete,

        poids: this.clinicalFormGroup.value.poids,
        tailleM: this.clinicalFormGroup.value.tailleM,
        tailleC: this.clinicalFormGroup.value.tailleC,
        tourTaille: this.clinicalFormGroup.value.tourTaille,
        freqC: this.clinicalFormGroup.value.freqC,
        pas: this.clinicalFormGroup.value.pas,
        pad: this.clinicalFormGroup.value.pad,
        souffle: this.clinicalFormGroup.value.souffle,
        complication: this.clinicalFormGroup.value.complication,

        glycemieJ: this.paraclinicalFormGroup.value.glycemieJ,
        hemoglobine: this.paraclinicalFormGroup.value.hemoglobine,
        cholesterolTotalMol: this.paraclinicalFormGroup.value.cholesterolTotalMol,
        cholesterolTotalG: this.paraclinicalFormGroup.value.cholesterolTotalG,
        hdlMol: this.paraclinicalFormGroup.value.hdlMol,
        hdlG: this.paraclinicalFormGroup.value.hdlG,
        ldlMol: this.paraclinicalFormGroup.value.ldlMol,
        ldlG: this.paraclinicalFormGroup.value.ldlG,
        triglyceridesMol: this.paraclinicalFormGroup.value.triglyceridesMol,
        triglyceridesG: this.paraclinicalFormGroup.value.triglyceridesG,
        creatineM: this.paraclinicalFormGroup.value.creatineM,
        creatinel: this.paraclinicalFormGroup.value.creatinel,
        ureeL: this.paraclinicalFormGroup.value.ureeL,
        ureeLG: this.paraclinicalFormGroup.value.ureeLG,
        filtrationGlo: this.paraclinicalFormGroup.value.filtrationGlo,
        bonduletteUri: this.paraclinicalFormGroup.value.bonduletteUri,
        albuminurie: this.paraclinicalFormGroup.value.albuminurie,
        proteinurie: this.paraclinicalFormGroup.value.proteinurie,
        asat: this.paraclinicalFormGroup.value.asat,
        alat: this.paraclinicalFormGroup.value.alat,
        tsh: this.paraclinicalFormGroup.value.tsh,
        kaliemie: this.paraclinicalFormGroup.value.kaliemie,
        vitamineD: this.paraclinicalFormGroup.value.vitamineD,
        acideUrique: this.paraclinicalFormGroup.value.acideUrique,
        ecgResults: this.paraclinicalFormGroup.value.ecgResults,
        foResults: this.paraclinicalFormGroup.value.foResults,

        mesuresHyg: this.treatmentFormGroup.value.mesuresHyg,
        antiDiabetique: this.treatmentFormGroup.value.antiDiabetique,
        traitementPre: this.treatmentFormGroup.value.traitementPre,
        antiHTA: this.treatmentFormGroup.value.antiHTA,

        specialite: this.followUpFormGroup.value.specialite,
        dateRendezVous:this.followUpFormGroup.value.dateRendezVous,
        patientId: this.patientId  // Assuming you want to associate the consultation with a specific patient
      };

      // Submit the Consultation object to the service
      this.consultationService.addConsultation(newConsultation).subscribe(
        (response) => {
          console.log('Consultation added successfully:', response);
          this.getConsulation();  // Refresh the consultation list
          this.dialogRef.close();  // Close the dialog after submission
        },
        (error: HttpErrorResponse) => {
          console.error('Error adding consultation:', error);
        }
      );
    } else {
      console.log('One or more forms are invalid');
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
  loadDoctors(): void {
    this.consultationService.getDoctors().subscribe(
      (doctors: Employee[]) => {
        this.docteurList = doctors;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching doctors:', error);
      }
    );
  }
}
