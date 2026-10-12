import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Gestas } from './gestas';

describe('Gestas', () => {
  let component: Gestas;
  let fixture: ComponentFixture<Gestas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gestas],
    }).compileComponents();

    fixture = TestBed.createComponent(Gestas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
