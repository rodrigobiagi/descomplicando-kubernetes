import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notifier',
  templateUrl: './notifier.component.html',
  styleUrls: ['./notifier.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotifierComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any, public snackbarRef: MatSnackBarRef<NotifierComponent>) { }

  ngOnInit(): void {
  }
  
  getFormatacao(message: string) {
    document.getElementById('notifier').innerHTML = message;
    return '';
  }
}
