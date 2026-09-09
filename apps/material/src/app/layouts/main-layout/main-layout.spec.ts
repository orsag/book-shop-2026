import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MainLayoutComponent } from './main-layout';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Filter } from '../../components/filter/filter';
import { MockComponent } from 'ng-mocks';

describe('MainLayout', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(MainLayoutComponent, {
      remove: { imports: [Navbar, Footer, Filter] },
      add: {
        imports: [
          MockComponent(Navbar),
          MockComponent(Footer),
          MockComponent(Filter),
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});