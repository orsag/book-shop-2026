import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardSmall } from './card-small';

describe('BookCard', () => {
  let component: CardSmall;
  let fixture: ComponentFixture<CardSmall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSmall],
    }).compileComponents();

    fixture = TestBed.createComponent(CardSmall);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
