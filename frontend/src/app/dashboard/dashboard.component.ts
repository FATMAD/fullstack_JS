import { Component } from '@angular/core';
import { UserFormComponent } from '../user-form/user-form.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/User';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [UserService],
  imports: [
    UserFormComponent,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    ConfirmationDialogComponent,
  ], // Import necessary Angular Material modules
})
export class DashboardComponent {
  users: User[] = [];
  isLoading = false;
  selectedUser: User | null = null;
  private showUserFormSubject = new BehaviorSubject<boolean>(false);
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Expose observable for template subscription
  get showUserForm$() {
    return this.showUserFormSubject.asObservable();
  }

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  // Fetch users from the backend
  fetchUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe(
      (data: User[]) => {
        this.users = data;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching users', error);
        this.isLoading = false;
        this.errorMessage =
          'Une erreur est survenue lors de la récupération des utilisateurs.'; // Set error message
      }
    );
  }

  // Delete a user
  deleteUser(userId: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to delete this user?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.userService.deleteUser(userId).subscribe(
          () => {
            this.successMessage = 'Utilisateur supprimé avec succès.'; // Set success message
            this.fetchUsers(); // Refresh the user list after deletion
          },
          (error: any) => {
            console.error('Error deleting user', error);
            this.errorMessage =
              "Une erreur est survenue lors de la suppression de l'utilisateur."; // Set error message
          }
        );
      }
    });
  }

  // Open form for creating a new user
  openCreateUserForm() {
    this.selectedUser = null; // Reset selected user
    this.showUserFormSubject.next(true); // Show the user form
  }

  // Open form for editing an existing user
  editUser(user: User) {
    this.selectedUser = { ...user }; // Clone the user data for editing
    this.showUserFormSubject.next(true); // Show the user form
  }

  // Handle user saved event after create or update
  onUserSaved() {
    this.showUserFormSubject.next(false); // Hide the form
    this.fetchUsers(); // Refresh the user list
    this.successMessage = 'Utilisateur enregistré avec succès.'; // Set success message
  }

  // Close the user form without saving
  closeUserForm() {
    this.showUserFormSubject.next(false);
  }
}
