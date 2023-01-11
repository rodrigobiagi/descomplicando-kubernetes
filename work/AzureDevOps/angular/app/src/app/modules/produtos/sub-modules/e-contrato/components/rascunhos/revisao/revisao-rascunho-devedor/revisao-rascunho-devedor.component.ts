import { Component, Input, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { DadosRevisaoRascunho } from '../../../../core/models/rascunhos/dados-revisao-rascunho.model';
import { ObterRevisaoRascunhoResponse } from '../../../../core/responses/rascunhos/obter-revisao-rascunho.response';
import { RascunhoService } from '../../../../services/rascunho.service';

@Component({
  selector: 'app-revisao-rascunho-devedor',
  templateUrl: './revisao-rascunho-devedor.component.html',
  styleUrls: ['./revisao-rascunho-devedor.component.scss']
})
export class RevisaoRascunhoDevedorComponent implements OnInit {

  @Input() identifier = '';
  revisaoRascunhoDevedor: DadosRevisaoRascunho[] = [];
  isLoading: boolean = true;

  constructor(private rascunhoService: RascunhoService) { }

  ngOnInit(): void {

    this.rascunhoService.obterRevisaoRascunhoDevedor(this.identifier)
      .subscribe((response: ObterRevisaoRascunhoResponse) => {
        this.revisaoRascunhoDevedor = response.dadosRevisaoRascunho;
        this.isLoading = false
      });
  }

  convertValue(revisao: DadosRevisaoRascunho) {
    if (revisao.nome == 'Documento') {
      return revisao.valor.length > 11 ? Utility.formatCnpj(revisao.valor) : Utility.formatCpf(revisao.valor);
    }

    if (revisao.nome == "Cep") {
      return Utility.formatCep(revisao.valor);
    }

    return revisao.valor;
  }
}
