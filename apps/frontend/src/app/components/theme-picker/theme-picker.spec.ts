import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemePicker } from './theme-picker';

describe('ThemePicker', () => {
  let component: ThemePicker;
  let fixture: ComponentFixture<ThemePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemePicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
