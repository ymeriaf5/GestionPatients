import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DemoListeService } from "../demo-liste-service.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  passwordFieldType: string = 'password';
  showOtpForm: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: DemoListeService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.authenticate(email, password).subscribe(
        response => {
          this.showOtpForm = true;
        },
        error => {
          console.error('Authentication failed', error);
          // Handle authentication error (e.g., show an error message)
        }
      );
    }
  }

  onSubmitOtp(): void {
    if (this.otpForm.valid) {
      const otp = this.otpForm.value.otp;
      const email = localStorage.getItem('otp-email');
      if (email) {
        this.authService.verifyOtp(email, otp).subscribe(
          response => {
            this.router.navigate(['/dashboard/patients']);
          },
          error => {
            console.error('OTP verification failed', error);
            // Handle OTP verification error (e.g., show an error message)
          }
        );
      }
    }
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
