export interface Consultation {
  dateConsultation: Date; // Use Date type for date fields
  prestataire: string;
  tabagisme: string;
  diabete: string;

  // Clinical Examination Fields
  poids: number;
  tailleM: number;
  tailleC?: number; // Optional field
  tourTaille?: number; // Optional field
  freqC?: number; // Optional field
  pas: number;
  pad: number;
  souffle: string;
  complication: string;

  // Paraclinical Examination Fields
  glycemieJ?: number; // Optional field
  hemoglobine?: number; // Optional field
  cholesterolTotalMol?: number; // Optional field
  cholesterolTotalG?: number; // Optional field
  hdlMol?: number; // Optional field
  hdlG?: number; // Optional field
  ldlMol?: number; // Optional field
  ldlG?: number; // Optional field
  triglyceridesMol?: number; // Optional field
  triglyceridesG?: number; // Optional field
  creatineM?: number; // Optional field
  creatinel?: number; // Optional field
  ureeL?: number; // Optional field
  ureeLG?: number; // Optional field
  filtrationGlo?: number; // Optional field
  bonduletteUri?: string; // Optional field
  albuminurie?: string; // Optional field
  proteinurie?: string; // Optional field
  asat?: number; // Optional field
  alat?: number; // Optional field
  tsh?: number; // Optional field
  kaliemie?: number; // Optional field
  vitamineD?: number; // Optional field
  acideUrique?: number; // Optional field
  ecgResults?: string; // Optional field
  foResults?: string; // Optional field

  // Treatment Fields
  mesuresHyg: string;
  antiDiabetique: string;
  traitementPre: string;
  antiHTA: string;

  // Follow-up Fields
  specialite?: string; // Optional field
  dateRendezVous:Date

  patientId: number;
}
