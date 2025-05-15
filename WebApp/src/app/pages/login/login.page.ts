import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  error = '';
  emailPlaceholder = 'Login with your registered BSU email';

  constructor(private auth: AuthService, private router: Router, public loadingSvc: LoadingService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'expired') {
        this.error = 'Your session expired, please log in again.';
      }
    });
  }

  goToRegister(){
    this.router.navigate(['/register']);
  }

  requestOtp() {
    this.error = '';
    this.loadingSvc.show();
    this.auth.requestOtp(this.email).subscribe({
      next: () => {
        this.loadingSvc.hide();
        this.auth.email$.next(this.email);
        this.router.navigate(['/otp']);
      },
      error: () => {
        this.loadingSvc.hide();
        this.error = 'OTP Request failed';
      }
    });
  }
  onFocusEmail() {
    this.emailPlaceholder = '';
  }
  
  onBlurEmail() {
    if (!this.email) {
      this.emailPlaceholder = 'Enter your school email';
    }
  }
}