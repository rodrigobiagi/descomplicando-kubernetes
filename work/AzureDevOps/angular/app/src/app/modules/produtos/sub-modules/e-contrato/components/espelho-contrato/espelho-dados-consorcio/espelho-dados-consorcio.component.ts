import { Component, OnInit } from '@angular/core';
import { ConsultarContratoResponse } from '../../../core/responses/contratos/consultar-contrato.response';
import { ContratoService } from '../../../services/contrato.service';

@Component({
  selector: 'app-espelho-dados-consorcio',
  templateUrl: './espelho-dados-consorcio.component.html',
  styleUrls: ['./espelho-dados-consorcio.component.scss']
})
export class EspelhoDadosConsorcioComponent implements OnInit {
  constructor(private contratoService: ContratoService) { }

  contrato: ConsultarContratoResponse;

  ngOnInit(): void {
    this.contratoService.contrato$.subscribe(contrato => {
      if (contrato != undefined) { this.contrato = contrato; }
      else this.contrato = new ConsultarContratoResponse();
    });
  }
}
