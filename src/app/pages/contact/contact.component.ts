import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecaptchaService } from '../../services/recaptcha.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private recaptcha: RecaptchaService
  ) {}

  ngOnInit(): void {
    this.recaptcha.loadRecaptchaScript();
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Honeypot anti-bot
    if ((form.querySelector('input[name="website"]') as HTMLInputElement)?.value) {
      console.warn('[Contact] Honeypot triggered');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      // ✅ Get reCAPTCHA token safely
      const token = await this.recaptcha.execute();
      console.log('[Contact] Got reCAPTCHA token');

      // ✅ Verify on backend
      const result = await this.recaptcha.verifyToken(token);

      if (result.success) {
        this.sendToFormspree(formData);
      } else {
        this.isSubmitting = false;
        console.warn('[Contact] reCAPTCHA failed:', result.reason);
        this.errorMessage = `Verification failed: ${result.reason}`;
      }
    } catch (err) {
      this.isSubmitting = false;
      console.error('[Contact] reCAPTCHA error:', err);
      this.errorMessage = 'Error executing reCAPTCHA. Please try again.';
    }
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
      },
    });
  }
}
