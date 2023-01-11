import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Mode } from 'src/app/core/enums/mode.enum';
import { TipoDocumento } from 'src/app/core/enums/tipo-documento.enum';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { Utility } from 'src/app/core/common/utility';
import { IForm } from 'src/app/core/forms/form';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { startInfoLoading, stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { NomeFormularioRegistro } from '../../core/enums/tipo-formulario-registro.enum';
import { FormularioAlteradoEvent } from '../../core/events/formulario-alterado.event';
import { Contato } from '../../core/models/common/contato.model';
import { Documento } from '../../core/models/common/documento.model';
import { Endereco } from '../../core/models/common/endereco.model';
import { AgenteFinanceiro } from '../../core/models/contratos/agente-financeiro.model';
import { AtualizarRascunhoCredorRequest } from '../../core/requests/rascunhos/atualizar-rascunho-credor.request';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { EnderecoResponse } from '../../core/responses/geograficos/endereco.response';
import { AtualizarRascunhoCredorResponse } from '../../core/responses/rascunhos/atualizar-rascunho-credor.response';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';
import { GeograficoService } from '../../services/geografico.service';
import { RascunhoService } from '../../services/rascunho.service';
import { AditivoService } from '../../services/aditivo.service';
import { ContratoCamposEditaveis } from '../../core/models/contratos/contrato-campos-editaveis.model';
import { ContratoService } from '../../services/contrato.service';
import { RegrasCamposPorEstado } from '../../core/models/contratos/regras-campos-por-estado.model';
import { ObterAgentesFinanceirosResponse } from '../../core/responses/_backoffice/agentes-financeiros/obter-agentes-financeiros.response';
import { GravameResponse } from '../../core/responses/contratos/gravame.response';

import { SubSink } from 'subsink';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-dados-credor',
  templateUrl: './dados-credor.component.html',
  styleUrls: ['./dados-credor.component.scss']
})
export class DadosCredorComponent implements OnInit, OnDestroy, IForm {

  timer: NodeJS.Timeout;
  formulario: FormGroup;
  rascunhoCredor: AtualizarRascunhoCredorRequest = new AtualizarRascunhoCredorRequest();
  agenteFinanceiro: ObterAgentesFinanceirosResponse = new ObterAgentesFinanceirosResponse();
  agenteFinanceiroSelecionado: AgenteFinanceiro = new AgenteFinanceiro();
  mode: Mode;
  loading: boolean = false;
  cep$ = new Subject<string>();
  tipoOperacao: TipoOperacao;
  tipoAditivo: string;
  protocoloOrigem: string = null;
  ufsLicenciamento: string[];
  uf: string;
  retornoGravame: GravameResponse;
  alreadySubmited: boolean = false;
  private regrasCampos: RegrasCamposPorEstado[] = []
  private identifier: string = null;
  private subscriptions = new SubSink();
  private changeCep: boolean = true;

  @Output() formChangedEvent = new EventEmitter<FormularioAlteradoEvent>();
  @Input('tipoOperacao') set setTipoOperacao(value) {
    if (value !== undefined) {
      this.tipoOperacao = value;
      this.disableFields(value);
    }
  }
  @Input() contrato: ConsultarContratoResponse;
  @Input('retornoGravame') set setRetornoGravame(value) {
    if (value != null) {
      this.retornoGravame = value;
      if (value.codigo == 0) { this.setGravameDados(this.retornoGravame.idAgente); }
    }
  }

  constructor(private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private store: Store<{ infoLoading: IInfoLoadingState }>,
    private notifierService: NotifierService,
    private rascunhoService: RascunhoService,
    private geograficoService: GeograficoService,
    private agenteFinanceiroService: AgenteFinanceiroService,
    private _ref: ChangeDetectorRef,
    private aditivoService: AditivoService,
    private contratoService: ContratoService) {

    this.identifier = this.activeRoute.snapshot.params['identifier'];

    this.activeRoute.queryParams
      .subscribe(params => {
        this.mode = params.mode as Mode
        this.uf = params.uf
      });
  }

  ngOnInit(): void {
    this.carregarUfsLicenciamento();

    this.initializeForm();

    this.formulario.valueChanges
      .pipe(debounceTime(3000))
      .subscribe(() => this.submit());

    this.formulario.get('cep').valueChanges
      .pipe(debounceTime(1000))
      .subscribe((cep: string) => {
        if (this.formulario.get('cep').status == "DISABLED") return;
        this.cep$.next(cep)
      })

    this.subscriptions.add(
      this.cep$.subscribe(data => {
        if (this.changeCep && data !== '') this.obterEnderecoPorCep(data)
        this.changeCep = true;
      }));

    this.aditivoService.tipoAditivo$.subscribe(tipoAditivo => {
      this.tipoAditivo = tipoAditivo;
      this.disableFields(this.tipoOperacao)
    });

    this.contratoService.protocoloOrigem$.subscribe(protocoloOrigem => { this.protocoloOrigem = protocoloOrigem; });
    this.agenteFinanceiroService.agenteFinanceiros$.subscribe(agentes => this.carregarAgentesFinanceiros(agentes));
  }

  ngAfterViewInit() {
    if (this.contrato !== undefined) {
      Utility.waitFor(() => {
        this.setRetornoContrato(this.contrato.credor)
        this.disableFields(this.tipoOperacao);
        this._ref.detectChanges();
      }, 2000)
    }
  }

  initializeForm(): void {
    this.formulario = this.fb.group({
      agenteFinanceiro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(40)])],
      agenteFinanceiroId: [{ value: null, disabled: true }],
      cnpj: [{ value: null, disabled: true }, Validators.required],
      logradouro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      numero: [{ value: null, disabled: true }, Validators.required],
      bairro: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.maxLength(20), Validators.pattern(/[a-zA-Z0-9\u00C0-\u017F\s]+/)])],
      municipio: [{ value: null, disabled: true }, Validators.required],
      cep: [{ value: null, disabled: true }, Validators.compose([Validators.required, Validators.minLength(8)])],
      complemento: [{ value: null, disabled: true }],
      uf: [{ value: null, disabled: true }, Validators.required],
      telefone: [{ value: null, disabled: true }, Validators.required],
      email: [{ value: null, disabled: true }],
      empresaId: [{ value: null, disabled: true }]
    });

    if (this.uf) {
      this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.forEach(campo => {
        let validator = [Validators.required];

        if (this.uf === 'PR') { validator.push(Validators.maxLength(40)) }
        Utility.changeFieldValidators(this.formulario, campo, validator)
      })
    }
  }

  loadDataForm(): void {
    if (this.mode == Mode.Edit) {
      this.rascunhoService.obterRascunhoCredor(this.identifier)
        .subscribe((response: AtualizarRascunhoCredorResponse) => this.setValues(response));
    }
  }

  submit(btnTrigger?: boolean): void {
    this.formChangedEvent.emit({
      isValid: this.formulario.status == "DISABLED" ? true : this.formulario.valid,
      nomeFormularioRegitro: NomeFormularioRegistro.credor
    });

    if (this.formulario.valid) {
      if (!this.alreadySubmited || btnTrigger) {
        this.alreadySubmited = btnTrigger;
        if (!btnTrigger) { this.store.dispatch(startInfoLoading({ payload: 'Salvamento automático' })); }
        this.criarRascunhoCredor();

        if (!Utility.isNullOrEmpty(this.identifier)) {
          this.rascunhoService.atualizarRascunhoCredor(this.rascunhoCredor, this.identifier)
            .subscribe((response: AtualizarRascunhoCredorResponse) => {

              if (!response.isSuccessful) {
                response.errors.forEach((error) => {
                  this.notifierService.showNotification(error.message, `${error.code}`, 'error');
                })
              }
            },
              (error: ErrorMessage[]) => { this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error') });

          Utility.waitFor(() => this.store.dispatch(stopInfoLoading()), 2000)
          return;
        }
      }
    }

    if (btnTrigger) { this.formulario.markAllAsTouched(); }
  }

  obterEnderecoPorCep(cep: string) {

    if (cep == undefined)
      return;

    this.loading = true;

    this.geograficoService.obterEnderecoPorCep(cep)
      .subscribe((endereco: EnderecoResponse) => {
        this.formulario.get('logradouro').setValue(endereco.endereco.logradouro);
        this.formulario.get('bairro').setValue(
          endereco.endereco.bairro.length > 20 ? Utility.changeCharacterFieldValue(endereco.endereco.bairro, 17, '...') : endereco.endereco.bairro
        );
        this.formulario.get('municipio').setValue(endereco.endereco.municipio);
        this.formulario.get('uf').setValue(endereco.endereco.uf);
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.identifier = null;
    this.store.dispatch(stopInfoLoading());
  }

  selecionarAgenteFinanceiro(id: number) {
    if (id == undefined) { return; }

    Utility.waitFor(() => {

      let agente = this.agenteFinanceiro.empresa;

      this.formulario.get('agenteFinanceiroId').setValue(agente?.id)
      this.formulario.get('cnpj').setValue(agente?.documento?.numero)
      this.changeCep = false;
      this.formulario.get('cep').setValue(agente?.endereco.cep)
      this.formulario.get('numero').setValue(agente?.endereco.numero)
      this.formulario.get('logradouro').setValue(agente?.endereco.logradouro)
      this.formulario.get('bairro').setValue(agente?.endereco.bairro)
      this.formulario.get('uf').setValue(agente?.endereco.uf)
      this.formulario.get('municipio').setValue(agente?.endereco.municipio)
      this.formulario.get('empresaId').setValue(agente?.id);

      if (agente?.endereco.complemento) {
        let complemento = agente?.endereco.complemento.length > 20 ? 20 : agente?.endereco.complemento.length;
        this.formulario.get('complemento').setValue(agente?.endereco.complemento.slice(0, complemento))
      }

      this.formulario.get('telefone').setValue((agente?.contato.ddd ?? "") + (agente?.contato.telefone ?? ""))
      this.formulario.get('email').setValue(agente?.contato.email)

      this.rascunhoCredor.agenteFinanceiro.codigoAgenteFinanceiro = agente?.codigoAgenteFinanceiro;
      this.rascunhoCredor.agenteFinanceiro.nomeAgenteFinanceiro = agente?.nomeAgenteFinanceiro;
      this.rascunhoCredor.endereco.codigoMunicipio = agente?.endereco.codigoMunicipio;

      this.criarRascunhoCredor(true);

    }, 1000)

  }

  keyPressLetras(event) {
    let valueInput = String.fromCharCode(event.keyCode);

    if (/[a-zA-Z]+/.test(valueInput)) return true
    else {
      event.preventDefault();
      return false;
    }
  }

  mudarObrigatoriedade(campo: string) {
    if (this.uf) {
      if (this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.filter(value => value === campo).length > 0) return true
    }
    return false
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }

  private criarRascunhoCredor(load: boolean = false): void {

    if (load) this.rascunhoCredor.agenteFinanceiro.documento.numero = this.formulario.get('cnpj').value;
    this.rascunhoCredor.empresaId = this.formulario.get('agenteFinanceiroId').value;
    this.rascunhoCredor.agenteFinanceiro.id = this.formulario.get('agenteFinanceiroId').value;
    this.rascunhoCredor.agenteFinanceiro.documento.tipoDocumento = Documento.convertToNumber(TipoDocumento.Cnpj);
    this.rascunhoCredor.endereco.cep = this.formulario.get('cep').value;
    this.rascunhoCredor.endereco.logradouro = this.formulario.get('logradouro').value;
    this.rascunhoCredor.endereco.numero = this.formulario.get('numero').value;
    this.rascunhoCredor.endereco.bairro = this.formulario.get('bairro').value;
    this.rascunhoCredor.endereco.complemento = this.formulario.get('complemento').value;
    this.rascunhoCredor.endereco.uf = this.formulario.get('uf').value;
    this.rascunhoCredor.endereco.municipio = this.formulario.get('municipio').value;
    this.rascunhoCredor.contato.ddd = this.formulario.get('telefone').value?.toString().substring(0, 2);
    this.rascunhoCredor.contato.telefone = this.formulario.get('telefone').value?.toString().substring(2);
    this.rascunhoCredor.contato.email = this.formulario.get('email').value;
  }

  private setValues(response: AtualizarRascunhoCredorResponse, alteracao: boolean = false) {
    if (response.id > 0) {
      this.formulario.get('agenteFinanceiro').setValue(response.nomeAgenteFinanceiro);
      this.formulario.get('agenteFinanceiroId').setValue(response.empresaId)
    }
    this.formulario.get('logradouro').setValue(response.endereco.logradouro);
    this.formulario.get('numero').setValue(response.endereco.numero);
    this.formulario.get('cep').setValue(response.endereco.cep);
    this.formulario.get('complemento').setValue(response.endereco.complemento);
    this.formulario.get('bairro').setValue(response.endereco.bairro);
    this.formulario.get('municipio').setValue(response.endereco.municipio);
    this.formulario.get('uf').setValue(response.endereco.uf);
    this.formulario.get('telefone').setValue(response.contato.telefoneCompleto);
    this.formulario.get('email').setValue(response.contato.email);

    if (alteracao) {// seta o id e o CNPJ do credor quando os dados sao retornados do back end
      this.formulario.get('agenteFinanceiroId').setValue(response.id);
      this.formulario.get('cnpj').setValue(response.documento.numero);
      this.rascunhoCredor.agenteFinanceiro.documento.numero = this.formulario.get('cnpj').value;
      this.rascunhoCredor.endereco.codigoMunicipio = response.endereco.codigoMunicipio;
      this.rascunhoCredor.agenteFinanceiro.codigoAgenteFinanceiro = response.codigoAgenteFinanceiro;
      this.rascunhoCredor.agenteFinanceiro.nomeAgenteFinanceiro = response.nomeAgenteFinanceiro;
      this.rascunhoCredor.agenteFinanceiro.id = response.id;

      this.changeCep = false;
    }
    else if (response.id > 0) { this.selecionarAgenteFinanceiro(response.id); } // nao atualiza os dados do credor quando os dados sao retornados do back end
  }

  private carregarAgentesFinanceiros(agenteFinanceiro: AgenteFinanceiro) {
    if (agenteFinanceiro.id) {
      this.agenteFinanceiro.empresa = agenteFinanceiro;
      this.formulario.get('agenteFinanceiro').patchValue(agenteFinanceiro.nomeAgenteFinanceiro);
      this.selecionarAgenteFinanceiro(agenteFinanceiro.id);
    }
  }

  private setRetornoContrato(credor) {
    this.changeCep = false; // para não alterar os campos quando carregar o CEP

    let valores = <AtualizarRascunhoCredorResponse>{
      documento: <Documento>{ tipoDocumento: credor.documento.tipoDocumento, numero: credor.documento.numero },
      endereco: <Endereco>{
        logradouro: credor.endereco.logradouro,
        numero: credor.endereco.numero,
        bairro: credor.endereco.bairro,
        cep: credor.endereco.cep,
        municipio: credor.endereco.municipio,
        uf: credor.endereco.uf,
        complemento: credor.endereco.complemento,
        codigoMunicipio: credor.endereco.codigoMunicipio
      },
      contato: <Contato>{
        ddd: credor.contato.ddd,
        telefone: credor.contato.telefone,
        telefoneCompleto: credor.contato.ddd + credor.contato.telefone,
        email: credor.contato.email
      },
      codigoAgenteFinanceiro: credor.codigoAgenteFinanceiro,
      nomeAgenteFinanceiro: credor.nomeAgenteFinanceiro,
      empresaId: credor.empresaId
    }

    Utility.watchCondition(this.timer, () => {
      if (this.agenteFinanceiro.empresa) {
        valores.id = this.agenteFinanceiro.empresa.id;
        this.setValues(valores, true);
        return true;
      }
    }, 1000);
  }

  private disableFields(tipoOperacao: TipoOperacao) {
    if (this.formulario === undefined) return;
    var fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'agenteFinanceiro', enable: false },
      { field: 'agenteFinanceiroId', enable: false },
      { field: 'cnpj', enable: false },
      { field: 'logradouro', enable: false },
      { field: 'numero', enable: false },
      { field: 'bairro', enable: false },
      { field: 'municipio', enable: false },
      { field: 'cep', enable: false },
      { field: 'complemento', enable: false },
      { field: 'uf', enable: false },
      { field: 'telefone', enable: false },
      { field: 'email', enable: false }];

    if (tipoOperacao == TipoOperacao.RegistrarContrato) {
      Utility.enableFields(this.formulario, fieldsConfig, this._ref);
      return;
    }

    if (tipoOperacao == TipoOperacao.AlterarContrato || tipoOperacao == TipoOperacao.AlterarAditivo) {
      Utility.enableFields(this.formulario, <ContratoCamposEditaveis[]>[{ field: 'agenteFinanceiro', enable: false }, { field: 'cnpj', enable: false }], this._ref);
      return;
    }

    if (tipoOperacao == TipoOperacao.RegistrarAditivo && (this.protocoloOrigem === null || this.protocoloOrigem === "0")) {
      Utility.waitFor(() => { Utility.enableFields(this.formulario, fieldsConfig, this._ref); }, 2000)
      return;
    }

    this.disableFieldsByAditivo(this.tipoAditivo);
  }

  private disableFieldsByAditivo(tipoAditivo: string) {
    this.tipoAditivo = tipoAditivo;
    var fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'agenteFinanceiro', enable: false },
      { field: 'agenteFinanceiroId', enable: false },
      { field: 'cnpj', enable: false },
      { field: 'logradouro', enable: false },
      { field: 'numero', enable: false },
      { field: 'bairro', enable: false },
      { field: 'municipio', enable: false },
      { field: 'cep', enable: false },
      { field: 'complemento', enable: false },
      { field: 'uf', enable: false },
      { field: 'telefone', enable: false },
      { field: 'email', enable: false }
    ];

    if (this.protocoloOrigem === null || this.protocoloOrigem === "0") {
      Utility.enableFields(this.formulario, fieldsConfig, this._ref);
      return;
    }

    if (tipoAditivo == "TA_CESSAO_DIREITO_CREDOR") {
      fieldsConfig = <ContratoCamposEditaveis[]>[
        { field: 'agenteFinanceiro', enable: true },
        { field: 'agenteFinanceiroId', enable: true },
        { field: 'cnpj', enable: true },
        { field: 'logradouro', enable: true },
        { field: 'numero', enable: true },
        { field: 'bairro', enable: true },
        { field: 'municipio', enable: true },
        { field: 'cep', enable: true },
        { field: 'complemento', enable: true },
        { field: 'uf', enable: true },
        { field: 'telefone', enable: true },
        { field: 'email', enable: true }
      ];
    }

    Utility.enableFields(this.formulario, fieldsConfig, this._ref);
  }

  private setGravameDados(agenteGravame: number) {
    Utility.waitFor(() => {
      if (!this.formulario.get('agenteFinanceiro').disabled) {
        this.formulario.get('agenteFinanceiro').setValue(agenteGravame);
        this.selecionarAgenteFinanceiro(agenteGravame);
      }
    }, 3000);
  }
}