import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { ɵComponentDef as ComponentDef } from '@angular/core'; // internal type for metadata

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        NoopAnimationsModule,
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Full-Stack Developer');
  });

  it('should render the hero description', () => {
    const paragraph = fixture.debugElement.query(By.css('p'));
    expect(paragraph.nativeElement.textContent).toContain('Building reliable frontends');
  });

  it('should have a "View My Projects" button', () => {
    const button = fixture.debugElement.query(By.css('button[mat-raised-button]'));
    expect(button.nativeElement.textContent.trim()).toBe('View My Projects');
  });

  it('should render the hero container without animation errors', () => {
    const heroContainer = fixture.debugElement.query(By.css('.hero-container'));
    expect(heroContainer).toBeTruthy(); // The element exists
    expect(() => fixture.detectChanges()).not.toThrow(); // No animation errors
  });

});
