import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DemoListeService } from '../demo-liste-service.service';
import { Employee } from '../model/employee';

@Component({
  selector: 'app-employee-form-component',
  templateUrl: './employee-form-component.component.html',
  styleUrls: ['./employee-form-component.component.css']
})
export class EmployeeFormComponentComponent implements OnInit {
  employeeForm: FormGroup;
  employeeId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: DemoListeService
  ) {
    this.employeeForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.employeeId = +params.get('id')!;
      this.loadEmployee(this.employeeId);
    });
  }

  loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe((employee: Employee) => {
      this.employeeForm.patchValue(employee);
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.employeeService.updateEmployee(this.employeeForm.value).subscribe(() => {
        this.router.navigate(['/dashboard/employees']);
      });
    }
  }
}
