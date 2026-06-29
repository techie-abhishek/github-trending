
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ProjectDetailsComponent } from './project-details.component';
import { createMockRepo } from '../../testing/mock-data';

describe('ProjectDetailsComponent', () => {
  let fixture: ComponentFixture<ProjectDetailsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsComponent);
    httpMock = TestBed.inject(HttpTestingController);

    fixture.componentRef.setInput('owner', 'octocat');
    fixture.componentRef.setInput('name', 'hello-world');

    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should display the repository name and stats after the API responds', fakeAsync(() => {

    const req = httpMock.expectOne(
      'https://api.github.com/repos/octocat/hello-world'
    );
    req.flush(
      createMockRepo({
        name: 'hello-world',
        full_name: 'octocat/hello-world',
        stargazers_count: 5000,
        forks_count: 900,
        language: 'Go',
      })
    );

    tick();
    fixture.detectChanges();

    const text: string = fixture.debugElement.nativeElement.textContent;

    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent.trim()).toBe('hello-world');

    expect(text).toContain('5.0k');
    expect(text).toContain('900');
    expect(text).toContain('Go');
  }));
});
