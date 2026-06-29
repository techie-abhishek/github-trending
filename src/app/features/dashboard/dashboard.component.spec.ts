
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

    githubSpy = jasmine.createSpyObj('GithubService', [
      'getTrendingRepos',
      'getRepoDetails',
      'clearCache',
    ]);

    githubSpy.getTrendingRepos.and.returnValue(of(createMockSearchResult(20)));

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GithubService, useValue: githubSpy },
        RateLimitService,
      ],

      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    }).compileComponents();
  }));

  beforeEach(waitForAsync(async () => {
    fixture = TestBed.createComponent(DashboardComponent);
    router = TestBed.inject(Router);

    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();
  }));

  it('should render exactly 20 repo cards when service returns data', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.directive(RepoCardComponent));
    expect(cards.length)
      .withContext('Expected exactly 20 RepoCardComponent instances')
      .toBe(20);
  });

  it('should navigate to /repos/:owner/:name when a card is clicked', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const navigateSpy = spyOn(router, 'navigate').and.returnValue(
      Promise.resolve(true)
    );

    const firstCard = fixture.debugElement.query(By.css('article[role="button"]'));
    expect(firstCard)
      .withContext('A card article element should exist in the DOM')
      .not.toBeNull();

    firstCard.nativeElement.click();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/repos', 'octocat', 'repo-1']);
  });

  it('should call getTrendingRepos with "monthly" when "This Month" is selected', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

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

    expect(githubSpy.getTrendingRepos)
      .toHaveBeenCalledWith('monthly');
  });
});
