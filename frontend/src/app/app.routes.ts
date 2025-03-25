import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
