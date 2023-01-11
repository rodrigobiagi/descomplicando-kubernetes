import { Component, OnInit } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { Municipio } from '../../../core/models/geograficos/municipio.model';
import { ConsultarContratoResponse } from '../../../core/responses/contratos/consultar-contrato.response';
import { MunicipioResponse } from '../../../core/responses/geograficos/municipio.response';
import { ContratoService } from '../../../services/contrato.service';
import { GeograficoService } from '../../../services/geografico.service';

@Component({
  selector: 'app-espelho-dados-financiamento',
  templateUrl: './espelho-dados-financiamento.component.html',
  styleUrls: ['./espelho-dados-financiamento.component.scss']
})
export class EspelhoDadosFinanciamentoComponent implements OnInit {

  constructor(
    private contratoService: ContratoService,
    private geograficoService: GeograficoService) { }

  contrato: ConsultarContratoResponse;
  municipio: string = "-"
  valorTotalDivida: string = '-'
  valorParcela: string = '-'

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) { this.contrato = contrato;
        this.filtrarMunicipio(this.contrato?.financiamento.liberacaoCredito?.uf, contrato?.financiamento?.idMunicipio); 
        this.valorTotalDivida = Utility.formatCurrencyValue(this.contrato?.financiamento?.valorTotalDivida) ?? '-'
        this.valorParcela = Utility.formatCurrencyValue(this.contrato?.financiamento?.valorParcela) ?? '-'
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

  private filtrarMunicipio(uf: string, idMunicipio: number) {
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
            this.municipio = municipios.municipios.filter((item: Municipio) => { return item.id == idMunicipio })[0]?.nome;
        })
    }
  }

}
