import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookTable } from './book-table';
import { getTranslocoModule } from '../../core/transloco-testing.module';

describe('BookTable', () => {
  let component: BookTable;
  let fixture: ComponentFixture<BookTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookTable, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(BookTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
