import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { VeiculoFrota } from '../../core/models/contratos/veiculo-frota.model';
import { Veiculo } from '../../core/models/contratos/veiculo.model';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { ContratoService } from '../../services/contrato.service';

@Component({
  selector: 'app-espelho-contrato',
  templateUrl: './espelho-contrato.component.html',
  styleUrls: ['./espelho-contrato.component.scss'],
  providers: [Title]
})
export class EspelhoContratoComponent implements OnInit {

  constructor(
    private contratoService: ContratoService,
    private activeRoute: ActivatedRoute,
    private title: Title,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService) { }

  contrato: ConsultarContratoResponse;
  isFrota: boolean = true;

  ngOnInit(): void {
    this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));
    this.activeRoute.queryParams.subscribe(params => {
      this.contrato = null;
      this.contratoService.retornoContrato(this.contrato);
      this.contratoService.consultarContratoPorProtocolo(params['protocolo']).toPromise()
        .then(response => {
          this.store.dispatch(closePreloader());
          if (response.isSuccessful) {
            this.contrato = response.result;
            this.contratoService.retornoContrato(this.contrato);
            return;
          }
        })
        .catch((response) => {
          this.store.dispatch(closePreloader());
          this.notifierService.showNotification(response.error.errors[0].message, 'Erro ' + response.error.errors[0].code, 'error');
        })
    });
  }

  printPage() {
    const currentTitle = this.title.getTitle();
    this.title.setTitle('Espelho do Contrato Nº ' + this.contrato.contrato.numeroContrato);
    window.print();
    this.title.setTitle(currentTitle);
  }

  showTerceiroGarantidor() {
    if (this.contrato?.contrato?.ufLicenciamento === 'PR') {
      return true;
    }
    return false;
  }
}
