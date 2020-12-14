import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
 
@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {
  title: string;
  message: string;
  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ErrorDialogModel) {
    this.title = data.title;
    this.message = data.message;
   }
 
  ngOnInit() {
  }
 
  public closeDialog = () => {
    this.dialogRef.close();
  }
}
export class ErrorDialogModel {
  constructor(public title: string, public message: string) {
  }
}