import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DemoListeService } from '../demo-liste-service.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  emailForm: FormGroup;
  email?: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private service: DemoListeService
  ) {
    this.emailForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  sendEmail(): void {
    const message = this.emailForm.get('message')?.value;
    // @ts-ignore
    this.email = localStorage.getItem('otp-email');
    console.log(this.email);

    // @ts-ignore
    this.service.sendHelp(this.email, message)
      .subscribe(response => {
        console.log('Email sent successfully', response);
      }, error => {
        console.error('Error sending email', error);
      });
  }
}
