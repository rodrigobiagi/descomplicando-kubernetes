import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TipoAtividadeRecente } from 'src/app/core/enums/tipo-atividade-recente.enum';
import { AtividadesRecentes } from '../../core/models/atividades-recentes.model';
import { BlocoVazio } from '../../core/models/bloco-vazio.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-atividades-recentes',
  templateUrl: './atividades-recentes.component.html',
  styleUrls: ['./atividades-recentes.component.scss']
})
export class AtividadesRecentesComponent implements OnInit {

  constructor(private dashboardService: DashboardService) { }

  blocoVazio: BlocoVazio = {
    id: 'atividades-recentes',
    subtitulo: `Nenhum atividade foi  <br>realizada recentemente.`,
    icone: './../../../../assets/img/custom-icons/icon-vazio-atividade-recente.svg',
  }

  pipe = new DatePipe('en-US');

  atividadesRecentes: AtividadesRecentes[] = [];

  ngOnInit(): void {
    this.getAtividadesRecentes();
  }

  getAtividadesRecentes() {
    let empresaId = sessionStorage.getItem('empresaId');
    this.dashboardService.obterAtividadesRecentes(+empresaId).subscribe(response => {
      if (response.errors.length == 0) {
        this.atividadesRecentes = response.atividades;
      }
    })
  }

  getData(data: string) {
    return this.pipe.transform(data, 'dd/MM/yyyy, HH:mm')
  }

}
