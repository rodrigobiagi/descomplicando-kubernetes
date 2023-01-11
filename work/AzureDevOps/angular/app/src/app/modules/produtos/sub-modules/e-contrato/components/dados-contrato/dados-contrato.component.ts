import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { Mode } from 'src/app/core/enums/mode.enum';
import { NomeFormularioRegistro } from '../../core/enums/tipo-formulario-registro.enum';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { Utility } from 'src/app/core/common/utility';
import { IForm } from 'src/app/core/forms/form';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { startInfoLoading, stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { FormularioAlteradoEvent } from '../../core/events/formulario-alterado.event';
import { ValorDominio } from '../../core/models/dominios/valor-dominio.model';
import { AtualizarRascunhoContratoRequest } from '../../core/requests/rascunhos/atualizar-rascunho-contrato.request';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { DominioResponse } from '../../core/responses/dominios/dominio.response';
import { AtualizarRascunhoContratoResponse } from '../../core/responses/rascunhos/atualizar-rascunho-contrato.response';
import { ObterRascunhoResumoResponse } from '../../core/responses/rascunhos/obter-rascunho-resumo.response';
import { DominioService } from '../../services/dominio.service';
import { RascunhoService } from '../../services/rascunho.service';
import { AditivoService } from '../../services/aditivo.service';
import { ContratoCamposEditaveis } from '../../core/models/contratos/contrato-campos-editaveis.model';
import { ContratoService } from '../../services/contrato.service';
import { FORMATO_DATA } from '../../core/models/common/formato-dataPicker.model';
import { GeograficoService } from '../../services/geografico.service';
import { RegrasCamposPorEstado } from '../../core/models/contratos/regras-campos-por-estado.model';

import { SubSink } from 'subsink';
import { Store } from '@ngrx/store';
import { debounceTime } from 'rxjs/operators';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';
import { BackofficeService } from '../../services/_backoffice/_backoffice.service';
import { ObterTaxaDudaResponse } from '../../core/responses/_backoffice/taxas/obter-taxa-duda.response';

@Component({
  selector: 'app-dados-contrato',
  templateUrl: './dados-contrato.component.html',
  styleUrls: ['./dados-contrato.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: FORMATO_DATA },
  ]
})
export class DadosContratoComponent implements OnInit, OnDestroy, IForm {

  formulario: FormGroup;
  private identifier: string = null;
  rascunhoContrato: AtualizarRascunhoContratoRequest = new AtualizarRascunhoContratoRequest();
  tiposRestricao: ValorDominio[] = [];
  tiposAditivo: ValorDominio[] = [];
  mode: Mode;
  tipoOperacao: TipoOperacao;
  submitComplementar: boolean = false;
  tipoAditivo: string;
  protocoloOrigem: string = null;
  uf: string;
  private subscriptions = new SubSink();
  minDate: Date;
  maxDate: Date;
  ufsLicenciamento: string[];
  empresaId: number = null;
  taxasResponse: ObterTaxaDudaResponse = null;
  alreadySubmited: boolean = false;

  private regrasCampos: RegrasCamposPorEstado[] = [
    {
      uf: 'RJ',
      camposObrigatorios: ['duda']
    }
  ]

  @Output() formChangedEvent = new EventEmitter<FormularioAlteradoEvent>();
  @Input('tipoOperacao') set setTipoOperacao(value) {
    if (value != undefined) {
      this.tipoOperacao = value
      if (value == TipoOperacao.RegistrarAditivo || value == TipoOperacao.AlterarAditivo) {
        this.regrasCampos.forEach(regra => {
          regra.camposObrigatorios.push('numeroAditivo');
          regra.camposObrigatorios.push('dataAditivo')
        })

        Utility.changeFieldValidators(this.formulario, 'numeroAditivo', [Validators.required])
        Utility.changeFieldValidators(this.formulario, 'dataAditivo', [Validators.required])
      }

      this.disableFields(value)
    }
  }
  @Input() contrato: ConsultarContratoResponse;

  constructor(private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store<{ infoLoading: IInfoLoadingState }>,
    private rascunhoService: RascunhoService,
    private dominioService: DominioService,
    private ref: ChangeDetectorRef,
    private aditivoService: AditivoService,
    private contratoService: ContratoService,
    private geograficoService: GeograficoService,
    private agenteFinanceiroService: AgenteFinanceiroService,
    private backofficeService: BackofficeService) {

    this.identifier = this.activeRoute.snapshot.params['identifier'];

    this.activeRoute.queryParams
      .subscribe(params => {
        this.mode = params.mode as Mode
        this.uf = params.uf
      });

    this.minDate = new Date(1985, 4, 12);
    this.maxDate = new Date();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDataForm();
    this.carregarUfsLicenciamento();

    this.formulario.valueChanges
      .pipe(debounceTime(3000))
      .subscribe(() => this.submit());

    this.formulario.get('tipoAditivo').valueChanges.subscribe(value => {
      if (value === 0) return;
      this.onChangeAditivo(value);
    })

    this.subscriptions.add(
      this.contratoService.protocoloOrigem$.subscribe(protocoloOrigem => { this.protocoloOrigem = protocoloOrigem; }),
      this.agenteFinanceiroService.empresaId$.subscribe(empresaId => this.empresaId = empresaId)
    );
  }

  ngAfterViewInit() {
    if (this.contrato !== undefined) {
      Utility.waitFor(() => {
        this.setRetornoContrato(this.contrato);
        this.disableFields(this.tipoOperacao);
        this.ref.detectChanges();
      }, 2000)
    }

    Utility.waitFor(() => { this.obtemTaxa(); }, 2000);
  }

  initializeForm(): void {
    this.formulario = this.fb.group({
      numeroContrato: [{ value: null, disabled: true }, Validators.required],
      ufLicenciamento: [{ value: null, disabled: true }, Validators.required],
      tipoRestricao: [null, Validators.required],
      dataContrato: [null, Validators.required],
      duda: [{ value: null, disabled: true }],
      numeroAditivo: [null],
      dataAditivo: [null],
      tipoAditivo: [null]
    });

    this.carregarRascunhoResumo();
    this.carregarTipoAditivo();
    this.carregarTipoRestricao();

    if (this.uf) {
      this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.forEach(campo => {
        Utility.changeFieldValidators(this.formulario, campo, [Validators.required])
      })
    }
  }

  loadDataForm(): void {
    if (this.mode == Mode.Edit) {
      this.rascunhoService.obterRascunhoContrato(this.identifier)
        .subscribe((response: AtualizarRascunhoContratoResponse) => this.setValues(response));
    }
  }

  submit(btnTrigger?: boolean): void {
    if (btnTrigger) { this.submitComplementar = true; }
    else { this.submitComplementar = false; }

    this.formChangedEvent.emit({
      isValid: this.formulario.valid,
      nomeFormularioRegitro: NomeFormularioRegistro.contrato
    });

    if (this.formulario.valid) {
      if (!this.alreadySubmited || btnTrigger) {
        this.alreadySubmited = btnTrigger;
        if (!btnTrigger) { this.store.dispatch(startInfoLoading({ payload: 'Salvamento automático' })); }
        this.criarRascunhoContrato();

        if (!Utility.isNullOrEmpty(this.identifier)) {
          this.rascunhoService.atualizarRascunhoContrato(this.rascunhoContrato, this.identifier)
            .subscribe((response: AtualizarRascunhoContratoResponse) => {

              if (!response.isSuccessful) {
                response.errors.forEach((error) => {
                  this.notifierService.showNotification(error.message, `${error.code}`, 'error');
                })
              }
            },
              (error: ErrorMessage[]) => { this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error') })

          Utility.waitFor(() => this.store.dispatch(stopInfoLoading()), 2000)
          return;
        }
      }
    }

    if (btnTrigger) { this.formulario.markAllAsTouched(); }
  }

  onFormChanged(event: FormularioAlteradoEvent) {
    this.formChangedEvent.emit({
      isValid: event.isValid,
      nomeFormularioRegitro: event.nomeFormularioRegitro
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.identifier = null;
    this.store.dispatch(stopInfoLoading());
  }

  mudarObrigatoriedade(campo: string) {
    if (this.uf) {
      if (this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.filter(value => value === campo).length > 0) return true
    }

    return false
  }

  private obtemTaxa() {
    if (this.uf == "RJ") {
      if (this.empresaId) {
        this.backofficeService.obterQtdTaxasDisponivel(this.empresaId).subscribe(response => {
          if (response.id) {
            this.taxasResponse = response;
            if (this.taxasResponse.ativo && this.taxasResponse.qtdGuiaDisponivel > 0) {
              this.formulario.get('duda').patchValue('**********');
              this.formulario.get('duda').disable();
              return;
            }

            this.formulario.get('duda').enable();
          }
        })
      }
    }
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }

  private criarRascunhoContrato(): void {
    this.rascunhoContrato.gravame.tipoRestricao = this.formulario.get('tipoRestricao').value;
    this.rascunhoContrato.dataContrato = Utility.formatDate(this.formulario.get('dataContrato').value);
    this.rascunhoContrato.aditivo.numero = this.formulario.get('numeroAditivo').value;
    this.rascunhoContrato.aditivo.data = Utility.formatDate(this.formulario.get('dataAditivo').value);
    this.rascunhoContrato.aditivo.tipoAditivo = Number(this.formulario.get('tipoAditivo').value) == 0 ? null : Number(this.formulario.get('tipoAditivo').value);

    if (this.uf == 'RJ') {
      this.rascunhoContrato.numeroTaxaDetran = this.taxasResponse?.ativo && this.taxasResponse?.qtdGuiaDisponivel > 0 ? "" : this.formulario.get('duda').value;
    }
  }

  private setValues(response: AtualizarRascunhoContratoResponse) {
    this.formulario.get('tipoRestricao').setValue(response.tipoRestricao);
    this.formulario.get('dataContrato').setValue(this.alteraFormatoData(response.dataContrato))
    this.formulario.get('numeroAditivo').setValue(response.numeroAditivo);
    this.formulario.get('dataAditivo').setValue(this.alteraFormatoData(response.dataAditivo));
    this.formulario.get('tipoAditivo').setValue(response.tipoAditivo);

    if (this.uf == 'RJ') {
      if (response.numeroTaxaDetran) { this.formulario.get('duda').setValue(response.numeroTaxaDetran); }
    }

    if (this.tipoOperacao !== TipoOperacao.RegistrarContrato) {
      this.rascunhoContrato.gravame.ufLicenciamento = response.ufLicenciamento;

      if (this.tipoOperacao == TipoOperacao.RegistrarAditivo) {
        this.rascunhoContrato.gravame.tipoRestricao = response.tipoRestricao;
      }
    }
  }

  private setRetornoContrato(contrato) {
    let valores = <AtualizarRascunhoContratoResponse>{
      dataAditivo: contrato.contrato?.dataAditivo,
      dataContrato: contrato.contrato?.dataContrato,
      numeroAditivo: contrato.contrato?.numeroAditivo,
      numeroContrato: contrato.contrato?.numeroContrato,
      numeroTaxaDetran: contrato.contrato?.taxaDetran?.numero,
      tipoRestricao: contrato.contrato?.tipoRestricao,
      ufLicenciamento: contrato.contrato?.ufLicenciamento,
      tipoAditivo: contrato.contrato?.tipoAditivo
    }

    this.setValues(valores);
  }

  private alteraFormatoData(data: string) {
    if (data == undefined) return;

    const diaMesAnoDataContrato = data.split('/')
    const novoModeloData = new Date(Number(diaMesAnoDataContrato[2]), Number(diaMesAnoDataContrato[1]) - 1, Number(diaMesAnoDataContrato[0]))

    return novoModeloData
  }

  private carregarRascunhoResumo() {

    this.rascunhoService.obterRascunhoResumo(this.identifier)
      .subscribe((response: ObterRascunhoResumoResponse) => {
        this.formulario.get('numeroContrato').setValue(response.rascunho.numeroContrato);
        this.formulario.get('ufLicenciamento').setValue(response.rascunho.ufLicenciamento);
      });
  }

  private carregarTipoAditivo() {

    this.dominioService.obterPorTipo('TIPO_ADITIVO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {

          response.valorDominio.forEach((dominio: ValorDominio) => {
            this.tiposAditivo.push(dominio);
          })
        }

      })
  }

  private carregarTipoRestricao() {

    this.dominioService.obterPorTipo('TIPO_RESTRICAO')
      .subscribe((response: DominioResponse) => {

        if (response.isSuccessful) {

          response.valorDominio.forEach((dominio: ValorDominio) => {
            this.tiposRestricao.push(dominio);
          })
        }

      })
  }

  private disableFields(tipoOperacao: TipoOperacao) {
    if (this.formulario === undefined) return;

    let fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'numeroContrato', enable: false },
      { field: 'ufLicenciamento', enable: false },
      { field: 'tipoRestricao', enable: true },
      { field: 'dataContrato', enable: true },
      { field: 'duda', enable: this.taxasResponse ? (this.taxasResponse.ativo && this.taxasResponse.qtdGuiaDisponivel > 0 ? false : true) : true },
      { field: 'numeroAditivo', enable: true },
      { field: 'dataAditivo', enable: true }
    ];

    if (tipoOperacao == TipoOperacao.RegistrarContrato) {
      Utility.enableFields(this.formulario, fieldsConfig, this.ref);
      return;
    }

    if ((tipoOperacao == TipoOperacao.RegistrarAditivo || tipoOperacao == TipoOperacao.AlterarContrato) && (this.protocoloOrigem === null || this.protocoloOrigem === "0")) {
      Utility.waitFor(() => {
        Utility.enableFields(this.formulario, fieldsConfig, this.ref);
      }, 2000)

      return;
    }

    if (this.tipoOperacao === TipoOperacao.AlterarContrato) {
      Utility.enableFields(this.formulario, fieldsConfig, this.ref);
      return;
    }

    if (tipoOperacao === TipoOperacao.RegistrarAditivo) {
      this.disableFieldsByAditivo(this.tipoAditivo);
      return;
    }

    if (this.tipoOperacao === TipoOperacao.AlterarAditivo) {
      fieldsConfig.push({ field: 'tipoAditivo', enable: false });
      Utility.enableFields(this.formulario, fieldsConfig, this.ref)
      return;
    }
  }

  private onChangeAditivo(aditivoValue?: number) {
    this.tipoAditivo = aditivoValue == null ? "TA_NAO_SELECIONADO" : this.tiposAditivo.find(tipo => tipo.id == aditivoValue).palavraChave;
    this.aditivoService.retornoTipoAditivo(this.tipoAditivo);

    this.disableFieldsByAditivo(this.tipoAditivo)
  }

  private disableFieldsByAditivo(tipoAditivo: string) {
    let fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'numeroContrato', enable: false },
      { field: 'ufLicenciamento', enable: false },
      { field: 'tipoRestricao', enable: true },
      { field: 'dataContrato', enable: true },
      { field: 'duda', enable: this.taxasResponse ? (this.taxasResponse.ativo && this.taxasResponse.qtdGuiaDisponivel > 0 ? false : true) : true },
      { field: 'numeroAditivo', enable: true },
      { field: 'dataAditivo', enable: true }
    ];

    if (this.protocoloOrigem === null || this.protocoloOrigem === "0") {
      Utility.enableFields(this.formulario, fieldsConfig, this.ref);
      return;
    }

    if (tipoAditivo == "TA_NAO_SELECIONADO") {
      fieldsConfig.find(config => config.field == 'tipoRestricao').enable = false;
    }
    else if (tipoAditivo == "TA_SUBSTITUICAO_GARANTIA") {
      fieldsConfig.find(config => config.field == 'tipoRestricao').enable = false;
    }
    else if (tipoAditivo == "TA_CESSAO_DIREITO_CREDOR") {
      fieldsConfig.find(config => config.field == 'tipoRestricao').enable = false;
    }
    else if (tipoAditivo == "TA_CESSAO_DIREITO_DEVEDOR") {
      fieldsConfig.find(config => config.field == 'tipoRestricao').enable = false;
    }

    Utility.enableFields(this.formulario, fieldsConfig, this.ref);
  }
}
