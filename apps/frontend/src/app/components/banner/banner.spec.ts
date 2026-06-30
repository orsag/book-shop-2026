import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent } from './banner';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '../../core/transloco-testing.module';

describe('Banner', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerComponent, getTranslocoModule()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
