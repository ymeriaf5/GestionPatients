import {Component, OnInit, ViewChild} from '@angular/core';
import {DemoService} from "./demo-service.service";
import {Employee} from "../employee";
import {DemoListeService} from "../demo-liste-service.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {count} from "rxjs";

@Component({
  selector: 'app-demo-liste',
  templateUrl: './demo-liste.component.html',
  styleUrl: './demo-liste.component.css'
})
export class DemoListeComponent implements OnInit{
  public employee?:Employee[];
  public displayedColumns: string[] = ['id', 'name', 'email','password','action'];
  public dataSource: MatTableDataSource<Employee> = new MatTableDataSource<Employee>();
  pageSizeOptions: number[] = [5, 10, 20];
  pageSize: number = 5;
  pageIndex: number = 0;
  totalCount: number = 0;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  constructor(private employeeService:DemoListeService) {
  }

  ngOnInit(): void {
    this.getEmployees();
    }
  getEmployees(): void {
    this.employeeService.getEmployees().subscribe(
      (response: Employee[]) => {
        this.dataSource.data = response;
        this.dataSource.paginator = this.paginator;
      },
      error => {
        console.error('Error fetching employees:', error);
      }
    );
  }
  public deleteEmployee(id:number):void{
    this.employeeService.deleteEmployee(id).subscribe(
      (response)=>{
      console.log('Employee delete successfully');
      this.getEmployees();
  });
  }
}
