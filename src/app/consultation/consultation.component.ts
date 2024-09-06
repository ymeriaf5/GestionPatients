import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Consultation} from "../model/Consultation";
import {DemoListeService} from "../demo-liste-service.service";
import {Patient_show} from "../model/patient_show";
import {MatTableDataSource} from "@angular/material/table";
import {Consultation_show} from "../model/Consultation_show";
import {Employee} from "../model/employee";
import {Router} from "@angular/router";
import {MatStepper} from "@angular/material/stepper";

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css']
})
export class ConsultationComponent implements OnInit {
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  step5Form!: FormGroup;
  step6Form!: FormGroup;
  consultationFormGroup!: FormGroup;
  @ViewChild(MatStepper) stepper!: MatStepper;
  formData: any = {}; // Initialize to hold form data
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
    'Soufle',
    'complication',
    'Bandelettes',
  ];
  dataSource: MatTableDataSource<Consultation_show> = new MatTableDataSource<Consultation_show>();

  prestataires = ['Youness Meriaf', 'Other Provider'];
  tabagismeOptions = ['Non-fumeur', 'Fumeur'];
  diabeteOptions = ['Non Diabétique', 'Diabétique'];
  foOptions = ['Normal', 'Abnormal'];
  ecgOptions = ['Normal', 'Abnormal'];
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
  docteurList: any[] = [];
  soufles: any[] = [];
  complications: any[] = [];
  BU: any[] = [];
  troubles: any[] = [];
  tps: any[] = [];
  htas: any[] = [];
  diabetiques: any[] = [];
  mesures: any[] = [];




  constructor(
    public dialogRef: MatDialogRef<ConsultationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private fb: FormBuilder,
    private consultationService:DemoListeService,
    private router: Router
  ) {
    this.patientId = data.id;

    // Initialize forms
    this.step1Form = this.fb.group({
      dateConsultation: ['', Validators.required],
      Id_Presetataire: ['', Validators.required],
      tabagisme: ['', Validators.required],
      diabete: ['', Validators.required]
    });

    this.step2Form = this.fb.group({
      poids: ['', Validators.required],
      taille: ['', Validators.required],
      tailleC: [''],
      tourDeTaille: [''],
      frequenceCardiaque: [''],
      pas: ['', Validators.required],
      pad: ['', Validators.required],
      Id_Soufle: ['', Validators.required],
      Id_Complication: ['', Validators.required]
    });

    this.step3Form = this.fb.group({
      glycemie: [''],
      hemoglobineGlyquee: [''],
      cholesterolTotal: [''],
      cholesterolTotalG: [''],
      hdlCholesterol: [''],
      hdlG: [''],
      ldlCholesterol: [''],
      ldlG: [''],
      triglycerides: [''],
      triglyceridesG: [''],
      creatinineMg: [''],
      creatinel: [''],
      ureeGl: [''],
      ureeLG: [''],
      DebitFiltrationGlomerulaire: [''],
      id_Band: ['', Validators.required],
      Albuminurie: [''],
      Proteinurie: [''],
      ASAT: [''],
      ALAT: [''],
      TSH: [''],
      Kaliemie: [''],
      VitamineD: [''],
      AcideUrique: [''],
      ECG: ['', Validators.required],
      FO: ['', Validators.required],
      id_trouble: ['', Validators.required]
    });

    this.step4Form = this.fb.group({
      Id_Mesure: ['', Validators.required],
      Id_AntiDiabetique: ['', Validators.required],
      Id_Tp: ['', Validators.required],
      Id_AntiHTA: ['', Validators.required]
    });

    this.step5Form = this.fb.group({
      specialite: [''],
    });
  }

  onAddConsultationClick(): void {
    this.showStepper = true;
  }
  ngOnInit() {
    this.getConsulation();
    this.loadDoctors();
    this.loadSoufle();
    this.loadComplication();
    this.loadBU();
    this.loadTrouble();
    this.loadtp();
    this.loadhta();
    this.loaddiabetique();
    this.loadmesure();


    this.consultationFormGroup = this._formBuilder.group({
      dateConsultation: ['', Validators.required],
      Id_Presetataire: ['', Validators.required],
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
      Id_Soufle: ['', Validators.required],
      Id_Complication: ['', Validators.required]
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
      id_Band:['',Validators.required],
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
      id_trouble:['',Validators.required],
    });



    this.treatmentFormGroup = this._formBuilder.group({
      Id_Mesure: ['', Validators.required],
      Id_AntiDiabetique: ['', Validators.required],
      Id_Tp: ['', Validators.required],
      Id_AntiHTA: ['', Validators.required]
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
    if (this.step1Form.valid && this.step2Form.valid && this.step3Form.valid && this.step4Form.valid && this.step5Form.valid) {
      const formData = {
        ...this.step1Form.value,
        ...this.step2Form.value,
        ...this.step3Form.value,
        ...this.step4Form.value,
        ...this.step5Form.value,
        patientId: this.patientId
      };
      console.log('Form Data:', formData);
      // Call the service to submit the form data
      this.consultationService.addConsultation(formData).subscribe(response => {
        console.log('Consultation added successfully:', response);
        this.dialogRef.close();  // Close the dialog after submission
        // Optionally reset the form or navigate away
      }, error => {
        console.error('Error adding consultation:', error);
      });
    } else {
      console.log('Form is invalid');
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
    this.consultationService.getPrestataire().subscribe(
      data => this.docteurList = data,
      error => console.error('Error fetching doctor', error)
    );
  }
  loadSoufle(): void {
    this.consultationService.getSoufle().subscribe(
      data => this.soufles = data,
      error => console.error('Error fetching soufle', error)
    );
  }
  loadComplication(): void {
    this.consultationService.getComplication().subscribe(
      data => this.complications = data,
      error => console.error('Error fetching complication', error)
    );
  }
  loadBU(): void {
    this.consultationService.getBU().subscribe(
      data => this.BU = data,
      error => console.error('Error fetching BandeletteUrinaire', error)
    );
  }
  loadTrouble(): void {
    this.consultationService.getTrouble().subscribe(
      data => this.troubles = data,
      error => console.error('Error fetching troubles', error)
    );
  }
  loadhta(): void {
    this.consultationService.getantihta().subscribe(
      data => this.htas = data,
      error => console.error('Error fetching hta', error)
    );
  }
  loaddiabetique(): void {
    this.consultationService.getandid().subscribe(
      data => this.diabetiques = data,
      error => console.error('Error fetching diabetique', error)
    );
  }
  loadtp(): void {
    this.consultationService.gettp().subscribe(
      data => this.tps = data,
      error => console.error('Error fetching tp', error)
    );
  }
  loadmesure(): void {
    this.consultationService.getmesure().subscribe(
      data => this.mesures = data,
      error => console.error('Error fetching mesure', error)
    );
  }



}
