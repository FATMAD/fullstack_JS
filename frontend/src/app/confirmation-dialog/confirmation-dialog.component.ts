import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // Importer CommonModule pour le binding Angular standard
import { MatButtonModule } from '@angular/material/button'; // Pour les boutons Angular Material

import { MatDialogModule } from '@angular/material/dialog'; // Import du module dialog
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true, // Rendre le composant standalone
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  imports: [CommonModule, MatButtonModule, MatDialogModule], // Importation des modules nécessaires
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>, // Pour la référence du dialog
    @Inject(MAT_DIALOG_DATA) public data: { message: string } // Injection des données
  ) {}

  onConfirm(): void {
    this.dialogRef.close('confirm');
  }

  onCancel(): void {
    this.dialogRef.close('cancel');
  }
}
