import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AdminTemplateComponent } from './admin-template/admin-template.component';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { DemoListeComponent } from './demo-liste/demo-liste.component';
import { DemoService } from "./demo-liste/demo-service.service";
import { DemoListeService } from "./demo-liste-service.service";
import { HttpClientModule } from "@angular/common/http";
import { MatTableModule } from "@angular/material/table";
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { EmployeeFormComponentComponent } from './employee-form-component/employee-form-component.component';
import { MatPaginatorModule } from "@angular/material/paginator";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from '@angular/router';
import { MatStepperModule } from "@angular/material/stepper";
import { StepperComponent } from './stepper/stepper.component';
import { LoginComponent } from './login/login.component';
import { MatSortModule } from "@angular/material/sort";
import { MatSelectModule } from "@angular/material/select";
import { ListePatientComponent } from './liste-patient/liste-patient.component';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { UpdatePatientComponent } from './update-patient/update-patient.component';
import { MatDialogModule } from "@angular/material/dialog";
import { ConsultationComponent } from './consultation/consultation.component';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core"; // Required for date picker

@NgModule({
  declarations: [
    AppComponent,
    AdminTemplateComponent,
    DemoListeComponent,
    AddEmployeeComponent,
    EmployeeFormComponentComponent,
    StepperComponent,
    LoginComponent,
    ListePatientComponent,
    AddPatientComponent,
    UpdatePatientComponent,
    ConsultationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    HttpClientModule,
    MatTableModule,
    FormsModule,
    MatCardModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    RouterModule,
    MatStepperModule,
    MatSelectModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule // Required for date picker to work properly
  ],
  providers: [
    provideAnimationsAsync(),
    DemoService,
    DemoListeService
  ],
  bootstrap: [AppComponent],
  exports: [RouterModule]
})
export class AppModule { }
