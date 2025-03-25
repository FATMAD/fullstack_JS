import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = ''; // Ajout de la propriété errorMessage
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Both fields are required!'; // Message d'erreur pour champs vides
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Login failed', error);
        this.errorMessage =
          'Login failed. Please check your credentials and try again.'; // Message d'erreur en cas d'échec
        this.isLoading = false;
      }
    );
  }

  redirectToRegister() {
    this.router.navigate(['/register']);
  }
}
