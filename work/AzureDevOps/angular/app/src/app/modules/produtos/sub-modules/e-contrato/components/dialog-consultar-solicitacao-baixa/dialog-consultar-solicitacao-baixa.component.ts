import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetalheBaixarCancelarContrato } from '../../core/models/transacoes/detalhe-baixar-cancelar-contrato.model';
import { TransacoesDetalhes } from '../../core/models/transacoes/transacoes-detalhes.model';
import { Transacoes } from '../../core/models/transacoes/transacoes.model';
import { DialogCustomService } from '../../services/dialog-custom.service';

@Component({
  selector: 'app-dialog-consultar-solicitacao-baixa',
  templateUrl: './dialog-consultar-solicitacao-baixa.component.html',
  styleUrls: ['./dialog-consultar-solicitacao-baixa.component.scss']
})
export class DialogConsultarSolicitacaoBaixaComponent implements OnInit {

  step: string = 'negado';

  constructor(
    private dialogService: DialogCustomService,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, transacao: Transacoes, transacaoDetalhes: TransacoesDetalhes }
  ) { }

  ngOnInit(): void {
    this.step = this.setStep(this.data.transacaoDetalhes.detalheBaixarCancelarContrato);
    if (this.step == 'negado') {
      this.dialogService.setDialogData('negado')
    } else {
      this.dialogService.setDialogData('nodata')
    }
  }

  setStep(detalheBaixarCancelarContrato: DetalheBaixarCancelarContrato): string {
    if (!detalheBaixarCancelarContrato.mensagensInconsistencias) {
      if (detalheBaixarCancelarContrato.possuiBaixaContrato || detalheBaixarCancelarContrato.possuiCancelamentoContrato) {
        return 'processado';
      }

      return 'processando';
    }

    return 'negado';
  }

}
