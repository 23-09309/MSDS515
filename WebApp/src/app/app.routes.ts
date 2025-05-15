import { Routes } from '@angular/router';

import { RegisterPage } from './pages/register/register.page';
import { ConfirmEmailPage } from './pages/confirm-email/confirm-email.page';
import { LoginPage } from './pages/login/login.page';
import { OtpPage } from './pages/otp/otp.page';
import { ChatPage } from './pages/chat/chat.page';
import { LogoutPage } from './pages/logout/logout.page';

export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterPage },
  { path: 'confirm-email', component: ConfirmEmailPage },
  { path: 'login', component: LoginPage },
  { path: 'otp', component: OtpPage },
  { path: 'chat', component: ChatPage },
  { path: 'logout', component: LogoutPage },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage)
  }
];