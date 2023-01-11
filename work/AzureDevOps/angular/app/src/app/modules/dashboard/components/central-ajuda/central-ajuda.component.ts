import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCommonComponent } from 'src/app/modules/produtos/sub-modules/e-contrato/components/dialog-common/dialog-common.component';

@Component({
  selector: 'app-central-ajuda',
  templateUrl: './central-ajuda.component.html',
  styleUrls: ['./central-ajuda.component.scss']
})
export class CentralAjudaComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  onClickCentralAjuda() {
    this.dialog.open(DialogCommonComponent, {
      width: '440px',
      data: {
        title: 'Em breve você poderá acessar esta área.',
        text: 'Agradecemos o interesse, esta área não está disponível no momento. Avisaremos quando estiver disponível.',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Entendi'
        },
        disableCancelBtn: true
      }
    });
  }

}
