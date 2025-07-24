import { TestBed } from '@angular/core/testing';
import { RecaptchaService } from './recaptcha.service';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

describe('RecaptchaService', () => {
  let service: RecaptchaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecaptchaService]
    });
    service = TestBed.inject(RecaptchaService);
  });

  afterEach(() => {
    // Cleanup fake scripts
    document.querySelectorAll('script[src*="recaptcha/api.js"]').forEach(el => el.remove());
    delete window.grecaptcha;
  });

  it('should inject recaptcha script only once', () => {
    service.loadRecaptchaScript();
    service.loadRecaptchaScript();

    const scripts = document.querySelectorAll('script[src*="recaptcha/api.js"]') as NodeListOf<HTMLScriptElement>;
    expect(scripts.length).toBe(1);
    expect(scripts[0].src).toContain('recaptcha/api.js');
  });

  it('should resolve a token from grecaptcha.execute', async () => {
    // Mock grecaptcha
    window.grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: () => Promise.resolve('FAKE_TOKEN_123')
    };

    const token = await service.execute();
    expect(token).toBe('FAKE_TOKEN_123');
  });

});
