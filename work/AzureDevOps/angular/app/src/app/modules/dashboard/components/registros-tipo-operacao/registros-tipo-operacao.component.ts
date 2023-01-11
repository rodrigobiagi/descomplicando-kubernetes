import { Component, OnInit, ViewChild } from '@angular/core';

import { BlocoVazio } from '../../core/models/bloco-vazio.model';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexGrid,
  ApexYAxis,
  ApexLegend,
  ApexTooltip
} from "ng-apexcharts";
import { DashboardService } from '../../services/dashboard.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-registros-tipo-operacao',
  templateUrl: './registros-tipo-operacao.component.html',
  styleUrls: ['./registros-tipo-operacao.component.scss']
})
export class RegistrosTipoOperacaoComponent implements OnInit {

  constructor(private dashboardService: DashboardService) { }

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  tiposOperacao: string[] = ['Registro de Contrato', 'Registro de Aditivo', 'Alteracao de Contrato', 'Alteracao de Aditivo'];
  mesAtual: number[] = [];
  mesAnterior: number[] = [];

  blocoVazio: BlocoVazio = {
    id: 'tipo-operacao',
    titulo: 'Registros por tipo de operação',
    icone: './../../../../assets/img/custom-icons/icon-vazio-tipo-operacao.svg',
  }

  ngOnInit(): void {
    this.obterValoresGrafico();
  }

  obterValoresGrafico() {
    this.dashboardService.obterGraficoTipoOperacao().subscribe(response => {
      let registros = response.registros;

      for (let i = 0; i < this.tiposOperacao.length; i++) {
        let index = registros.indexOf(registros.filter(a => a.tipoOperacao == this.tiposOperacao[i])[0]);

        if (index < 0 && i > 1) {
          let operacao = this.tiposOperacao[i].replace('Alteracao', 'Alteração');
          let indexAcentos = registros.indexOf(registros.filter(a => a.tipoOperacao == operacao)[0]);

          if (indexAcentos < 0) {
            this.mesAtual.push(0);
            this.mesAnterior.push(0);
          }
          else {
            this.mesAtual.push(registros[indexAcentos].mesAtual);
            this.mesAnterior.push(registros[indexAcentos].mesAnterior);
          }
        }
        else if (index < 0) {
          this.mesAtual.push(0);
          this.mesAnterior.push(0);
        }
        else {
          this.mesAtual.push(registros[index].mesAtual);
          this.mesAnterior.push(registros[index].mesAnterior);
        }
      }

      if (this.mesAtual.filter(a => a > 0).length > 0 || this.mesAnterior.filter(a => a > 0).length > 0) {
        this.montarGrafico();
        return;
      }

      this.mesAtual = [];
      this.mesAnterior = [];
    });
  }

  montarGrafico() {
    this.chartOptions = {
      series: [
        {
          name: "Mês anterior",
          data: this.mesAnterior,
          color: '#4181bb'
        },
        {
          name: "Mês atual",
          data: this.mesAtual,
          color: '#96b8d5'
        }
      ],
      chart: {
        type: "bar",
        height: 380,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          columnWidth: '100%',
          barHeight: '60%',
          dataLabels: {
            position: "bottom",
            total: {
              formatter: function (val, opt) {
                return opt.w.globals.lastXAxis.categories[opt.dataPointIndex]
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        textAnchor: 'start',
        offsetY: -23,
        offsetX: -6,
        distributed: false,
        formatter: function (val, opt) {
          return opt.w.globals.lastXAxis.categories[opt.dataPointIndex]
        },
        style: {
          fontSize: "14px",
          fontFamily: 'Montserrat Bold, sans-serif',
          colors: ["#626E78"]
        }
      },
      stroke: {
        show: true,
        width: 5,
        colors: ["#fff"]
      },
      grid: {
        show: false,
        xaxis: {
          lines: {
            offsetX: 0
          }
        },
        yaxis: {
          lines: {
            offsetX: 0
          }
        }
      },
      xaxis: {
        floating: false,
        categories: ['Registro de contrato', 'Registro de aditivo', 'Alteração de contrato', 'Alteração de aditivo'],
        labels: { show: false, offsetX: 0 },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        floating: true,
        labels: {
          formatter: function (val) {
            return ''
          },
          show: true,
          offsetX: 0,
          align: 'left',
          style: {
            fontSize: '14px',
            fontFamily: 'Montserrat Bold, sans-serif',
            fontWeight: 400,
            cssClass: 'label-chart'
          }
        }
      },
      legend: {
        fontSize: '14px',
        fontFamily: 'Montserrat Regular, sans-serif',
        fontWeight: 400,
        horizontalAlign: 'left',
        onItemHover: { highlightDataSeries: false },
        markers: {
          height: 6,
          width: 21,
          radius: 2,
          offsetY: -1,
        },
        onItemClick: {
          toggleDataSeries: false
        }
      },
      tooltip: {
        theme: 'dark',
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const month = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
          const d = new Date();
          let periodo = `${(seriesIndex == 1 ? month[d.getMonth()] : month[d.getMonth() - 1])} de ${d.getFullYear()}`;

          if (seriesIndex == 0 && d.getMonth() == 0) {
            periodo = `${month[11]} de ${d.getFullYear() - 1}`;
          }

          return (
            '<div class="tooltip-box">' +
            "<label class='bold labels'>" +
            periodo +
            "</label><p class='bold'>" +
            w.globals.labels[dataPointIndex] +
            "</p>" +
            "<span class='tooltip-value'>" +
            series[seriesIndex][dataPointIndex] +
            "</span></div>"
          );
        }
      }
    };
  }
}
