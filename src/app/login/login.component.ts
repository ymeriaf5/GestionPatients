import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

    loginForm :FormGroup;
    constructor(
      private formBuilder: FormBuilder,
      private router:Router
    ) {
      this.loginForm=this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        }
      );
    }
    onSubmit():void{
      if (this.loginForm?.valid){
        this.router.navigate(['/dashboard/employees'])
      }
    }

}
