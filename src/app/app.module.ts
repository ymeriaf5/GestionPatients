import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AdminTemplateComponent } from './admin-template/admin-template.component';
import {MatToolbar, MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {MatDrawerContainer, MatSidenavModule} from "@angular/material/sidenav";
import {MatList, MatListItem, MatNavList} from "@angular/material/list";
import { DemoListeComponent } from './demo-liste/demo-liste.component';
import {DemoService} from "./demo-liste/demo-service.service";
import {DemoListeService} from "./demo-liste-service.service";
import {HttpClientModule} from "@angular/common/http";
import {MatTable, MatTableModule} from "@angular/material/table";
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCard, MatCardModule} from "@angular/material/card";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { EmployeeFormComponentComponent } from './employee-form-component/employee-form-component.component';
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    AdminTemplateComponent,
    DemoListeComponent,
    AddEmployeeComponent,
    EmployeeFormComponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatNavList,
    MatListItem,
    MatList,
    HttpClientModule,
    MatTableModule,
    FormsModule,
    MatCardModule,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    RouterModule,
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


