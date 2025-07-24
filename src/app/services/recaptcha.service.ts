import { Injectable } from '@angular/core';
import { EnvironmentService } from './environment.service';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private scriptLoaded = false;
  private loadingPromise?: Promise<void>;

  constructor(private env: EnvironmentService) {}

  /** Load script only once */
  loadRecaptchaScript(): Promise<void> {
    if (this.scriptLoaded) return Promise.resolve();

    if (!this.loadingPromise) {
      this.loadingPromise = new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src*="recaptcha/api.js"]`)) {
          console.log('[RecaptchaService] Script already exists.');
          this.scriptLoaded = true;
          return resolve();
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${this.env.recaptchaSiteKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('[RecaptchaService] Script loaded.');
          this.scriptLoaded = true;
          resolve();
        };
        script.onerror = () => reject('Failed to load reCAPTCHA script');
        document.head.appendChild(script);
      });
    }

    return this.loadingPromise;
  }

  /** Safely get a token */
  async execute(): Promise<string> {
    await this.loadRecaptchaScript(); // ✅ ensure script is present

    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        return reject('grecaptcha is not available');
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(this.env.recaptchaSiteKey, { action: 'contact_form' })
          .then((token: string) => resolve(token))
          .catch((err: any) => reject(err));
      });
    });
  }

  /** Verify token on backend */
    async verifyToken(token: string): Promise<{ success: boolean; reason?: string }> {
    const apiUrl = window.location.hostname === 'localhost'
        ? 'https://us-east1-angular-dev-portfolio.cloudfunctions.net/verifyRecaptchaPortfolio'
        : '/api/verifyRecaptcha'; // ✅ in prod, still use rewrite
    
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recaptchaToken: token }),
    });

    // If backend returns HTML error → throw explicitly
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        console.error('[verifyToken] Backend returned non-JSON:', text);
        throw new Error(`Invalid backend response: ${res.status}`);
    }
  }

}
