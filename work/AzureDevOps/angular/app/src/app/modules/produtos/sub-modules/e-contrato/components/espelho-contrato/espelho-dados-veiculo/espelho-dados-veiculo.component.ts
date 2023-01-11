import { Component, OnInit } from '@angular/core';
import { Especie } from '../../../core/models/veiculos/especie.model';
import { ConsultarContratoResponse } from '../../../core/responses/contratos/consultar-contrato.response';
import { ObterEspeciesResponse } from '../../../core/responses/veiculos/obter-especies.response';
import { ContratoService } from '../../../services/contrato.service';
import { BackofficeService } from '../../../services/_backoffice/_backoffice.service';
import { VeiculoService } from '../../../services/veiculo.service';

@Component({
  selector: 'app-espelho-dados-veiculo',
  templateUrl: './espelho-dados-veiculo.component.html',
  styleUrls: ['./espelho-dados-veiculo.component.scss']
})
export class EspelhoDadosVeiculoComponent implements OnInit {

  constructor(
    private veiculoService: VeiculoService,
    private backofficeService: BackofficeService,
    private contratoService: ContratoService) { }

  contrato: ConsultarContratoResponse;
  especie: string = "-";

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) {
        this.contrato = contrato;
        if (contrato.veiculo[0].especie !== null) this.carregarEspecieVeiculo(contrato.veiculo[0].especie);
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

  private carregarEspecieVeiculo(especieId: number) {
    this.backofficeService.obterEspecieVeiculos()
      .subscribe((response: ObterEspeciesResponse) => {
        if (response.isSuccessful) {
          response.especies.forEach((especie: Especie) => {
            if (especie.id == especieId) this.especie = especie.nome;
          });
        }
      })
  }

}
