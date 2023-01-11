import { Component, Input, OnInit } from '@angular/core';
import { DadosRevisaoRascunho } from '../../../../core/models/rascunhos/dados-revisao-rascunho.model';
import { ObterRevisaoRascunhoResponse } from '../../../../core/responses/rascunhos/obter-revisao-rascunho.response';
import { RascunhoService } from '../../../../services/rascunho.service';

@Component({
  selector: 'app-revisao-rascunho-contrato',
  templateUrl: './revisao-rascunho-contrato.component.html',
  styleUrls: ['./revisao-rascunho-contrato.component.scss']
})
export class RevisaoRascunhoContratoComponent implements OnInit {

  @Input() identifier = '';
  revisaoRascunhoContrato: DadosRevisaoRascunho[] = [];
  isLoading: boolean = true;

  constructor(private rascunhoService: RascunhoService) { }

  ngOnInit(): void {

    this.rascunhoService.obterRevisaoRascunhoContrato(this.identifier)
      .subscribe((response: ObterRevisaoRascunhoResponse) => {
        this.revisaoRascunhoContrato = response.dadosRevisaoRascunho;
        this.isLoading = false
      });
  }
}
