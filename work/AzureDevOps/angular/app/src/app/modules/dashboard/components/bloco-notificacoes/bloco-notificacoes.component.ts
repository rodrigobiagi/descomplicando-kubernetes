import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCommonComponent } from 'src/app/modules/produtos/sub-modules/e-contrato/components/dialog-common/dialog-common.component';
import { DialogCustomService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/dialog-custom.service';

@Component({
  selector: 'app-bloco-notificacoes',
  templateUrl: './bloco-notificacoes.component.html',
  styleUrls: ['./bloco-notificacoes.component.scss']
})
export class BlocoNotificacoesComponent implements OnInit {

  constructor(public dialogService: DialogCustomService, public dialog: MatDialog,) { }

  ngOnInit(): void {
  }

  openModalRestricao() {
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
