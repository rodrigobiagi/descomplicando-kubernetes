import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DadosRevisaoRascunho } from '../../../../core/models/rascunhos/dados-revisao-rascunho.model';
import { ListaDadosRevisaoRascunho } from '../../../../core/models/rascunhos/lista-dados-revisao-rascunho.model';
import { ObterRevisaoRascunhoResponse } from '../../../../core/responses/rascunhos/obter-revisao-rascunho.response';
import { RascunhoService } from '../../../../services/rascunho.service';

@Component({
  selector: 'app-revisao-rascunho-veiculo',
  templateUrl: './revisao-rascunho-veiculo.component.html',
  styleUrls: ['./revisao-rascunho-veiculo.component.scss']
})
export class RevisaoRascunhoVeiculoComponent implements OnInit {

  @Input() identifier = '';
  revisaoRascunhoVeiculo: DadosRevisaoRascunho[] = [];
  isLoading: boolean = true;
  veiculos: ListaDadosRevisaoRascunho[] = [];
  @Output() qtdVeiculos: EventEmitter<number> = new EventEmitter<number>();

  constructor(private rascunhoService: RascunhoService) { }

  ngOnInit(): void {

    this.rascunhoService.obterRevisaoRascunhoVeiculo(this.identifier)
      .subscribe((response: ObterRevisaoRascunhoResponse) => {
        this.revisaoRascunhoVeiculo = response.dadosRevisaoRascunho;
        this.splitVeiculos();
        this.isLoading = false
      });
  }

  splitVeiculos() {
    let items = this.revisaoRascunhoVeiculo.filter(item => item.nome == "Chassi");

    for (let i = 0; i < items.length; i++) {
      let lista = this.revisaoRascunhoVeiculo;
      let index = lista.indexOf(items[i]);
      let lastIndex = lista.indexOf(items[i + 1]);

      if (lastIndex > -1) {
        let listItem = lista.splice(index, lastIndex);
        this.veiculos.push(<ListaDadosRevisaoRascunho>{ dadosRevisaoRascunho: listItem });
      }
      else {
        let lastListItem = lista.splice(index, this.revisaoRascunhoVeiculo.length);
        this.veiculos.push(<ListaDadosRevisaoRascunho>{ dadosRevisaoRascunho: lastListItem });
      }
    }

    this.qtdVeiculos.emit(this.veiculos.length);
  }

}
