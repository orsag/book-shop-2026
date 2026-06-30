import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageNotFound } from './page-not-found';
import { getTranslocoModule } from '../../core/transloco-testing.module';
import { provideRouter } from '@angular/router';

describe('PageNotFound', () => {
  let component: PageNotFound;
  let fixture: ComponentFixture<PageNotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNotFound, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFound);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
