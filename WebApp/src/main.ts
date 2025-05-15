import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
// NEW: import HttpClientModule
import { HttpClientModule } from '@angular/common/http';

// Optionally import Ionic providers
import { provideIonicAngular } from '@ionic/angular/standalone';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SessionInterceptor } from './app/services/session-interceptor.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule), // <-- THIS IS CRUCIAL!
    provideIonicAngular(),
    { provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true }
  ]
});