import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RecaptchaService } from '../../services/recaptcha.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let mockRecaptchaService: jasmine.SpyObj<RecaptchaService>;

  beforeEach(async () => {
    // ✅ Create a spy object for RecaptchaService
    mockRecaptchaService = jasmine.createSpyObj('RecaptchaService', [
      'loadRecaptchaScript',
      'execute',
      'verifyToken'
    ]);

    // ✅ Make execute() always resolve a fake token
    mockRecaptchaService.execute.and.returnValue(Promise.resolve('FAKE_TOKEN'));

    // ✅ Make verifyToken() always return a success response
    mockRecaptchaService.verifyToken.and.returnValue(
      Promise.resolve({ success: true, reason: 'OK' })
    );

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        BrowserAnimationsModule
      ],
      declarations: [ContactComponent],
      providers: [{ provide: RecaptchaService, useValue: mockRecaptchaService }]
    }).compileComponents();


    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call reCAPTCHA and verify token on submit', async () => {
    // ✅ Build a fake form
    const fakeEvent = {
      preventDefault: () => {},
      target: document.createElement('form')
    } as unknown as Event;

    await component.onSubmit(fakeEvent);

    expect(mockRecaptchaService.execute).toHaveBeenCalled();
    expect(mockRecaptchaService.verifyToken).toHaveBeenCalledWith('FAKE_TOKEN');
  });
});
