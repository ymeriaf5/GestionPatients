import { TestBed } from '@angular/core/testing';
import {DemoListeService} from "./demo-liste-service.service";


describe('DemoListeServiceService', () => {
  let service: DemoListeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoListeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
