import { ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Mode } from 'src/app/core/enums/mode.enum';
import { TipoDocumento } from 'src/app/core/enums/tipo-documento.enum';
import { NomeFormularioRegistro } from '../../core/enums/tipo-formulario-registro.enum';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { Utility } from 'src/app/core/common/utility';
import { IForm } from 'src/app/core/forms/form';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { startInfoLoading, stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { FormularioAlteradoEvent } from '../../core/events/formulario-alterado.event';
import { Contato } from '../../core/models/common/contato.model';
import { Documento } from '../../core/models/common/documento.model';
import { Endereco } from '../../core/models/common/endereco.model';
import { AtualizarRascunhoDevedorRequest } from '../../core/requests/rascunhos/atualizar-rascunho-develodr.request';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { EnderecoResponse } from '../../core/responses/geograficos/endereco.response';
import { AtualizarRascunhoDevedorResponse } from '../../core/responses/rascunhos/atualizar-rascunho-devedor.response';
import { GeograficoService } from '../../services/geografico.service';
import { RascunhoService } from '../../services/rascunho.service';
import { AditivoService } from '../../services/aditivo.service';
import { ContratoCamposEditaveis } from '../../core/models/contratos/contrato-campos-editaveis.model';
import { ContratoService } from '../../services/contrato.service';
import { RegrasCamposPorEstado } from '../../core/models/contratos/regras-campos-por-estado.model';

import { SubSink } from 'subsink';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-dados-devedor',
  templateUrl: './dados-devedor.component.html',
  styleUrls: ['./dados-devedor.component.scss']
})

export class DadosDevedorComponent implements OnInit, OnDestroy, IForm {

  formulario: FormGroup;
  rascunhoDevedor: AtualizarRascunhoDevedorRequest = new AtualizarRascunhoDevedorRequest();
  mode: Mode;
  loading: boolean = false;
  cep$ = new Subject<string>();
  tipoOperacao: TipoOperacao;
  tipoAditivo: string;
  protocoloOrigem: string = null;
  uf: string;
  ufsLicenciamento: string[];
  alreadySubmited: boolean = false;
  private identifier: string = null;
  private subscriptions = new SubSink();
  private changeCep: boolean = true;
  private regrasCampos: RegrasCamposPorEstado[] = []
  @Input('tipoOperacao') set setTipoOperacao(value) {
    if (value != undefined) {
      this.tipoOperacao = value;
      this.disableFields(value);
    }
  }

  @Output() formChangedEvent = new EventEmitter<FormularioAlteradoEvent>();
  @Input() contrato: ConsultarContratoResponse;

  constructor(private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private store: Store<{ infoLoading: IInfoLoadingState }>,
    private notifierService: NotifierService,
    private rascunhoService: RascunhoService,
    private geograficoService: GeograficoService,
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
    this.initializeForm();
    this.loadDataForm();
    this.carregarUfsLicenciamento();

    this.formulario.valueChanges
      .pipe(debounceTime(3000))
      .subscribe(() => this.submit());

    this.formulario.get('cep').valueChanges
      .pipe(debounceTime(1000))
      .subscribe((cep: string) => this.cep$.next(cep))

    this.subscriptions.add(
      this.cep$.subscribe(data => {
        if (this.changeCep && data !== '') this.obterEnderecoPorCep(data)
        this.changeCep = true;
      }));

    this.formulario.get('tipoDocumento').valueChanges
      .subscribe((tipoDocumento: string) => { this.setDocumentValidator(tipoDocumento); });

    this.aditivoService.tipoAditivo$.subscribe(tipoAditivo => {
      this.tipoAditivo = tipoAditivo;
      this.disableFields(this.tipoOperacao)
    });

    this.contratoService.protocoloOrigem$.subscribe(protocoloOrigem => {
      this.protocoloOrigem = protocoloOrigem;
    })
  }

  ngAfterViewInit() {
    if (this.contrato !== undefined) {
      Utility.waitFor(() => {
        this.setRetornoContrato(this.contrato.devedor);
        this.disableFields(this.tipoOperacao);
        this._ref.detectChanges();
      }, 2000)
    }
  }

  initializeForm(): void {
    this.formulario = this.fb.group({
      nomeDoFinanciado: [null, Validators.compose([Validators.required, Validators.maxLength(40)])],
      tipoDocumento: [TipoDocumento.Cpf, Validators.required],
      documento: [null, Validators.compose([Validators.required, Utility.isValidCpf()])],
      logradouro: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      numero: [null, Validators.compose([Validators.required, Validators.maxLength(5)])],
      bairro: [null, Validators.compose([Validators.required, Validators.maxLength(20), Validators.pattern(/[a-zA-Z0-9\u00C0-\u017F\s]+/)])],
      municipio: [null, Validators.compose([Validators.required, Validators.maxLength(30)])],
      cep: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
      complemento: [null, Validators.maxLength(20)],
      uf: [null, Validators.required],
      telefone: [null, Validators.required],
      email: [null]
    });

    if (this.uf) {
      this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.forEach(campo => {
        Utility.changeFieldValidators(this.formulario, campo, [Validators.required])
      })
    }
  }

  loadDataForm(): void {
    if (this.mode == Mode.Edit) {
      this.rascunhoService.obterRascunhoDevedor(this.identifier)
        .subscribe((response: AtualizarRascunhoDevedorResponse) => this.setValues(response));
    }
  }

  submit(btnTrigger?: boolean): void {
    this.formChangedEvent.emit({
      isValid: this.formulario.valid,
      nomeFormularioRegitro: NomeFormularioRegistro.devedor
    });

    if (this.formulario.valid) {
      if (!this.alreadySubmited || btnTrigger) {
        this.alreadySubmited = btnTrigger;
        if (!btnTrigger) { this.store.dispatch(startInfoLoading({ payload: 'Salvamento automático' })); }
        this.criarRascunhoDevedor();

        if (!Utility.isNullOrEmpty(this.identifier)) {
          this.rascunhoService.atualizarRascunhoDevedor(this.rascunhoDevedor, this.identifier)
            .subscribe((response: AtualizarRascunhoDevedorResponse) => {
              if (!response.isSuccessful) {
                response.errors.forEach((error) => {
                  this.notifierService.showNotification(error.message, `${error.code}`, 'error');
                })
              }
            }, (error: ErrorMessage[]) => { this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error'); })

          Utility.waitFor(() => this.store.dispatch(stopInfoLoading()), 2000);
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

  mascaraDocumento(tipoDocumento: string): string {

    if (tipoDocumento == TipoDocumento.Cpf)
      return Documento.mascaraCPF();

    return Documento.mascaraCNPJ();
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

  private criarRascunhoDevedor(): void {

    this.rascunhoDevedor.documento.tipoDocumento = Documento.convertToNumber(this.formulario.get('tipoDocumento')?.value);
    this.rascunhoDevedor.documento.numero = this.formulario.get('documento').value;
    this.rascunhoDevedor.nomeDoFinanciado = this.formulario.get('nomeDoFinanciado').value;
    this.rascunhoDevedor.endereco.cep = this.formulario.get('cep').value;
    this.rascunhoDevedor.endereco.logradouro = this.formulario.get('logradouro').value;
    this.rascunhoDevedor.endereco.numero = this.formulario.get('numero').value;
    this.rascunhoDevedor.endereco.bairro = this.formulario.get('bairro').value;
    this.rascunhoDevedor.endereco.complemento = this.formulario.get('complemento').value;
    this.rascunhoDevedor.endereco.uf = this.formulario.get('uf').value;
    this.rascunhoDevedor.endereco.municipio = this.formulario.get('municipio').value;
    this.rascunhoDevedor.contato.ddd = !Utility.isNullOrEmpty(this.formulario.get('telefone').value) ? this.formulario.get('telefone').value?.toString().substring(0, 2) : null;
    this.rascunhoDevedor.contato.telefone = !Utility.isNullOrEmpty(this.formulario.get('telefone').value) ? this.formulario.get('telefone').value?.toString().substring(2) : null;
    this.rascunhoDevedor.contato.email = this.formulario.get('email').value;
  }

  private setValues(response: AtualizarRascunhoDevedorResponse) {
    this.formulario.get('nomeDoFinanciado').setValue(response.nomeDoFinanciado);
    this.formulario.get('tipoDocumento').setValue(Documento.convertToString(response.documento.tipoDocumento));
    this.formulario.get('logradouro').setValue(response.endereco.logradouro);
    this.formulario.get('numero').setValue(response.endereco.numero);
    this.formulario.get('cep').setValue(response.endereco.cep);
    this.formulario.get('complemento').setValue(response.endereco.complemento);
    this.formulario.get('bairro').setValue(response.endereco.bairro);
    this.formulario.get('municipio').setValue(response.endereco.municipio);
    this.formulario.get('uf').setValue(response.endereco.uf);
    this.formulario.get('telefone').setValue(response.contato.telefoneCompleto);
    this.formulario.get('email').setValue(response.contato.email);
    this.changeCep = false;

    Utility.waitFor(() => {
      this.formulario.get('documento').setValue(response.documento.numero);
      this.criarRascunhoDevedor();
    }, 2000)
  }

  private setDocumentValidator(tipoDocumento: string) {
    const documento = this.formulario.get('documento');
    documento.clearValidators();

    if (tipoDocumento == "cpf") { documento.setValidators(Validators.compose([Validators.required, Utility.isValidCpf()])); }
    else { documento.setValidators(Validators.compose([Validators.required, Utility.isValidCnpj()])); }

    documento.updateValueAndValidity();

    if (tipoDocumento == "cpf") {
      if (!Utility.isNullOrEmpty(documento.value)) {
        let valor = documento.value.toString();
        if (valor.length > 11) {
          let invalidChar = 11 - valor.length;
          valor = valor.slice(0, invalidChar);
        }
        documento.setValue(valor);
      }
    }
  }

  private setRetornoContrato(devedor) {
    this.changeCep = false; // para não alterar os campos quando carregar o CEP
    let telefone = (Utility.isNullOrEmpty(devedor.contato.ddd) ? null : devedor.contato.ddd) + (Utility.isNullOrEmpty(devedor.contato.telefone) ? null : devedor.contato.telefone)
    let valores = <AtualizarRascunhoDevedorResponse>{
      nomeDoFinanciado: devedor.nomeDoFinanciado,
      documento: <Documento>{ tipoDocumento: devedor.documento.tipoDocumento, numero: devedor.documento.numero },
      endereco: <Endereco>{
        logradouro: devedor.endereco.logradouro,
        numero: devedor.endereco.numero,
        bairro: devedor.endereco.bairro,
        cep: devedor.endereco.cep,
        municipio: devedor.endereco.municipio,
        uf: devedor.endereco.uf,
        complemento: devedor.endereco.complemento,
        codigoMunicipio: devedor.endereco.codigoMunicipio,
      },
      contato: <Contato>{
        telefoneCompleto: telefone == 0 ? null : telefone,
        email: devedor.contato.email
      }
    };

    this.setValues(valores);
  }

  private disableFields(tipoOperacao: TipoOperacao) {
    if (this.formulario === undefined) return;
    var fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'nomeDoFinanciado', enable: true },
      { field: 'tipoDocumento', enable: true },
      { field: 'documento', enable: true },
      { field: 'logradouro', enable: true },
      { field: 'numero', enable: true },
      { field: 'bairro', enable: true },
      { field: 'municipio', enable: true },
      { field: 'cep', enable: true },
      { field: 'complemento', enable: true },
      { field: 'uf', enable: true },
      { field: 'telefone', enable: true },
      { field: 'email', enable: true }];

    if (tipoOperacao == TipoOperacao.RegistrarContrato) {
      Utility.enableFields(this.formulario, fieldsConfig, this._ref);
      return;
    }

    if ((tipoOperacao == TipoOperacao.RegistrarAditivo || tipoOperacao == TipoOperacao.AlterarContrato) && (this.protocoloOrigem === null || this.protocoloOrigem === "0")) {
      Utility.waitFor(() => { Utility.enableFields(this.formulario, fieldsConfig, this._ref); }, 2000)
      return;
    }

    if (tipoOperacao == TipoOperacao.AlterarContrato) {
      Utility.enableFields(this.formulario, <ContratoCamposEditaveis[]>[{ field: 'tipoDocumento', enable: false }, { field: 'documento', enable: false }], this._ref)
      return;
    }

    if (tipoOperacao == TipoOperacao.AlterarAditivo) {
      Utility.enableFields(this.formulario, <ContratoCamposEditaveis[]>[{ field: 'tipoDocumento', enable: false }, { field: 'documento', enable: false }], this._ref)
      return;
    }

    this.disableFieldsByAditivo(this.tipoAditivo)
  }

  private disableFieldsByAditivo(tipoAditivo: string) {
    this.tipoAditivo = tipoAditivo;
    var fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'nomeDoFinanciado', enable: true },
      { field: 'tipoDocumento', enable: true },
      { field: 'documento', enable: true },
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

    if (this.protocoloOrigem === null || this.protocoloOrigem === "0") {
      Utility.enableFields(this.formulario, fieldsConfig, this._ref);
      return;
    }

    if (tipoAditivo == "TA_SUBSTITUICAO_GARANTIA") {
      fieldsConfig.find(config => config.field == 'tipoDocumento').enable = false;
      fieldsConfig.find(config => config.field == 'documento').enable = false;
    }
    else if (tipoAditivo == "TA_CESSAO_DIREITO_CREDOR") {
      fieldsConfig.find(config => config.field == 'tipoDocumento').enable = false;
      fieldsConfig.find(config => config.field == 'documento').enable = false;
    }

    Utility.enableFields(this.formulario, fieldsConfig, this._ref);
  }
}
