import { Component, OnInit } from '@angular/core';
import { VeiculoFrota } from '../../../core/models/contratos/veiculo-frota.model';
import { Especie } from '../../../core/models/veiculos/especie.model';
import { ConsultarContratoResponse } from '../../../core/responses/contratos/consultar-contrato.response';
import { ObterEspeciesResponse } from '../../../core/responses/veiculos/obter-especies.response';
import { ContratoService } from '../../../services/contrato.service';
import { VeiculoService } from '../../../services/veiculo.service';
import { BackofficeService } from '../../../services/_backoffice/_backoffice.service';

@Component({
  selector: 'app-espelho-dados-veiculos-frota',
  templateUrl: './espelho-dados-veiculos-frota.component.html',
  styleUrls: ['./espelho-dados-veiculos-frota.component.scss']
})
export class EspelhoDadosVeiculosFrotaComponent implements OnInit {

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
      }
      else this.contrato = new ConsultarContratoResponse();
    });
  }

}
