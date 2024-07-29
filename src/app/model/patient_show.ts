export interface Patient_show {
  id: number;
  antecedent_nom: string;
  couverture_type: string;
  provenance_nom: string;
  adresse: string;
  nom: string;
  prenom: string;
  cin: string;
  sexe: string;
  telephone: string;
  [key: string]: any;
}
