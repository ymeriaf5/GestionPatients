import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {DemoListeService} from "../demo-liste-service.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordFieldType: string = 'password';
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: DemoListeService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.authenticate(email, password).subscribe(
        response => {
          localStorage.setItem('token', response.token); // Save token in local storage or use another method
          this.router.navigate(['/dashboard/employees']);
        },
        error => {
          console.error('Authentication failed', error);
          // Handle authentication error (e.g., show an error message)
        }
      );
    }
  }
  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
