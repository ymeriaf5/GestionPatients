import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DemoListeComponent} from "./demo-liste/demo-liste.component";
import {AddEmployeeComponent} from "./add-employee/add-employee.component";
import {EmployeeFormComponentComponent} from "./employee-form-component/employee-form-component.component";
import {StepperComponent} from "./stepper/stepper.component";

const routes: Routes = [
  { path: 'employes', component: DemoListeComponent},
  { path:'employes/add',component: AddEmployeeComponent},
  { path: 'employees/update/:id', component: EmployeeFormComponentComponent},
  { path: 'stepper', component: StepperComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
