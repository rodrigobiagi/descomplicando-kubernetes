import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Utility } from 'src/app/core/common/utility';
import { Veiculo } from '../../core/models/contratos/veiculo.model';

@Component({
  selector: 'app-dialog-add-veiculo',
  templateUrl: './dialog-add-veiculo.component.html',
  styleUrls: ['./dialog-add-veiculo.component.scss']
})
export class DialogAddVeiculoComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
    if (data) {
      this.adicionado = data.adicionado;
      if (data.veiculo) { this.carregarVeiculo = data.veiculo; }
      if (data.aditivo) { this.aditivo = data.aditivo; }
    }
  }

  adicionado: boolean = false;
  carregarVeiculo: Veiculo;
  veiculo: Veiculo;
  aditivo: boolean = false;

  ngOnInit(): void {
  }

  setVeiculo(veiculo) {
    if (!veiculo) return;
    this.veiculo = <Veiculo>{
      chassi: veiculo.chassi,
      placa: veiculo.placa,
      ufPlaca: veiculo.ufPlaca,
      anoFabricacao: veiculo.anoFabricacao,
      anoModelo: veiculo.anoModelo,
      renavam: veiculo.renavam,
      numeroRestricao: +veiculo.numeroRestricao,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      emplacado: veiculo.emplacado == "true",
      remarcado: veiculo.remarcado == "true",
      especie: veiculo.especie,
      cor: veiculo.cor,
      podeEditar: veiculo.podeEditar
    };
  }

  setNumeroRestricao(numeroRestricao) {
    this.veiculo.numeroRestricao = numeroRestricao;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

}
