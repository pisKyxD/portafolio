import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SobreMi } from './sobre-mi';

describe('SobreMi', () => {
  let component: SobreMi;
  let fixture: ComponentFixture<SobreMi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobreMi],
    }).compileComponents();

    fixture = TestBed.createComponent(SobreMi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
