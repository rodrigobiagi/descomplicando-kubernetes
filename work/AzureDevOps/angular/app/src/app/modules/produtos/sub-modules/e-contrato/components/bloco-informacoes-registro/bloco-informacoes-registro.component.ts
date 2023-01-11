import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bloco-informacoes-registro',
  templateUrl: './bloco-informacoes-registro.component.html',
  styleUrls: ['./bloco-informacoes-registro.component.scss']
})
export class BlocoInformacoesRegistroComponent implements OnInit {
  @Input() options;

  constructor(){};

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let titulo = this.options.titulo;
    document.getElementById('bloco_' + this.options.id).innerHTML = titulo;

    let descricao = this.options.descricao;
    document.getElementById('bloco_descricao_' + this.options.id).innerHTML = descricao;
  }

}
