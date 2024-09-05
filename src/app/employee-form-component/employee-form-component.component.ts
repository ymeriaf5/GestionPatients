import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
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
  hidePassword = true;
  hideRetypePassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: DemoListeService
  ) {
    this.employeeForm = this.fb.group({
      id_Personelle: [''],
      Nom: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      MotDePasse: ['', Validators.required],
      retypePassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.employeeId = +params.get('id')!;
      if (this.employeeId) {
        this.loadEmployee(this.employeeId);
      }
    });
  }

  loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe((employee: Employee) => {
      this.employeeForm.patchValue({
        ...employee,
        MotDePasse: '',  // Clear the password field for security reasons
        retypePassword: ''  // Ensure the retype password field is also clear
      });
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      console.log('Form Data:', this.employeeForm.value); // Debugging line
      this.employeeService.updateEmployee(this.employeeForm.value).subscribe(
        () => {
          this.router.navigate(['/dashboard/patients']);
        },
        (error) => {
          console.error('Error updating employee:', error); // Handle error
        }
      );
    } else {
      console.warn('Form is invalid', this.employeeForm.errors); // Debugging line
    }
  }


  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const password = control.get('MotDePasse')?.value;
    const retypePassword = control.get('retypePassword')?.value;
    return password === retypePassword ? null : { 'mismatch': true };
  };
}
