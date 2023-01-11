import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';

import { Store } from '@ngrx/store';
import { ContratoService } from '../../services/contrato.service';
import { DialogCommonComponent } from '../../components/dialog-common/dialog-common.component';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { TipoFormulario } from '../../core/enums/tipo-formulario.enum';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-visualizar-inconsistencias',
  templateUrl: './visualizar-inconsistencias.component.html',
  styleUrls: ['./visualizar-inconsistencias.component.scss']
})
export class VisualizarInconsistenciasComponent implements OnInit {

  constructor(
    private _ref: ChangeDetectorRef,
    private store: Store<{ preloader: IPreloaderState }>,
    private activeRoute: ActivatedRoute,
    private contratoService: ContratoService,
    private dialog: MatDialog,
    private notifierService: NotifierService,
    private router: Router
  ) { }

  timer: NodeJS.Timeout;
  panelOpenState: boolean = false;
  inconsistenciaVeiculo: boolean = null;
  inconsistenciaFinanciamento: boolean = null;
  inconsistenciaContrato: boolean = null;
  inconsistenciaComplementar: boolean = null;
  inconsistenciaCredor: boolean = null;
  inconsistenciaDevedor: boolean = null;
  inconsistenciaTerceiroGarantidor: boolean = null;
  protocolo: string = "";
  uf: string;
  tipoOperacao: string;

  ngOnInit(): void {
    this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));
    this.activeRoute.queryParams.subscribe(params => {
      this.protocolo = params.protocolo
      this.uf = params.uf
      this.tipoOperacao = params.operacao
    });
  }

  ngAfterViewInit() {
    let element: HTMLElement = document.getElementById(this.getElementId(TipoElemento.lnk, 'expandir-todos')) as HTMLElement;
    element.click();
    this._ref.detectChanges();

    Utility.watchCondition(this.timer, () => {
      if (this.uf === 'PR') {
        if (
          this.inconsistenciaVeiculo !== null &&
          this.inconsistenciaFinanciamento !== null &&
          this.inconsistenciaContrato !== null &&
          this.inconsistenciaComplementar !== null &&
          this.inconsistenciaCredor !== null &&
          this.inconsistenciaDevedor !== null &&
          this.inconsistenciaTerceiroGarantidor !== null
        ) {
          let element: HTMLElement = document.getElementById(this.getElementId(TipoElemento.lnk, 'recolher-todos')) as HTMLElement;
          element.click();

          this.store.dispatch(closePreloader())
          return true
        }
      } else {
        if (
          this.inconsistenciaVeiculo !== null &&
          this.inconsistenciaFinanciamento !== null &&
          this.inconsistenciaContrato !== null &&
          this.inconsistenciaComplementar !== null &&
          this.inconsistenciaCredor !== null &&
          this.inconsistenciaDevedor !== null
        ) {
          let element: HTMLElement = document.getElementById(this.getElementId(TipoElemento.lnk, 'recolher-todos')) as HTMLElement;
          element.click();

          this.store.dispatch(closePreloader())
          return true
        }
      }

      this.store.dispatch(closePreloader())
    }, 2000)
  }

  changeInconsistencia(blocoDados: string, valor: boolean) {
    switch (blocoDados) {
      case 'veiculo':
        this.inconsistenciaVeiculo = valor;
        break;

      case 'financiamento':
        this.inconsistenciaFinanciamento = valor;
        break;

      case 'contrato':
        this.inconsistenciaContrato = valor;
        break;

      case 'complementar':
        this.inconsistenciaComplementar = valor;
        break;

      case 'credor':
        this.inconsistenciaCredor = valor;
        break;

      case 'devedor':
        this.inconsistenciaDevedor = valor;
        break;

      case 'terceiroGarantidor':
        this.inconsistenciaTerceiroGarantidor = valor;
        break;
    }

    this._ref.detectChanges();
  }

  onReenvioContratoEditar() {
    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: 'Iniciar edição?',
        text: '',
        buttonCancel: {
          value: false,
          text: 'Não',
        },
        buttonConfirm: {
          value: true,
          text: 'Sim'
        }
      }
    })

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));
        this.contratoService.reenvioContratoEditar(this.protocolo)
          .subscribe(response => {
            this.router.navigate([`/produtos/e-contrato/registro-contrato/${this.tipoOperacao}/`, response.identifier],
            { queryParams: { form: TipoFormulario.ONEPAGE, mode: 'edit', uf: this.uf } });
            this.store.dispatch(closePreloader());
          }, error => {
            this.notifierService.showNotification(error.error.errors[0].message, error.error.errors[0].code, 'error')
            this.store.dispatch(closePreloader());
          })
      }
    })
  }
  
  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
