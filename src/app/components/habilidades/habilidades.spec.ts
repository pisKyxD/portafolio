import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Habilidades } from './habilidades';

describe('Habilidades', () => {
  let component: Habilidades;
  let fixture: ComponentFixture<Habilidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Habilidades],
    }).compileComponents();

    fixture = TestBed.createComponent(Habilidades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
