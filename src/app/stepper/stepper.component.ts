import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import {DemoListeService} from "../demo-liste-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css'
})
export class StepperComponent implements OnInit{
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  constructor(private _formBuilder: FormBuilder ,
              private demoService: DemoListeService,
              private router: Router,) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      name: ['', Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.thirdFormGroup = this._formBuilder.group({
      password: ['', Validators.required]
    });
  }
  onSubmit() {
    if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
      const employeeData = {
        name: this.firstFormGroup.value.name,
        email: this.secondFormGroup.value.email,
        password: this.thirdFormGroup.value.password
      };

      // @ts-ignore
      this.demoService.addEmployee(employeeData).subscribe(
        response => {
          if (response.status === 201) {
            console.log('Employee added successfully');
            this.router.navigate(['/employes']);
          } else {
            console.error('Failed to add employee');
          }
        },
        error => {
          console.error('Error adding employee', error);
        }
      );
    }
  }
}
