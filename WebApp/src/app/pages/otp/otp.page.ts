import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage {
  otp = '';
  error = '';
  otpPlaceholder = 'Enter OTP';

  constructor(private auth: AuthService, private router: Router, public loadingSvc: LoadingService) {}

  login() {
    const email = this.auth.email$.value;
    this.error = '';
    this.loadingSvc.show();
    this.auth.verifyOtp(email!, this.otp).subscribe({
      next: (res) => {
        this.loadingSvc.hide();
        if (res.login_success) {
          localStorage.removeItem('sparchat-thread');
          this.auth.setSession(res.access, res.refresh, email!);
          this.router.navigate(['/chat']);
        } else {
          this.error = 'Invalid OTP';
        }
      },
      error: () => {
        this.loadingSvc.hide();
        this.error = 'Login failed';
      }
    });
  }

  onFocusOTP() {
    this.otpPlaceholder = '';
  }
  
  onBlurOTP() {
    if (!this.otp) {
      this.otpPlaceholder = 'Enter OTP';
    }
  }
}