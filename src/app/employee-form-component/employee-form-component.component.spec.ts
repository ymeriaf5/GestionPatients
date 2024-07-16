import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeFormComponentComponent } from './employee-form-component.component';

describe('EmployeeFormComponentComponent', () => {
  let component: EmployeeFormComponentComponent;
  let fixture: ComponentFixture<EmployeeFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
