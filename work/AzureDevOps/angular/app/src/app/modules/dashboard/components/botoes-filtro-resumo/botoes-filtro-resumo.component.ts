import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ObterResumoResponse } from '../../core/responses/obter-resumo.response';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-botoes-filtro-resumo',
  templateUrl: './botoes-filtro-resumo.component.html',
  styleUrls: ['./botoes-filtro-resumo.component.scss']
})
export class BotoesFiltroResumoComponent implements OnInit {

  filtroSelected: number = null;
  init: boolean = false;
  selectedPeriodo: string = 'ultimosTrintaDias';
  tooltipText: string = '...';

  dadosContratos = [];
  dadosResumoResponse: ObterResumoResponse;

  contratosRegistrados = {
    periodoAtual: 0,
    variacao: '0%',
    isPositivo: false
  }

  contratosInconsistencias = {
    periodoAtual: 0,
    variacao: '0%',
    isPositivo: false
  }

  contratosSemImagem = {
    periodoAtual: 0,
    variacao: '0%',
    isPositivo: false
  }

  @Input()
  public set periodo(val: string) {
    if(this.init){
      this.selectedPeriodo = val;
      this.carregarVariacoes(this.selectedPeriodo);
    }
  }

  @Output() filtroChanged: EventEmitter<number> = new EventEmitter();

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.init = true;
    this.carregarVariacoes(this.selectedPeriodo);
  }

  selectFiltro(option) {
    if(this.filtroSelected == option) {
      this.filtroSelected = null;
      this.filtroChanged.emit(null);
      return;
    }
    this.filtroSelected = option;
    this.filtroChanged.emit(option);
  }

  carregarVariacoes(periodo: string = 'ultimosTrintaDias') {

      this.dashboardService.obterResumo().subscribe(response => {
        this.dadosResumoResponse = response;

        this.contratosRegistrados.periodoAtual = this.dadosResumoResponse.registros[periodo].periodoAtual;
        this.contratosRegistrados.variacao = this.dadosResumoResponse.registros[periodo].variacao;
        this.contratosRegistrados.isPositivo = this.checkVariacao(this.contratosRegistrados.variacao);

        this.contratosInconsistencias.periodoAtual = this.dadosResumoResponse.registrosInconsistentes[periodo].periodoAtual;
        this.contratosInconsistencias.variacao = this.dadosResumoResponse.registrosInconsistentes[periodo].variacao;
        this.contratosInconsistencias.isPositivo = this.checkVariacao(this.contratosInconsistencias.variacao);

        this.contratosSemImagem.periodoAtual = this.dadosResumoResponse.registrosImagensPendentes[periodo].periodoAtual;
        this.contratosSemImagem.variacao = this.dadosResumoResponse.registrosImagensPendentes[periodo].variacao;
        this.contratosSemImagem.isPositivo = this.checkVariacao(this.contratosSemImagem.variacao);
      });


  }

  onHoverBotaoFiltro(btn) {
    if (btn == 1) {
      this.tooltipText = `${this.contratosRegistrados.isPositivo ? 'Crescimento de ' : 'Redução de '} ${this.contratosRegistrados.variacao} com relação ${this.checkPeriodo()}`;
    }
    else if (btn == 2) {
      this.tooltipText = `${this.contratosInconsistencias.isPositivo ? 'Crescimento de ' : 'Redução de '} ${this.contratosInconsistencias.variacao} com relação ${this.checkPeriodo()}`;
    }
    else if (btn == 3) {
      this.tooltipText = `${this.contratosSemImagem.isPositivo ? 'Crescimento de ' : 'Redução de '} ${this.contratosSemImagem.variacao} com relação ${this.checkPeriodo()}`;
    }

  }

  checkVariacao(val) {
    let num = val.slice(0,-1);

    if (num < 0) {
      return false;
    } else {
      return true;
    }
  }

  checkPeriodo() {
    if (this.selectedPeriodo == 'ultimasVinteQuatroHoras') {
      return "ao último dia."
    } else if (this.selectedPeriodo == 'ultimosSeteDias') {
      return 'aos últimos 7 dias.';
    } else if (this. selectedPeriodo == 'ultimosTrintaDias') {
      return 'aos últimos 30 dias.';
    }
  }

}
