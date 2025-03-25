import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html', // Chemin vers ton fichier HTML
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  birthdate: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    this.authService
      .register(
        this.firstName,
        this.lastName,
        this.email,
        this.password,
        this.birthdate
      )
      .subscribe(
        (response: any) => {
          this.router.navigate(['/login']);
        },
        (error: any) => {
          console.error('Registration failed', error);
        }
      );
  }
}
