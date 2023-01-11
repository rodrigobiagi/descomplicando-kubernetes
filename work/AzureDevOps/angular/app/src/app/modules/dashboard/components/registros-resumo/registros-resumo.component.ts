import { Component, Input, Output, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { BlocoVazio } from '../../core/models/bloco-vazio.model';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";
import { DashboardService } from '../../services/dashboard.service';
import { ObterResumoResponse } from '../../core/responses/obter-resumo.response';
import { RegistrosPeriodoResumo } from '../../core/models/registros-periodo-resumo.model';
import { BehaviorSubject, Observable } from 'rxjs';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};


@Component({
  selector: 'app-registros-resumo',
  templateUrl: './registros-resumo.component.html',
  styleUrls: ['./registros-resumo.component.scss']
})
export class RegistrosResumoComponent implements OnInit {
  @Input()
  public set resumoFiltroValue(val: number) {
    if (this.init) {
      this.resumoFiltro = val;
      this.filtrarGraficos();
    }
  }

  @Output() periodoChanged: EventEmitter<string> = new EventEmitter();

  resumoFiltro: number = null;
  init: boolean = false;

  @ViewChild("chart", { static: false }) chart: ChartComponent;
  public chartOptions;

  dadosContratos = [];
  dadosResumoResponse: ObterResumoResponse;
  selectedFilter: string = 'ultimosTrintaDias';
  disableFilter: boolean = false;

  readonly isLoadingResults$ = new BehaviorSubject(true);
  loading$: Observable<boolean>;

  constructor(private dashboardService: DashboardService) { }

  blocoVazio: BlocoVazio = {
    id: 'resumo',
    icone: './../../../../assets/img/custom-icons/icon-vazio-resumo.svg',
    subtitulo: `Nenhum registro <br>adicionado recentemente.`,
    mensagem: `Continue utilizando a nossa plataforma para <br>ter a melhor experiência em nosso dashboard.`
  }

  ngOnInit(): void {
    this.loading$ = this.isLoadingResults$;
  }

  ngAfterViewInit() {
    this.carregarDados();
    this.init = true;
  }

  carregarDados() {
    this.isLoadingResults$.next(true)
    this.dashboardService.obterResumo().subscribe(response => {
      this.dadosResumoResponse = response;

      this.isLoadingResults$.next(false);
      if (this.verificaValores(this.dadosResumoResponse, 'registros') && this.verificaValores(this.dadosResumoResponse, 'registrosInconsistentes') && this.verificaValores(this.dadosResumoResponse, 'registrosImagensPendentes')) {
        this.dadosContratos = [];
        this.disableFilter = true;
        return;
      }

      this.filtrarGrafico('ultimosTrintaDias');
    });
  }

  verificaValores(dados: ObterResumoResponse, tipo: string) {
    return this.retornoVazio(dados[tipo].ultimasVinteQuatroHoras) && this.retornoVazio(dados[tipo].ultimosSeteDias) && this.retornoVazio(dados[tipo].ultimosTrintaDias);
  }

  retornoVazio(dados: RegistrosPeriodoResumo) {
    return dados.evolucaoDiaria.length == 0 && dados.periodoAnterior == 0 && dados.periodoAtual == 0;
  }

  filtrarGrafico(periodo: string = 'ultimosTrintaDias') {
    let anoAtual = new Date().getFullYear();
    let dataRegistros = [];
    let dataInconsistencias = [];
    let dataInconsistenciaImg = [];

    this.dadosResumoResponse.registros[periodo].evolucaoDiaria.forEach(e => {
      dataRegistros.push({ x: new Date(`${anoAtual}-${e.mes}-${e.dia}`), y: e.total })
    });

    this.dadosResumoResponse.registrosInconsistentes[periodo].evolucaoDiaria.forEach(e => {
      dataInconsistencias.push({ x: new Date(`${anoAtual}-${e.mes}-${e.dia}`), y: e.total });
    });

    this.dadosResumoResponse.registrosImagensPendentes[periodo].evolucaoDiaria.forEach(e => {
      dataInconsistenciaImg.push({ x: new Date(`${anoAtual}-${e.mes}-${e.dia}`), y: e.total });
    });

    if (this.retornoVazio(this.dadosResumoResponse.registros[periodo])
      && this.retornoVazio(this.dadosResumoResponse.registrosInconsistentes[periodo])
      && this.retornoVazio(this.dadosResumoResponse.registrosImagensPendentes[periodo])) {
      this.blocoVazio = {
        id: 'resumo',
        icone: './../../../../assets/img/custom-icons/icon-vazio-periodo-resumo.svg',
        subtitulo: `Nenhum registro <br>foi encontrado`,
        mensagem: `Não há dados suficientes para  possibilitar a <br>visualização do gráfico. Tente escolher outro período.`
      }

      this.dadosContratos = [];
      return;
    }

    this.dadosContratos = [
      {
        name: 'Contratos registrados',
        data: dataRegistros
      },
      {
        name: 'Contratos com inconsistências',
        data: dataInconsistencias
      },
      {
        name: 'Contratos sem imagem',
        data: dataInconsistenciaImg
      }
    ];

    this.montarGrafico();
  }

  montarGrafico() {
    this.chartOptions = {
      series: this.dadosContratos,
      chart: {
        fontFamily: 'Montserrat Regular, sans-serif',
        height: '250px',
        type: "area",
        toolbar: { show: false },
        defaultLocale: 'pt-br',
        locales: [{
          name: 'pt-br',
          options: {
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Maio', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            days: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
            shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
          }
        }]
      },
      xaxis: {
        type: 'datetime',
        categories: ["2022-10-10T03:24:00", "2022-10-19T03:24:00"],
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        dashArray: [0, 0, 5]
      },
      fill: {
        type: "gradient",
        colors: ['#0BDE78', '#FFAF3F', '#EC1453'],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.6,
          opacityTo: 0.6,
          stops: [0, 90, 100]
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        theme: 'dark',
        x: {
          format: "dd - MMMM"
        }
      }
    };
  }

  filtrarGraficos() {
    if (this.resumoFiltro == 1) {
      this.chart.showSeries('Contratos registrados');
      this.chart.hideSeries('Contratos com inconsistências');
      this.chart.hideSeries('Contratos sem imagem');
    } else if (this.resumoFiltro == 2) {
      this.chart.hideSeries('Contratos registrados');
      this.chart.showSeries('Contratos com inconsistências');
      this.chart.hideSeries('Contratos sem imagem');
    } else if (this.resumoFiltro == 3) {
      this.chart.hideSeries('Contratos registrados');
      this.chart.hideSeries('Contratos com inconsistências');
      this.chart.showSeries('Contratos sem imagem');
    } else {
      this.chart.showSeries('Contratos registrados');
      this.chart.showSeries('Contratos com inconsistências');
      this.chart.showSeries('Contratos sem imagem');
    }
  }

  resumoChanged() {
    this.filtrarGrafico(this.selectedFilter);
    this.periodoChanged.emit(this.selectedFilter)
  }

}
