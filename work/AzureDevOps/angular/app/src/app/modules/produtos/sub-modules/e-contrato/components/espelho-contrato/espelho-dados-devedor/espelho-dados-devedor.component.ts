import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from '../../../core/models/common/documento.model';
import { ConsultarContratoResponse } from '../../../core/responses/contratos/consultar-contrato.response';
import { ContratoService } from '../../../services/contrato.service';

@Component({
  selector: 'app-espelho-dados-devedor',
  templateUrl: './espelho-dados-devedor.component.html',
  styleUrls: ['./espelho-dados-devedor.component.scss']
})
export class EspelhoDadosDevedorComponent implements OnInit {

  constructor(
    private contratoService: ContratoService) { }

  contrato: ConsultarContratoResponse;
  devedorDocumento: string = "-"
  devedorCep: string = "-"

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;
        if (this.contrato.devedor.documento?.tipoDocumento !== null) {
          this.devedorDocumento = Utility.formatDocument(this.contrato.devedor.documento);
        }

        if (this.contrato.devedor?.endereco?.cep !== null) { this.devedorCep = Utility.formatCep(this.contrato.devedor?.endereco?.cep); }
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }
}
