import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DemoListeComponent} from "./demo-liste/demo-liste.component";
import {AddEmployeeComponent} from "./add-employee/add-employee.component";
import {EmployeeFormComponentComponent} from "./employee-form-component/employee-form-component.component";
import {StepperComponent} from "./stepper/stepper.component";
import {AdminTemplateComponent} from "./admin-template/admin-template.component";
import {LoginComponent} from "./login/login.component";
import {ListePatientComponent} from "./liste-patient/liste-patient.component";
import {AddPatientComponent} from "./add-patient/add-patient.component";
import {UpdatePatientComponent} from "./update-patient/update-patient.component";

const routes: Routes = [


  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: AdminTemplateComponent, children: [
      { path: 'employees', component: DemoListeComponent},
      { path: 'stepper', component: StepperComponent},
      { path:'employees/add',component: AddEmployeeComponent},
      { path: 'employees/update/:id', component: EmployeeFormComponentComponent},
      {path: 'patients', component: ListePatientComponent},
      { path: 'patients/add', component: AddPatientComponent },
      { path: 'patients/update/:id', component: UpdatePatientComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
