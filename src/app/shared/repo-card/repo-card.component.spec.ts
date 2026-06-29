
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RepoCardComponent } from './repo-card.component';
import { createMockRepo } from '../../testing/mock-data';

describe('RepoCardComponent', () => {
  let fixture: ComponentFixture<RepoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepoCardComponent],

      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RepoCardComponent);

    fixture.componentRef.setInput('repo', createMockRepo({
      name: 'awesome-project',
      stargazers_count: 12300,
      forks_count: 456,
      language: 'TypeScript',
    }));

    fixture.detectChanges();
  });

  it('should display the repository name', () => {
    const heading = fixture.debugElement.query(By.css('h2'));
    expect(heading.nativeElement.textContent.trim()).toBe('awesome-project');
  });

  it('should display the formatted star count (12.3k)', () => {
    const starSpan = fixture.debugElement.query(
      By.css('span[aria-label="12.3k stars"]')
    );
    expect(starSpan).withContext('Star count span should exist').not.toBeNull();
    expect(starSpan.nativeElement.textContent.trim()).toBe('12.3k');
  });

  it('should display the language badge', () => {
    const langText = fixture.debugElement.nativeElement.textContent as string;
    expect(langText).toContain('TypeScript');
  });
});
