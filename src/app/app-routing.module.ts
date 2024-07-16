import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DemoListeComponent} from "./demo-liste/demo-liste.component";
import {AddEmployeeComponent} from "./add-employee/add-employee.component";
import {EmployeeFormComponentComponent} from "./employee-form-component/employee-form-component.component";

const routes: Routes = [
  { path: 'employes', component: DemoListeComponent},
  { path:'employes/add',component: AddEmployeeComponent},
  { path: 'employees/update/:id', component: EmployeeFormComponentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
