import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DemoListeComponent} from "./demo-liste/demo-liste.component";
import {AddEmployeeComponent} from "./add-employee/add-employee.component";
import {EmployeeFormComponentComponent} from "./employee-form-component/employee-form-component.component";
import {StepperComponent} from "./stepper/stepper.component";
import {AdminTemplateComponent} from "./admin-template/admin-template.component";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [


  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: AdminTemplateComponent, children: [
      { path: 'employees', component: DemoListeComponent, children: [
          //{ path:'add',component: AddEmployeeComponent},
          //{ path: 'update/:id', component: EmployeeFormComponentComponent},
        ]},
      { path: 'stepper', component: StepperComponent},
      { path:'employees/add',component: AddEmployeeComponent},
      { path: 'employees/update/:id', component: EmployeeFormComponentComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
