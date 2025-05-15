import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email = '';
  error = '';
  emailPlaceholder = 'Enter your BSU email';

  constructor(private auth: AuthService, private router: Router, public loadingSvc: LoadingService) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  register() {
    this.error = '';
    this.loadingSvc.show();
    this.auth.register(this.email).subscribe({
      next: () => {
        this.loadingSvc.hide();
        this.auth.email$.next(this.email);
        this.router.navigate(['/confirm-email']);
      },
      error: () => {
        this.loadingSvc.hide();
        this.error = 'Registration failed';
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