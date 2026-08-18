import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent } from './banner';
import { provideRouter } from '@angular/router';
import { getTranslocoModule } from '@core';
import { computed, signal } from '@angular/core';
import { AppStore } from '@store';

describe('Banner', () => {
  let component: BannerComponent;
  let mockAppStore: any;
  let fixture: ComponentFixture<BannerComponent>;

  beforeEach(async () => {
    mockAppStore = {
      isLoading: signal(false),
      isGame: computed(() => true),
      isBook: computed(() => true),
      isGastro: computed(() => true),
    };

    await TestBed.configureTestingModule({
      imports: [BannerComponent, getTranslocoModule()],
      providers: [
        provideRouter([]),
        { provide: AppStore, useValue: mockAppStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
