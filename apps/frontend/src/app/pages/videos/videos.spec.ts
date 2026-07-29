import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideosComponent } from './videos';
import { getTranslocoModule } from '@core';
import { MockComponent } from 'ng-mocks';
import { VideoPlayer } from '@component';

describe('Videos', () => {
  let component: VideosComponent;
  let fixture: ComponentFixture<VideosComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(VideosComponent, {
      remove: { imports: [VideoPlayer] },
      add: { imports: [MockComponent(VideoPlayer)] },
    });

    await TestBed.configureTestingModule({
      imports: [VideosComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(VideosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
