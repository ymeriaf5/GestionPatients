import { Component, OnInit } from '@angular/core';
import { DemoListeService } from "../demo-liste-service.service";

@Component({
  selector: 'app-registre',
  templateUrl: './registre.component.html',
  styleUrl: './registre.component.css'
})
export class RegistreComponent implements OnInit {
  consultations: any[] = [];
  provenanceId?: number;
  provenance?:string

  constructor(private demoListeService: DemoListeService) {}

  ngOnInit(): void {
    // Retrieve the provenance ID from localStorage
    const storedProvenanceId = localStorage.getItem('provenance_id');
    console.log(storedProvenanceId);

    if (storedProvenanceId) {
      this.provenanceId = Number(storedProvenanceId);

      if (!isNaN(this.provenanceId)) {
        console.log('Provenance ID:', this.provenanceId);
        this.loadProvenance(this.provenanceId)
        this.fetchConsultationsByProvenance(this.provenanceId);
      } else {
        console.error('Invalid Provenance ID:', storedProvenanceId);
      }
    } else {
      console.error('No Provenance ID found in localStorage');
    }

  }
  loadProvenance(provenanceId: number){
    this.demoListeService.getProvenanceName(provenanceId).subscribe(response => {
      this.provenance = response.Prov;
    });
  }

  fetchConsultationsByProvenance(provenanceId: number): void {
    this.demoListeService.getConsultationsByProvenance(provenanceId).subscribe(
      (consultations) => {
        this.consultations = consultations;
        console.log('Consultations:', this.consultations);
      },
      (error) => {
        console.error('Error fetching consultations:', error);
      }
    );
  }
}
