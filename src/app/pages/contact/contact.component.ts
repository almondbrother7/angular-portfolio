import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../../services/environment.service';

declare const grecaptcha: any;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private env: EnvironmentService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRecaptchaScript();
  }

  private loadRecaptchaScript() {
    // Prevent duplicate script injection
    if (document.querySelector(`script[src*="recaptcha/api.js"]`)) {
      console.log('[Contact] reCAPTCHA script already present.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${this.env.recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => console.log('[Contact] reCAPTCHA script loaded for key:', this.env.recaptchaSiteKey);
    document.head.appendChild(script);
  }

  onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Honeypot anti-bot field
    const honeypot = (form.querySelector('input[name="website"]') as HTMLInputElement)?.value;
    if (honeypot) {
      console.warn('Honeypot field filled - likely a bot.');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    grecaptcha.ready(() => {
      grecaptcha.execute(this.env.recaptchaSiteKey, { action: 'contact_form' }).then((token: string) => {
        fetch("/api/verifyRecaptcha", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recaptchaToken: token })
        })
        .then(res => res.json())
        .then(result => {
          console.log(`[Contact] reCAPTCHA verification: success=${result.success} reason=${result.reason ?? 'OK'}`);
          if (result.success) {
            this.sendToFormspree(formData);
          } else {
            this.isSubmitting = false;
            console.warn('reCAPTCHA verification failed:', result.reason);
            this.errorMessage = 'Verification failed. Please try again or contact me directly.';
          }
        })
        .catch(() => {
          this.isSubmitting = false;
          this.errorMessage = 'Error verifying reCAPTCHA.';
        });
      });
    });
  }

  private sendToFormspree(formData: FormData) {
    this.http.post('https://formspree.io/f/movwrved', formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = '✅ Your message has been sent successfully!';
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = '❌ Something went wrong. Please try again later.';
      }
    });
  }
}
