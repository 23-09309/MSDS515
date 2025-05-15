import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './confirm-email.page.html',
  styleUrls: ['./confirm-email.page.scss'],
})
export class ConfirmEmailPage {
  code = '';
  error = '';
  codePlaceholder = 'Enter verification code';

  constructor(private auth: AuthService, private router: Router, public loadingSvc: LoadingService) {}

  confirm() {
    const email = this.auth.email$.value;
    if (!email) {
      this.error = 'No email found.';
      return;
    }
    this.loadingSvc.show();
    this.auth.confirm(email, this.code).subscribe({
      next: (res) => {
        this.loadingSvc.hide();
        if (res.registered) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Incorrect code';
        }
      },
      error: () => {
        this.loadingSvc.hide();
        this.error = 'Code verification failed';
      }
    });
  }
  onFocusCode() {
    this.codePlaceholder = '';
  }
  
  onBlurCode() {
    if (!this.code) {
      this.codePlaceholder = 'Enter verification code';
    }
  }
}