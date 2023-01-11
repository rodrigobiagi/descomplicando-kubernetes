import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { Documento } from '../../../core/models/common/documento.model';
import { ConsultarContratoResponse } from '../../../core/responses/contratos/consultar-contrato.response';
import { ContratoService } from '../../../services/contrato.service';

@Component({
  selector: 'app-espelho-dados-complementar',
  templateUrl: './espelho-dados-complementar.component.html',
  styleUrls: ['./espelho-dados-complementar.component.scss']
})
export class EspelhoDadosComplementarComponent implements OnInit {

  constructor(private contratoService: ContratoService) { }

  contrato: ConsultarContratoResponse;
  documentoRecebedor: string = "-"
  documentoVendedor: string = "-"

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;
        if (!Utility.isNullOrEmpty(this.contrato.complementar.documentoRecebedor?.numero)) {
          this.documentoRecebedor = Utility.formatDocument(this.contrato.complementar.documentoRecebedor);
        }
        if (!Utility.isNullOrEmpty(this.contrato.complementar.documentoVendedor?.numero)) {
          this.documentoVendedor = Utility.formatDocument(this.contrato.complementar.documentoVendedor);
        }
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

  getValorTaxaContrato(taxaContrato) {
    if (taxaContrato === null) return '-';
    if (this.contrato.contrato?.ufLicenciamento == 'PR') {
      return Utility.formatCurrencyValue(taxaContrato);
    }
    return taxaContrato + '%'
  }
}
