import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filter } from './filter';
import { getTranslocoModule } from '../../core/transloco-testing.module';

describe('Filter', () => {
  let component: Filter;
  let fixture: ComponentFixture<Filter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Filter, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(Filter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
