export interface Consultation {
  dateConsultation: Date;// Use Date type for date fields
  prestataire: string;
  motifConsultation: string;
  signesFonctionnels: string;
  signesPhysiques: string;
  diagnostics: string;
  examensParacliniques: string;
  resultatsExamens: string;
  traitementsPrescrits: string;
  posologie: string;
  recommandations: string;
  referenceInfo: string;
  prochainRendezVous: Date;
  remarquesSuivi: string;
  patientId: number;
}
