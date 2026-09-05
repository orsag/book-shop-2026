import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { provideRouter } from '@angular/router';
import en from '../../../../public/assets/i18n/en.json';
import sk from '../../../../public/assets/i18n/sk.json';
import { PageNotFound } from './page-not-found';

describe('PageNotFound', () => {
  let component: PageNotFound;
  let fixture: ComponentFixture<PageNotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PageNotFound,
        TranslocoTestingModule.forRoot({
          langs: { en, sk },
          translocoConfig: {
            availableLangs: ['en', 'sk'],
            defaultLang: 'sk',
          },
          preloadLangs: true,
        }),
      ],
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