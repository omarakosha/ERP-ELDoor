import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesReport } from './purchases-report';

describe('PurchasesReport', () => {
  let component: PurchasesReport;
  let fixture: ComponentFixture<PurchasesReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
