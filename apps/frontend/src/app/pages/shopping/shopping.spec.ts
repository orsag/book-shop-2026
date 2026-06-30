import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Shopping } from './shopping';
import { provideRouter } from '@angular/router';

describe('Shopping', () => {
  let component: Shopping;
  let fixture: ComponentFixture<Shopping>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shopping],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Shopping);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
