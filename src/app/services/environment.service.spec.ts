import { TestBed } from '@angular/core/testing';
import { EnvironmentService } from './environment.service';
import { environment } from '../../environments/environment';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvironmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the correct production flag', () => {
    expect(service.production).toBe(environment.production);
  });

  it('should return the correct reCAPTCHA site key', () => {
    expect(service.recaptchaSiteKey).toBe(environment.recaptchaSiteKey);
  });

  it('should return the correct verifyRecaptchaUrl', () => {
    expect(service.verifyRecaptchaUrl).toBe(environment.verifyRecaptchaUrl);
  });
});
