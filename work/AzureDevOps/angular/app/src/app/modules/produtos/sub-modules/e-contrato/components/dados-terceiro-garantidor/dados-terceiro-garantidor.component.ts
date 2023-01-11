import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { Mode } from 'src/app/core/enums/mode.enum';
import { TipoDocumento } from 'src/app/core/enums/tipo-documento.enum';
import { IForm } from 'src/app/core/forms/form';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { startInfoLoading, stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { NomeFormularioRegistro } from '../../core/enums/tipo-formulario-registro.enum';
import { FormularioAlteradoEvent } from '../../core/events/formulario-alterado.event';
import { Documento } from '../../core/models/common/documento.model';
import { EnderecoResponse } from '../../core/responses/geograficos/endereco.response';
import { AtualizarRascunhoTerceiroGarantidorRequest } from '../../core/requests/rascunhos/atualizar-rascunho-terceiro-garantidor.request';
import { AtualizarRascunhoTerceiroGarantidorResponse } from '../../core/responses/rascunhos/atualizar-rascunho-terceiro-garantidor.response';
import { GeograficoService } from '../../services/geografico.service';
import { RascunhoService } from '../../services/rascunho.service';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';

import { SubSink } from 'subsink';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-dados-terceiro-garantidor',
  templateUrl: './dados-terceiro-garantidor.component.html',
  styleUrls: ['./dados-terceiro-garantidor.component.scss']
})
export class DadosTerceiroGarantidorComponent implements OnInit, OnDestroy, IForm {

  formulario: FormGroup;
  identifier: string = null;
  rascunhoTerceiroGarantidor: AtualizarRascunhoTerceiroGarantidorRequest = new AtualizarRascunhoTerceiroGarantidorRequest();
  mode: Mode;
  loading: boolean = false;
  tipoOperacao: TipoOperacao;
  cep$ = new Subject<string>();
  uf: string;
  ufsLicenciamento: string[];
  private subscriptions = new SubSink();
  private changeCep: boolean = true;

  @Output() formChangedEvent = new EventEmitter<FormularioAlteradoEvent>();
  @Input('tipoOperacao') set setTipoOperacao(value) {
    if (value !== undefined) {
      this.tipoOperacao = value;
    }
  }
  @Input() contrato: ConsultarContratoResponse;

  constructor(private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private store: Store<{ infoLoading: IInfoLoadingState }>,
    private notifierService: NotifierService,
    private rascunhoService: RascunhoService,
    private geograficoService: GeograficoService) {

    this.identifier = this.activeRoute.snapshot.params['identifier'];

    this.activeRoute.queryParams
      .subscribe(params => {
        this.mode = params.mode as Mode
        this.uf = params.uf
      });
  }

  ngOnInit(): void {
    this.initializeForm();
    // this.loadDataForm();
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
        this.changeCep = true
      }));
  }

  initializeForm(): void {
    this.formulario = this.fb.group({
      nomeTerceiroGarantidor: [null, Validators.maxLength(30)],
      tipoDocumento: [TipoDocumento.Cpf],
      documento: [null, Validators.compose([Utility.isValidCpf(), Validators.maxLength(14)])],
      logradouro: [null, Validators.maxLength(40)],
      numero: [null, Validators.maxLength(9)],
      bairro: [null, Validators.maxLength(20)],
      municipio: [null, Validators.maxLength(30)],
      cep: [null, Validators.maxLength(9)],
      complemento: [null, Validators.maxLength(20)],
      uf: [null],
      telefone: [null, Validators.maxLength(40)],
      email: [null, Validators.maxLength(14)]
    });
  }

  loadDataForm(): void {
    if (this.mode == Mode.Edit) {
      this.rascunhoService.obterRascunhoTerceiroGarantidor(this.identifier)
        .subscribe((response: AtualizarRascunhoTerceiroGarantidorResponse) => this.setValues(response));
    }
  }

  submit(btnTrigger?: boolean): void {
    this.formChangedEvent.emit({
      isValid: this.formulario.valid,
      nomeFormularioRegitro: NomeFormularioRegistro.terceiroGarantidor
    });

    if (this.formulario.valid) {

      this.store.dispatch(startInfoLoading({ payload: 'Salvamento automático' }));
      this.criarRascunhoTerceiroGarantidor();

      if (!Utility.isNullOrEmpty(this.identifier)) {
        // this.rascunhoService.atualizarRascunhoTerceiroGarantidor(this.rascunhoTerceiroGarantidor, this.identifier)
        //   .subscribe((response: AtualizarRascunhoTerceiroGarantidorResponse) => {

        //     if (!response.isSuccessful) {
        //       response.errors.forEach((error) => {
        //         this.notifierService.showNotification(error.message, `${error.code}`, 'error');
        //       })
        //     }
        //   }, (error: ErrorMessage[]) => { this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error'); })

        Utility.waitFor(() => this.store.dispatch(stopInfoLoading()), 2000);
      }
    }

    if (btnTrigger) this.formulario.markAllAsTouched()
  }

  obterEnderecoPorCep(cep: string) {

    if (cep == undefined)
      return;

    this.loading = true;

    this.geograficoService.obterEnderecoPorCep(cep)
      .subscribe((endereco: EnderecoResponse) => {
        this.formulario.get('logradouro').setValue(endereco.endereco.logradouro);
        this.formulario.get('bairro').setValue(endereco.endereco.bairro);
        this.formulario.get('municipio').setValue(endereco.endereco.municipio);
        this.formulario.get('uf').setValue(endereco.endereco.uf);
        this.loading = false;
      });
  }

  mascaraDocumento(tipoDocumento: string): string {

    if (tipoDocumento == TipoDocumento.Cpf)
      return Documento.mascaraCPF();

    return Documento.mascaraCNPJ();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.identifier = null;
    this.store.dispatch(stopInfoLoading());
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }

  private criarRascunhoTerceiroGarantidor() {
    this.rascunhoTerceiroGarantidor.nomeTerceiroGarantidor = this.formulario.get('nomeTerceiroGarantidor').value;
    this.rascunhoTerceiroGarantidor.documento.tipoDocumento = Documento.convertToNumber(this.formulario.get('tipoDocumento').value);
    this.rascunhoTerceiroGarantidor.documento.numero = this.formulario.get('documento').value;
    this.rascunhoTerceiroGarantidor.endereco.cep = this.formulario.get('cep').value;
    this.rascunhoTerceiroGarantidor.endereco.logradouro = this.formulario.get('logradouro').value;
    this.rascunhoTerceiroGarantidor.endereco.numero = this.formulario.get('numero').value;
    this.rascunhoTerceiroGarantidor.endereco.bairro = this.formulario.get('bairro').value;
    this.rascunhoTerceiroGarantidor.endereco.complemento = this.formulario.get('complemento').value;
    this.rascunhoTerceiroGarantidor.endereco.uf = this.formulario.get('uf').value;
    this.rascunhoTerceiroGarantidor.endereco.municipio = this.formulario.get('municipio').value;
    this.rascunhoTerceiroGarantidor.contato.ddd = this.formulario.get('telefone').value?.toString().substring(0, 2);
    this.rascunhoTerceiroGarantidor.contato.telefone = this.formulario.get('telefone').value?.toString().substring(2);
    this.rascunhoTerceiroGarantidor.contato.email = this.formulario.get('email').value;
  }

  private setValues(response: AtualizarRascunhoTerceiroGarantidorResponse) {
    this.formulario.get('nomeTerceiroGarantidor').setValue(response.nomeTerceiroGarantidor);
    this.formulario.get('tipoDocumento').setValue(Documento.convertToString(response.documento.tipoDocumento));
    this.formulario.get('documento').setValue(response.documento.numero);
    this.formulario.get('logradouro').setValue(response.endereco.logradouro);
    this.formulario.get('numero').setValue(response.endereco.numero);
    this.formulario.get('cep').setValue(response.endereco.cep);
    this.formulario.get('complemento').setValue(response.endereco.complemento);
    this.formulario.get('bairro').setValue(response.endereco.bairro);
    this.formulario.get('municipio').setValue(response.endereco.municipio);
    this.formulario.get('uf').setValue(response.endereco.uf);
    this.formulario.get('telefone').setValue(response.contato.telefoneCompleto);
    this.formulario.get('email').setValue(response.contato.email);
  }
}
