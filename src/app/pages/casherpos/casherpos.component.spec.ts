import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasherposComponent } from './casherpos.component';

describe('CasherposComponent', () => {
  let component: CasherposComponent;
  let fixture: ComponentFixture<CasherposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasherposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasherposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
