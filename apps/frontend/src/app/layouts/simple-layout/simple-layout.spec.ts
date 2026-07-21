import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SimpleLayoutComponent as SimpleLayout,
} from './simple-layout';
import { getTranslocoModule } from '@core';
import { provideRouter } from '@angular/router';

describe('SimpleLayout', () => {
  let component: SimpleLayout;
  let fixture: ComponentFixture<SimpleLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleLayout, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
