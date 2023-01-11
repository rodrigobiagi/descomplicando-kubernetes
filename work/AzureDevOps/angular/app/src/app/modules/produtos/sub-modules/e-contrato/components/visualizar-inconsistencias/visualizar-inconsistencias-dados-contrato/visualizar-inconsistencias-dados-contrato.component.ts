import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Utility } from 'src/app/core/common/utility';
import { ValorDominio } from '../../../core/models/dominios/valor-dominio.model';
import { DadosInconsistenciasContrato } from '../../../core/models/inconsistencias-contrato/dados-inconsistencias-contrato.model';
import { DominioResponse } from '../../../core/responses/dominios/dominio.response';
import { ContratoService } from '../../../services/contrato.service';
import { DominioService } from '../../../services/dominio.service';

@Component({
  selector: 'app-visualizar-inconsistencias-dados-contrato',
  templateUrl: './visualizar-inconsistencias-dados-contrato.component.html',
  styleUrls: ['./visualizar-inconsistencias-dados-contrato.component.scss']
})
export class VisualizarInconsistenciasDadosContratoComponent implements OnInit {

  constructor(private contratoService: ContratoService,
    private dominioService: DominioService) { }

  @Input('protocolo') protocolo: string;
  @Output() inconsistencia: EventEmitter<boolean> = new EventEmitter<boolean>();

  dadosInconsistenciasContrato: DadosInconsistenciasContrato[] = [];
  isLoading: boolean = true;
  tipoRestricao: string = "-";
  tipoAditivo: string = "-";

  ngOnInit(): void {
    this.carregaDados();
  }

  carregaDados() {
    if (this.protocolo != undefined) {
      this.contratoService.obterInconsistenciasContratoContrato(this.protocolo).subscribe(response => {
        this.dadosInconsistenciasContrato = response.dadoInconsistenciaContrato;
        this.carregarTipoRestricao(+this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Contrato.TipoRestricao')[0].valor);
        this.carregarTipoAditivo(+this.dadosInconsistenciasContrato.filter(value => value.propertyName == 'Contrato.TipoAditivo')[0].valor);
        this.inconsistencia.emit(this.dadosInconsistenciasContrato.filter(inconsistencia => inconsistencia.possuiInconsistencia).length > 0);
        this.isLoading = false;
      })
    }
  }

  formatarDados(dadoContrato: DadosInconsistenciasContrato) {
    if (Utility.isNullOrEmpty(dadoContrato.valor)) return "-";

    if (dadoContrato.propertyName == 'Contrato.TipoRestricao') { return this.tipoRestricao; }
    if (dadoContrato.propertyName == 'Contrato.TipoAditivo') { return this.tipoAditivo; }
    return dadoContrato.valor;
  }

  private carregarTipoRestricao(tipoRestricaoId: number) {
    this.dominioService.obterPorTipo('TIPO_RESTRICAO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            if (dominio.id == tipoRestricaoId) this.tipoRestricao = dominio.valor;
          })
        }
      })
  }

  private carregarTipoAditivo(tipoAditivoId: number) {
    this.dominioService.obterPorTipo('TIPO_ADITIVO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            if (dominio.id == tipoAditivoId) this.tipoAditivo = dominio.valor;
          })
        }

      })
  }
}
