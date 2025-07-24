import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ProjectsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render at least 4 project cards', () => {
    const cards = compiled.querySelectorAll('mat-card.project-card');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('should render a main header', () => {
    const header = compiled.querySelector('h1');
    expect(header?.textContent).toContain('Andrew Carey – Projects');
  });

  it('should contain a CMS HPMS project card with a valid link', () => {
    const cmsCard = compiled.querySelector('mat-card mat-card-title')?.textContent;
    expect(cmsCard).toContain('CMS – Health Plan Management System');

    const cmsLink = compiled.querySelector('a[href*="hpms.cms.gov"]') as HTMLAnchorElement;
    expect(cmsLink).toBeTruthy();
    expect(cmsLink.target).toBe('_blank');
  });

  it('should have at least one GitHub link', () => {
    const githubLinks = Array.from(compiled.querySelectorAll('a')).filter(a =>
      a.href.includes('github.com')
    );
    expect(githubLinks.length).toBeGreaterThan(0);
  });

  it('should have badges for Angular and AWS', () => {
    const badgeImages = Array.from(compiled.querySelectorAll('img'));
    const angularBadge = badgeImages.find(img => img.src.includes('Angular'));
    const awsBadge = badgeImages.find(img => img.src.includes('AWS'));

    expect(angularBadge).toBeTruthy();
    expect(awsBadge).toBeTruthy();
  });

  it('should have a Loom demo link for Real Heroes project', () => {
    const loomLink = compiled.querySelector('a[href*="loom.com"]') as HTMLAnchorElement;
    expect(loomLink).toBeTruthy();
    expect(loomLink.textContent).toContain('Watch the demo');
  });

  it('should include Additional Experience section', () => {
    const additionalSection = compiled.querySelector('div.project h2');
    expect(additionalSection?.textContent).toContain('Additional Experience');

    const experienceList = compiled.querySelectorAll('div.project .icon-text-list li');
    expect(experienceList.length).toBeGreaterThan(2);
  });

  it('should have material icons in each project card', () => {
    const icons = compiled.querySelectorAll('.material-icons');
    expect(icons.length).toBeGreaterThan(0);
  });
});
