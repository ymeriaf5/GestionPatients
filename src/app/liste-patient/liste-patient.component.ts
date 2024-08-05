import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Patient_show } from '../model/patient_show';
import { HttpErrorResponse } from '@angular/common/http';
import { DemoListeService } from "../demo-liste-service.service";
import {MatDialog} from "@angular/material/dialog";
import {ConsultationComponent} from "../consultation/consultation.component";

@Component({
  selector: 'app-liste-patient',
  templateUrl: './liste-patient.component.html',
  styleUrls: ['./liste-patient.component.css']
})
export class ListePatientComponent implements OnInit {
  public patients?: Patient_show[];
  displayedColumns: string[] = ['id', 'antecedent', 'cin', 'nom', 'prenom',
    'sexe', 'adresse', 'telephone', 'couverture', 'provenance', 'action'];

  public dataSource: MatTableDataSource<Patient_show> = new MatTableDataSource<Patient_show>();
  pageSizeOptions: number[] = [5, 10, 20];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Column to property mapping
  columnMap: { [key: string]: keyof Patient_show } = {
    id: 'id',
    antecedent: 'antecedent_nom',
    cin: 'cin',
    nom: 'nom',
    prenom: 'prenom',
    sexe: 'sexe',
    telephone: 'telephone',
    couverture: 'couverture_type',
    provenance: 'provenance_nom',
    adresse: 'adresse'
  };

  constructor(
    private patientService: DemoListeService,
    public dialog: MatDialog
    ) {}

  ngOnInit(): void {
    this.getPatients();
  }

  getPatients(): void {
    this.patientService.getPatients().subscribe(
      (response: Patient_show[]) => {
        this.dataSource.data = response;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.dataSource.data);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching patients:', error);
      }
    );
  }

  applyColumnFilter(event: KeyboardEvent, column: string): void {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: Patient_show, filter: string) => {
      const property = this.columnMap[column];
      const value = data[property] ? data[property].toString().toLowerCase() : '';
      return value.includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  public deletePatient(id: number): void {
    this.patientService.deletePatient(id).subscribe(
      () => {
        console.log('Patient deleted successfully');
        this.getPatients();
      },
      (error: HttpErrorResponse) => {
        console.error('Error deleting patient:', error);
      }
    );
  }
  openDetailsDialog(patientId: number): void {
    const dialogRef = this.dialog.open(ConsultationComponent, {
      width: '80%',
      data: { id: patientId } // pass patient ID or other data if needed
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
