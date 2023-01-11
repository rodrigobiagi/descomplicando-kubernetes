import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BlocoVazio } from '../../core/models/bloco-vazio.model';
import * as d3 from 'd3';
import { DashboardService } from '../../services/dashboard.service';
import { RegistrosPorEstado } from '../../core/models/registro-por-estado.model';

@Component({
  selector: 'app-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss'],
})
export class BubbleChartComponent {

  hasEstados: boolean = false;
  ngOnInit() {
    this.obterRegistros();
  }

  blocoVazio: BlocoVazio = {
    id: 'estado',
    titulo: 'Registros por estado',
    icone: './../../../../assets/img/custom-icons/icon-vazio-estado.svg',
  }

  ufs = [
    { nome: "Acre", sigla: "AC", regiao: 'Norte' },
    { nome: "Alagoas", sigla: "AL", regiao: 'Nordeste' },
    { nome: "Amapá", sigla: "AP", regiao: 'Norte' },
    { nome: "Amazonas", sigla: "AM", regiao: 'Norte' },
    { nome: "Bahia", sigla: "BA", regiao: 'Nordeste' },
    { nome: "Ceará", sigla: "CE", regiao: 'Nordeste' },
    { nome: "Distrito Federal", sigla: "DF", regiao: 'CentroOeste' },
    { nome: "Espírito Santo", sigla: "ES", regiao: 'Sudeste' },
    { nome: "Goiás", sigla: "GO", regiao: 'CentroOeste' },
    { nome: "Maranhão", sigla: "MA", regiao: 'Nordeste' },
    { nome: "Mato Grosso", sigla: "MT", regiao: 'CentroOeste' },
    { nome: "Mato Grosso do Sul", sigla: "MS", regiao: 'CentroOeste' },
    { nome: "Minas Gerais", sigla: "MG", regiao: 'Sudeste' },
    { nome: "Pará", sigla: "PA", regiao: 'Norte' },
    { nome: "Paraíba", sigla: "PB", regiao: 'Nordeste' },
    { nome: "Paraná", sigla: "PR", regiao: 'Sul' },
    { nome: "Pernambuco", sigla: "PE", regiao: 'Nordeste' },
    { nome: "Piauí", sigla: "PI", regiao: 'Nordeste' },
    { nome: "Rio de Janeiro", sigla: "RJ", regiao: 'Sudeste' },
    { nome: "Rio Grande do Norte", sigla: "RN", regiao: 'Nordeste' },
    { nome: "Rio Grande do Sul", sigla: "RS", regiao: 'Sul' },
    { nome: "Rondônia", sigla: "RO", regiao: 'Norte' },
    { nome: "Roraima", sigla: "RR", regiao: 'Norte' },
    { nome: "Santa Catarina", sigla: "SC", regiao: 'Sul' },
    { nome: "São Paulo", sigla: "SP", regiao: 'Sudeste' },
    { nome: "Sergipe", sigla: "SE", regiao: 'Nordeste' },
    { nome: "Tocantins", sigla: "TO", regiao: 'Nordeste' }

  ]

  estados: RegistrosPorEstado[] = [];

  constructor(private dashboardService: DashboardService) {
  }

  obterRegistros() {
    this.dashboardService.obterGraficoRegistroPorEstado().subscribe(response => {
      let registros = response.registros;

      for (let i = 0; i < this.ufs.length; i++) {
        for (let j = 0; j < registros.length; j++) {
          if (this.ufs[i].sigla == registros[j].uf) {
            registros[j].estado = this.ufs[i].nome;
            registros[j].regiao = this.ufs[i].regiao;
          }
        }
      }

      this.estados = registros;

      if (registros.length > 0) {
        this.generateChart(registros);
      }
    });
  }

  generateChart(data) {
    const width = 250;
    const height = 170;
    const colors = {
      Nordeste: '#ffdcdc',
      Sul: '#80e5ca',
      Sudeste: '#73a3ce',
      Norte: '#d3ed6c',
      CentroOeste: '#ce739a'
    };


    const bubble = data => d3.pack()
      .size([width, height])
      .padding(3)(d3.hierarchy({ children: data }).sum(d => d.quantidadeRegistros));

    const svg = d3.select('#chart')
      .attr('width', width)
      .attr('height', height)
      .attr('font-size', '7px')
      .call(this.responsivefy)

    const root = bubble(data);
    const tooltip = d3.select('.tooltip');

    const node = svg.selectAll()
      .data(root.children)
      .enter().append('g')
      .attr('transform', 'translate(' + [width / 2, height / 2] + ')');

    const circle = node.append('circle')
      .style('fill', d => colors[d.data.regiao])
      .attr('r', d => d.r)
      .on('mouseover', function (e, d) {
        tooltip.select('.tooltip-uf').text(d.data.estado);
        tooltip.select('.registros-pill').text(d.data.quantidadeRegistros);
        tooltip.style('visibility', 'visible');

        d3.select(this).style('stroke', '#222');
      })
      .on('mousemove', e => tooltip.style('top', `${e.offsetY + 10}px`)
        .style('left', `${e.offsetX + 10}px`))
      .on('mouseout', function () {
        d3.select(this).style('stroke', 'none');
        return tooltip.style('visibility', 'hidden');
      })

    function selectTextColor(regiao) {

      if (regiao == 'Sudeste' || regiao == 'CentroOeste') {
        return '#FFF';
      } else {
        return '#000'
      }
    }

    const label = node.append('text')
      .attr('dy', 2)
      .attr('dx', -5)
      .text(d => d.data.uf)
      .attr('style', d => 'font-weight: bold; cursor: default; pointer-events: none;' + 'fill: ' + selectTextColor(d.data.regiao))
      .on('mouseover', function (e, d) {
        tooltip.select('.tooltip-uf').text(d.data.estado);
        tooltip.select('.registros-pill').text(d.data.quantidadeRegistros);
        tooltip.style('visibility', 'visible');

      })
      .on('mousemove', e => tooltip.style('top', `${e.offsetY + 10}px`)
        .style('left', `${e.offsetX + 10}px`))
      .on('mouseout', function () {
        d3.select(this).style('stroke', 'none');
        return tooltip.style('visibility', 'hidden');
      })

    node.transition()
      .ease(d3.easeExpInOut)
      .duration(1000)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    circle.transition()
      .ease(d3.easeExpInOut)
      .duration(1000)

    label.transition()
      .delay(700)
      .ease(d3.easeExpInOut)
      .duration(1000)
      .style('opacity', 1)
  };

  responsivefy(svg) {
    const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize);

    d3.select(window).on(
      'resize.' + container.attr('id'),
      resize
    );

    function resize() {
      const w = parseInt(container.style('width'));
      const h = Math.round(w / aspect) < height ? height : Math.round(w / aspect);
      svg.attr('width', w);
      svg.attr('height', h);
    }
  }
}
