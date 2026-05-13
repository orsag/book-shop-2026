import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookTable } from './book-table';

describe('BookTable', () => {
  let component: BookTable;
  let fixture: ComponentFixture<BookTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookTable],
    }).compileComponents();

    fixture = TestBed.createComponent(BookTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
