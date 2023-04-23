import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgrxFsmComponent } from './ngrx-fsm.component';

describe('NgrxFsmComponent', () => {
  let component: NgrxFsmComponent;
  let fixture: ComponentFixture<NgrxFsmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgrxFsmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgrxFsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
