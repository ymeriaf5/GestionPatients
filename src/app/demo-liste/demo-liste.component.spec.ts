import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoListeComponent } from './demo-liste.component';

describe('DemoListeComponent', () => {
  let component: DemoListeComponent;
  let fixture: ComponentFixture<DemoListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DemoListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
