import { Component, Input, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { DadosRevisaoRascunho } from '../../../../core/models/rascunhos/dados-revisao-rascunho.model';
import { ObterRevisaoRascunhoResponse } from '../../../../core/responses/rascunhos/obter-revisao-rascunho.response';
import { RascunhoService } from '../../../../services/rascunho.service';

@Component({
  selector: 'app-revisao-rascunho-credor',
  templateUrl: './revisao-rascunho-credor.component.html',
  styleUrls: ['./revisao-rascunho-credor.component.scss']
})
export class RevisaoRascunhoCredorComponent implements OnInit {

  @Input() identifier = '';
  revisaoRascunhoCredor: DadosRevisaoRascunho[] = [];
  isLoading: boolean = true;

  constructor(private rascunhoService: RascunhoService) { }

  ngOnInit(): void {

    this.rascunhoService.obterRevisaoRascunhoCredor(this.identifier)
      .subscribe((response: ObterRevisaoRascunhoResponse) => {
        this.revisaoRascunhoCredor = response.dadosRevisaoRascunho;
        this.isLoading = false
      });
  }

  convertValue(revisao: DadosRevisaoRascunho) {
    if (revisao.nome == 'Documento') {
      return Utility.formatCnpj(revisao.valor);
    }

    if (revisao.nome == "Cep") {
      return Utility.formatCep(revisao.valor);
    }

    return revisao.valor;
  }
}
