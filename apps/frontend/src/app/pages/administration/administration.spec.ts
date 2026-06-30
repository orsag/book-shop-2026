import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Administration } from './administration';
import { getTranslocoModule } from '../../core/transloco-testing.module';

describe('Administration', () => {
  let component: Administration;
  let fixture: ComponentFixture<Administration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Administration, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(Administration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
