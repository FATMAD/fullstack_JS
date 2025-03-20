import { Component } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes'; // Import your routes
import { AuthInterceptor } from './services/auth.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  title = 'frontend';

}
