import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
  imports: [FormsModule],
  providers: [UserService]
})
export class UserFormComponent {
  @Input() user: any = null;  // Input user for editing, null for adding new
  @Output() userSaved = new EventEmitter<void>();  // Emit an event after saving the user

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  birthdate: string = '';
  password: string = '';

  constructor(private userService: UserService) { }

  ngOnInit() {
    if (this.user) {
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName;
      this.email = this.user.email;
      this.birthdate = this.user.birthdate;
      this.password = this.user.password;
    }
  }

  saveUser() {
    const userData = { firstName: this.firstName, lastName: this.lastName, email: this.email, birthdate: this.birthdate, password: this.password };

    if (this.user) {
      this.userService.updateUser(this.user.id, userData).subscribe(() => {
        this.userSaved.emit();
      });
    } else {
      this.userService.createUser(userData).subscribe(() => {
        this.userSaved.emit();
      });
    }
  }
}
