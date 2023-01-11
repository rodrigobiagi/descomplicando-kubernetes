import { Component, Input, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { DadosRevisaoRascunho } from '../../../../core/models/rascunhos/dados-revisao-rascunho.model';
import { ObterRevisaoRascunhoResponse } from '../../../../core/responses/rascunhos/obter-revisao-rascunho.response';
import { RascunhoService } from '../../../../services/rascunho.service';

@Component({
  selector: 'app-revisao-rascunho-complementar',
  templateUrl: './revisao-rascunho-complementar.component.html',
  styleUrls: ['./revisao-rascunho-complementar.component.scss']
})
export class RevisaoRascunhoComplementarComponent implements OnInit {

  @Input() identifier = '';
  @Input() uf = '';
  revisaoRascunhoComplementar: DadosRevisaoRascunho[] = [];
  isLoading: boolean = true;

  constructor(private rascunhoService: RascunhoService) { }

  ngOnInit(): void {

    this.rascunhoService.obterRevisaoRascunhoComplementar(this.identifier)
      .subscribe((response: ObterRevisaoRascunhoResponse) => {
        this.revisaoRascunhoComplementar = response.dadosRevisaoRascunho;
        this.isLoading = false;
      });
  }

  convertValue(revisao: DadosRevisaoRascunho) {
    if (revisao.nome == 'TaxaIof'
      || revisao.nome == 'ValorTaxaMora'
      || revisao.nome == 'ValorTaxaMulta'
      || revisao.nome == 'TaxaJurosAno'
      || revisao.nome == 'Comissao'
      || revisao.nome == 'TaxaJurosMes') {

      revisao.valor = revisao.valor.replace(',', '.')
      return +revisao.valor + "%";
    }
    
    if (revisao.nome == 'TaxaContrato' && !Utility.isNullOrEmpty(this.uf) && this.uf == 'PR') {
      let value = revisao.valor.replace(',', '.');
      return Utility.formatCurrencyValue(+value);
    }

    return revisao.valor;
  }

}
