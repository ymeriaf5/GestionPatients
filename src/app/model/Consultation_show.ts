export interface Consultation_show {
  date_consultation: Date;
  prestataire: string;
  motif_consultation: string;
  signes_fonctionnels: string;
  signes_physiques: string;
  diagnostics: string;
  examens_paracliniques: string;
  resultats_examens: string;
  traitements_prescrits: string;
  posologie: string;
  recommandations: string;
  reference_info: string;
  prochain_rendez_vous: Date;
  remarques_suivi: string;
  patient_id: number;
}
