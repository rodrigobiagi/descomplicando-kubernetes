import { ViewportScroller } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { BooleanOption } from 'src/app/core/enums/boolean-option.enum';
import { Mode } from 'src/app/core/enums/mode.enum';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { FormularioAlteradoEvent } from '../../core/events/formulario-alterado.event';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { ContratoService } from '../../services/contrato.service';
import { DadosContratoComponent } from '../dados-contrato/dados-contrato.component';
import { DadosCredorComponent } from '../dados-credor/dados-credor.component';
import { DadosDevedorComponent } from '../dados-devedor/dados-devedor.component';
import { DadosFinanciamentoComponent } from '../dados-financiamento/dados-financiamento.component';
import { DadosTerceiroGarantidorComponent } from '../dados-terceiro-garantidor/dados-terceiro-garantidor.component';
import { DadosVeiculoComponent } from '../dados-veiculo/dados-veiculo.component';

import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { SubSink } from 'subsink';
import { GravameResponse } from '../../core/responses/contratos/gravame.response';
import { stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';

@Component({
  selector: 'app-form-onepage',
  templateUrl: './form-onepage.component.html',
  styleUrls: ['./form-onepage.component.scss']
})
export class FormOnepageComponent implements OnInit, OnDestroy {

  timer: NodeJS.Timeout;
  formulario: FormGroup;
  formIsValid: boolean = false;
  possuiInconsistencia: boolean = false;
  contrato: ConsultarContratoResponse;
  formularioAtualizado$ = new Subject();
  tipoOperacao: TipoOperacao;
  ehFrota: boolean;
  mode: Mode;
  uf: string;
  private subscriptions = new SubSink();

  @Input() retornoGravame: GravameResponse;
  @Input('tipoOperacao') set setTipoOperacao(value) { if (value != undefined) { this.tipoOperacao = value; } }
  @Input('ehFrota') set setEhFrota(value) { if (value != undefined) { this.ehFrota = value; } }
  @ViewChild(DadosContratoComponent) dadosContrato: DadosContratoComponent;
  @ViewChild(DadosCredorComponent) dadosCredor: DadosCredorComponent;
  @ViewChild(DadosDevedorComponent) dadosDevedor: DadosDevedorComponent;
  @ViewChild(DadosFinanciamentoComponent) dadosFinanciamento: DadosFinanciamentoComponent;
  @ViewChild(DadosVeiculoComponent) dadosVeiculo: DadosVeiculoComponent;
  @ViewChild(DadosTerceiroGarantidorComponent) dadosTerceiroGarantidor: DadosTerceiroGarantidorComponent;

  constructor(
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private store: Store<{ preloader: IPreloaderState }>,
    private contratoService: ContratoService
  ) {
    this.activeRoute.queryParams.subscribe(params => {
      this.mode = params.mode as Mode
      this.uf = params.uf
    });
  }

  ngOnInit(): void {
    this.initializeForm()

    this.subscriptions.add(
      this.formularioAtualizado$.subscribe(() => this.checkStatusForm()),
      this.contratoService.contrato$.subscribe(contrato => {
        if (contrato != undefined) {
          this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));
          this.contrato = contrato;

          Utility.waitFor(() => {
            this.store.dispatch(closePreloader());
          }, 8000);

          Utility.watchCondition(this.timer, () => {
            if (this.tipoOperacao) {
              if (this.formIsValid) {
                this.store.dispatch(closePreloader());
                return true;
              }
            }
          }, 1000)
        }
        else this.contrato = undefined;
      })
    );

    if (this.mode == Mode.Edit) {
      this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));
      Utility.waitFor(() => { this.store.dispatch(closePreloader()); }, 5000);
    }
  }

  revisarRegistro() {
    this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));

    this.checkStatusForm();

    Utility.waitFor(() => {
      if (this.formIsValid) {
        this.activeRoute.params.subscribe(params => {
          let urlOperacao =
            this.tipoOperacao == TipoOperacao.RegistrarContrato ? 'registrar-contrato' : (this.tipoOperacao == TipoOperacao.AlterarContrato ? 'alterar-contrato' : (this.tipoOperacao == TipoOperacao.RegistrarAditivo ? 'registrar-aditivo' : 'alterar-aditivo'))
          this.router.navigate([`/produtos/e-contrato/registro-contrato/${urlOperacao}/revisar-registro/${params.identifier}`])
        })

        return
      }

      this.dadosContrato.submit(true);
      this.dadosCredor.submit(true);
      this.dadosDevedor.submit(true);
      this.dadosFinanciamento.submit(true);
      this.dadosVeiculo.submit(true);
      // if (this.uf === 'PR') this.dadosTerceiroGarantidor.submit(true);
      // descomentar linha acima após implementação do terceiro garantidor

      this.viewportScroller.scrollToPosition([0, 0]);
      this.possuiInconsistencia = true;
      this.store.dispatch(closePreloader());
    }, 7000);
  }

  onFormChanged(event: FormularioAlteradoEvent) {
    this.formulario.get(event.nomeFormularioRegitro).setValue(`${event.isValid}`);
    this.formularioAtualizado$.next();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.contrato = undefined;
    this.store.dispatch(stopInfoLoading());
  }

  private initializeForm(): void {
    this.formulario = this.fb.group({
      formVeiculo: [BooleanOption.NAO],
      formContrato: [BooleanOption.NAO],
      formComplemento: [BooleanOption.NAO],
      formFinanciamento: [BooleanOption.NAO],
      formCredor: [BooleanOption.NAO],
      formDevedor: [BooleanOption.NAO],
      formTerceiroGarantidor: [BooleanOption.NAO]
    })
  }

  private checkStatusForm() {
    this.formIsValid = false;

    const formVeiculoIsValid = JSON.parse(this.formulario.get('formVeiculo').value);
    const formContratoIsValid = JSON.parse(this.formulario.get('formContrato').value);
    const formComplementoIsValid = JSON.parse(this.formulario.get('formComplemento').value);
    const formFinanciamentoIsValid = JSON.parse(this.formulario.get('formFinanciamento').value);
    const formCredorIsValid = JSON.parse(this.formulario.get('formCredor').value);
    const formDevedorIsValid = JSON.parse(this.formulario.get('formDevedor').value);
    const formTerceiroGarantidorIsValid =
      // this.uf === 'PR' ? JSON.parse(this.formulario.get('formTerceiroGarantidor').value) : 
      true;
    // descomentar linha acima após implementação do terceiro garantidor

    this.formIsValid = formVeiculoIsValid &&
      formContratoIsValid &&
      formComplementoIsValid &&
      formFinanciamentoIsValid &&
      formCredorIsValid &&
      formDevedorIsValid &&
      formTerceiroGarantidorIsValid;
  }
}
