/**
 * TESTS 1, 3, 5 — DashboardComponent
 *
 * Test 1: Dashboard renders exactly 20 repo cards when service returns data.
 * Test 3: Clicking a repo card navigates to /repos/:owner/:name.
 * Test 5: Switching the period filter calls the service with the new period.
 *
 * NOTE ON TEST STRATEGY
 * ─────────────────────
 * We mock GithubService (spy) rather than using HttpTestingController here because:
 *   1. resource() resolves its loader Promise asynchronously, and Angular's test
 *      zone needs whenStable() to catch that — not compatible with fakeAsync + tick.
 *   2. The @defer (on immediate) block uses requestAnimationFrame internally,
 *      which is also easier to handle with async/await + whenStable().
 * Test 5 verifies the period argument passed to the service, which is sufficient
 * to prove that the correct time window is sent to the API.
 */
import {
  ComponentFixture,
  TestBed,
  DeferBlockBehavior,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { RepoCardComponent } from '../../shared/repo-card/repo-card.component';
import { GithubService } from '../../core/services/github.service';
import { RateLimitService } from '../../core/interceptors/rate-limit.service';
import { createMockSearchResult } from '../../testing/mock-data';
import { routes } from '../../app.routes';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let router: Router;
  let githubSpy: jasmine.SpyObj<GithubService>;

  beforeEach(waitForAsync(() => {
    // Spy wraps the service so we can control return values and assert calls
    // without making real HTTP requests
    githubSpy = jasmine.createSpyObj('GithubService', [
      'getTrendingRepos',
      'getRepoDetails',
      'clearCache',
    ]);
    // Return a synchronous Observable — resolves immediately when subscribed
    githubSpy.getTrendingRepos.and.returnValue(of(createMockSearchResult(20)));

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GithubService, useValue: githubSpy },
        RateLimitService,
      ],
      // Playthrough lets @defer blocks render when their trigger fires naturally
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    }).compileComponents();
  }));

  beforeEach(waitForAsync(async () => {
    fixture = TestBed.createComponent(DashboardComponent);
    router = TestBed.inject(Router);

    fixture.detectChanges();
    // whenStable() waits for all pending Promises/microtasks, including resource()
    await fixture.whenStable();
    fixture.detectChanges();
  }));

  // ── TEST 1 ────────────────────────────────────────────────────────────────
  it('should render exactly 20 repo cards when service returns data', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(RepoCardComponent));
    expect(cards.length)
      .withContext('Expected exactly 20 RepoCardComponent instances')
      .toBe(20);
  });

  // ── TEST 3 ────────────────────────────────────────────────────────────────
  it('should navigate to /repos/:owner/:name when a card is clicked', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const navigateSpy = spyOn(router, 'navigate').and.returnValue(
      Promise.resolve(true)
    );

    // The first mock repo (from createMockSearchResult) is octocat/repo-1
    const firstCard = fixture.debugElement.query(By.css('article[role="button"]'));
    expect(firstCard)
      .withContext('A card article element should exist in the DOM')
      .not.toBeNull();

    firstCard.nativeElement.click();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/repos', 'octocat', 'repo-1']);
  });

  // ── TEST 5 ────────────────────────────────────────────────────────────────
  it('should call getTrendingRepos with "monthly" when "This Month" is selected', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    // Reset the call count so we can cleanly verify the next call
    githubSpy.getTrendingRepos.calls.reset();

    const buttons = fixture.debugElement.queryAll(By.css('button[aria-pressed]'));
    const monthlyBtn = buttons.find(
      b => b.nativeElement.textContent.trim() === 'This Month'
    );
    expect(monthlyBtn)
      .withContext('"This Month" button must be present')
      .not.toBeUndefined();

    monthlyBtn!.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();

    // The period 'monthly' maps to a 30-day lookback in GithubService.getDateBefore(30)
    // Verifying the service was called with 'monthly' proves the right time window was requested
    expect(githubSpy.getTrendingRepos)
      .toHaveBeenCalledWith('monthly');
  });
});
