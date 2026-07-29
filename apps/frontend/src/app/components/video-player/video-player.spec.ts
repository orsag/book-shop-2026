import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoPlayer } from '@component';

describe('VideoPlayer', () => {
  let component: VideoPlayer;
  let fixture: ComponentFixture<VideoPlayer>;

  beforeEach(async () => {
    // Mock global fetch to satisfy rxResource calls inside the component
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ size: 102400, mimeType: 'video/mp4' }),
      }),
    );

    await TestBed.configureTestingModule({
      imports: [VideoPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPlayer);
    component = fixture.componentInstance;

    // Provide a value for the required videoId input signal
    fixture.componentRef.setInput('videoId', 'test-video-123');

    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
