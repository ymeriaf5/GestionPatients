import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DemoListeService } from '../demo-liste-service.service';

@Component({
  selector: 'app-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrls: ['./admin-template.component.css']
})
export class AdminTemplateComponent implements OnInit {
  title = 'New title';
  userName?: string;

  constructor(
    private demoListeService: DemoListeService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUserName();
  }

  private async loadUserName() {
    const token = localStorage.getItem('token');
    if (token) {
      // @ts-ignore
      this.userName = localStorage.getItem('username');
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
