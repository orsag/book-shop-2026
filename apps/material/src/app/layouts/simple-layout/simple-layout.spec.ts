import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SimpleLayoutComponent } from './simple-layout';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { MockComponent } from 'ng-mocks';

describe('SimpleLayout', () => {
  let component: SimpleLayoutComponent;
  let fixture: ComponentFixture<SimpleLayoutComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(SimpleLayoutComponent, {
      remove: { imports: [Navbar, Footer] },
      add: {
        imports: [MockComponent(Navbar), MockComponent(Footer)],
      },
    });

    await TestBed.configureTestingModule({
      imports: [SimpleLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});