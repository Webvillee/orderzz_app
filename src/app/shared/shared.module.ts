import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../app-material/app-material.module';
import { SuccessDialogComponent } from './dialogs/success-dialog/success-dialog.component';
import { ErrorDialogComponent } from './dialogs/error-dialog/error-dialog.component'
import { from } from 'rxjs';
@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule
  ],
  exports: [
    AppMaterialModule,
    SuccessDialogComponent,
    ErrorDialogComponent
  ],
  entryComponents: [
    SuccessDialogComponent,
    ErrorDialogComponent
  ],
  declarations: [SuccessDialogComponent, ErrorDialogComponent]
})
export class SharedModule { }
