import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Utility } from 'src/app/core/common/utility';
import { DadosInconsistenciasContrato } from '../../../core/models/inconsistencias-contrato/dados-inconsistencias-contrato.model';
import { ListaDadosRevisaoRascunho } from '../../../core/models/rascunhos/lista-dados-revisao-rascunho.model';
import { ContratoService } from '../../../services/contrato.service';

@Component({
  selector: 'app-visualizar-inconsistencias-dados-veiculo',
  templateUrl: './visualizar-inconsistencias-dados-veiculo.component.html',
  styleUrls: ['./visualizar-inconsistencias-dados-veiculo.component.scss']
})
export class VisualizarInconsistenciasDadosVeiculoComponent implements OnInit {

  constructor(private contratoService: ContratoService) { }

  @Input('protocolo') protocolo: string;
  @Output() inconsistencia: EventEmitter<boolean> = new EventEmitter<boolean>();

  dadosInconsistenciasContrato: DadosInconsistenciasContrato[] = [];
  isLoading: boolean = true;
  veiculos: ListaDadosRevisaoRascunho[] = [];

  ngOnInit(): void {
    this.carregaDados();
  }

  carregaDados() {
    if (this.protocolo != undefined) {
      this.contratoService.obterInconsistenciasContratoVeiculo(this.protocolo).subscribe(response => {
        this.dadosInconsistenciasContrato = response.dadoInconsistenciaContrato;
        this.inconsistencia.emit(this.dadosInconsistenciasContrato.filter(inconsistencia => inconsistencia.possuiInconsistencia).length > 0);
        this.isLoading = false;
      })
    }
  }

  formatarDados(dadoContrato: DadosInconsistenciasContrato) {
    if (Utility.isNullOrEmpty(dadoContrato.valor)) return "-";

    if (dadoContrato.propertyName == 'Veiculo.AnoFabricacao' || dadoContrato.propertyName == 'Veiculo.AnoModelo') { return dadoContrato.valor == '0' ? '-' : dadoContrato.valor }
    if (dadoContrato.propertyName == 'Veiculo.Placa') return dadoContrato.valor.toUpperCase();
    return dadoContrato.valor;
  }
}
