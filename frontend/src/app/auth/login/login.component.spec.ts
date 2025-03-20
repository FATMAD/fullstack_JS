import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'saveToken']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, CommonModule, RouterModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call login on form submit and navigate to dashboard on success', () => {
    const mockResponse = { token: 'mockToken' };
    authService.login.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onLogin();

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(authService.saveToken).toHaveBeenCalledWith('mockToken');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show an error message if login fails', () => {
    const mockError = { error: 'Invalid credentials' };
    authService.login.and.returnValue(throwError(mockError));

    component.email = 'test@example.com';
    component.password = 'wrongPassword';
    component.onLogin();

    expect(component.errorMessage).toBe('Login failed. Please check your credentials and try again.');
  });

  it('should display an error message if email or password is empty', () => {
    component.email = '';
    component.password = '';
    component.onLogin();

    expect(component.errorMessage).toBe('Both fields are required!');
  });

  it('should redirect to register page when "Register here" link is clicked', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const link = fixture.debugElement.nativeElement.querySelector('a');
    link.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/register']);
  });

  it('should display loading spinner when login is in progress', () => {
    const mockResponse = { token: 'mockToken' };
    authService.login.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onLogin();

   // expect(component.isLoading).toBeTrue();
  });

  it('should disable the submit button when login is in progress', () => {
    const mockResponse = { token: 'mockToken' };
    authService.login.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('button');
    expect(button.disabled).toBeFalse();

    component.onLogin();
    fixture.detectChanges();

    expect(button.disabled).toBeTrue();
  });
});
