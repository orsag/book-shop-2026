import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookListItem } from './book-list-item';

describe('BookListItem', () => {
  let component: BookListItem;
  let fixture: ComponentFixture<BookListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(BookListItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
