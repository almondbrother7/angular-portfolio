import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../../services/environment.service';

declare const grecaptcha: any;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private env: EnvironmentService, private http: HttpClient) {}

  onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const honeypot = (form.querySelector('input[name="website"]') as HTMLInputElement)?.value;
    if (honeypot) {
      console.warn('Honeypot field filled - likely a bot.');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    grecaptcha.ready(() => {
      grecaptcha.execute(this.env.recaptchaSiteKey, { action: 'submit' }).then((token: string) => {
        console.log(token);
        fetch("/api/verifyRecaptcha", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recaptchaToken: token })
        })
        .then(res => res.json())
        .then(result => {
          console.log('reCAPTCHA verification result:', result);
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
