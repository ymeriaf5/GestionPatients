import { Component } from '@angular/core';
import {NgForm} from "@angular/forms";

import {DemoListeService} from "../demo-liste-service.service";
import {ActivatedRoute, Router} from "@angular/router";


@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css'
})
export class AddEmployeeComponent {
  constructor(
    private demoService: DemoListeService,
    private router: Router,
  ) {
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const employeeData = form.value;
      this.demoService.addEmployee(employeeData).subscribe(
        response => {
          if (response.status === 201) {
            console.log('Employee added successfully');
            this.router.navigate(['/employes']);
          } else {
            console.error('Failed to add employee');
          }
        },
      );
    }
  }



}
