import { Component, Input, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { DadosRevisaoRascunho } from '../../../../core/models/rascunhos/dados-revisao-rascunho.model';
import { ObterRevisaoRascunhoResponse } from '../../../../core/responses/rascunhos/obter-revisao-rascunho.response';
import { RascunhoService } from '../../../../services/rascunho.service';

@Component({
  selector: 'app-revisao-rascunho-financiamento',
  templateUrl: './revisao-rascunho-financiamento.component.html',
  styleUrls: ['./revisao-rascunho-financiamento.component.scss']
})
export class RevisaoRascunhoFinanciamentoComponent implements OnInit {

  @Input() identifier = '';
  revisaoRascunhoFinanciamento: DadosRevisaoRascunho[] = [];
  isLoading: boolean = true;

  constructor(private rascunhoService: RascunhoService) { }

  ngOnInit(): void {

    this.rascunhoService.obterRevisaoRascunhoFinanciamento(this.identifier)
      .subscribe((response: ObterRevisaoRascunhoResponse) => {
        this.revisaoRascunhoFinanciamento = response.dadosRevisaoRascunho
        this.isLoading = false
      });
  }

  convertValue(revisao: DadosRevisaoRascunho) {
    if (revisao.nome == 'ValorTotalDivida'
      || revisao.nome == 'ValorParcela') {
      let value = revisao.valor.replace(',', '.');
      return Utility.formatCurrencyValue(+value);
    }

    return revisao.valor;
  }
}
