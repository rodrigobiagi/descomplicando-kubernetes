import { Component, OnInit } from '@angular/core';
import { DialogCustomService } from '../../services/dialog-custom.service';

@Component({
  selector: 'app-transacao-negada-alert',
  templateUrl: './transacao-negada-alert.component.html',
  styleUrls: ['./transacao-negada-alert.component.scss']
})
export class TransacaoNegadaAlertComponent implements OnInit {

  constructor(
    private dialogService: DialogCustomService
  ) { }

  ngOnInit(): void {
    this.dialogService.setDialogData('nodata');
  }

}
