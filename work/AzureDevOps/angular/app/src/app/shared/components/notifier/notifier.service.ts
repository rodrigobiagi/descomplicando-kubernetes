import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NotifierComponent } from "./notifier.component";

@Injectable()
export class NotifierService {

    constructor(private snackbar: MatSnackBar) { }

    showNotification(displayMessage: string, title: string, messageType: 'error' | 'success' | 'info' | 'warning') {

        this.snackbar.openFromComponent(NotifierComponent, {
            data: {
                message: displayMessage,
                title: title,
                type: messageType
            },
            panelClass: messageType
        });
    }
 }
