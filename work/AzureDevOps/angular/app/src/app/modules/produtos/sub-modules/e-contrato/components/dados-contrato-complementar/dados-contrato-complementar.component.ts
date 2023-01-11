import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { BooleanOption } from 'src/app/core/enums/boolean-option.enum';
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
import { AtualizarRascunhoComplementarRequest } from '../../core/requests/rascunhos/atualizar-rascunho-complementar.request';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { AtualizarRascunhoComplementarResponse } from '../../core/responses/rascunhos/atualizar-rascunho-complementar.response';
import { RascunhoService } from '../../services/rascunho.service';
import { RegrasCamposPorEstado } from '../../core/models/contratos/regras-campos-por-estado.model';

import { Store } from '@ngrx/store';
import { debounceTime } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-dados-contrato-complementar',
  templateUrl: './dados-contrato-complementar.component.html',
  styleUrls: ['./dados-contrato-complementar.component.scss']
})
export class DadosContratoComplementarComponent implements OnInit, OnDestroy, IForm {

  formulario: FormGroup;
  rascunhoComplementar: AtualizarRascunhoComplementarRequest = new AtualizarRascunhoComplementarRequest();
  mode: Mode;
  uf: string;
  alreadySubmited: boolean = false;
  private identifier: string = null;
  private subscriptions = new SubSink();
  private regrasCampos: RegrasCamposPorEstado[] = [];

  @Output() formChangedEvent = new EventEmitter<FormularioAlteradoEvent>();
  @Input('submitComplementar') set setTriggerSubmit(value) { if (value) this.submit(value) }
  @Input() contrato: ConsultarContratoResponse;

  constructor(private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private store: Store<{ infoLoading: IInfoLoadingState }>,
    private notifierService: NotifierService,
    private rascunhoService: RascunhoService,
    private ref: ChangeDetectorRef) {

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

    this.formulario.valueChanges
      .pipe(debounceTime(3000))
      .subscribe(() => this.submit());

    this.formulario.get('tipoDocumentoRecebedor').valueChanges
      .subscribe((tipoDocumentoRecebedor: string) => { this.setDocumentValidator(tipoDocumentoRecebedor, 'documentoRecebedor'); });

    this.formulario.get('tipoDocumentoVendedor').valueChanges
      .subscribe((tipoDocumentoVendedor: string) => { this.setDocumentValidator(tipoDocumentoVendedor, 'documentoVendedor'); });
  }

  ngAfterViewInit() {
    if (this.contrato != undefined) {
      Utility.waitFor(() => {
        this.setRetornoContrato(this.contrato.complementar);
        this.ref.detectChanges();
      }, 2000)
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.identifier = null;
    this.store.dispatch(stopInfoLoading());
  }

  initializeForm(): void {
    this.formulario = this.fb.group({
      taxaContrato: [{ value: 350, disabled: true }],
      taxaIof: ['000'],
      taxaJurosMes: ['000'],
      taxaJurosAno: ['000'],
      indice: [null, Validators.required],
      nomeRecebedorPagamento: [null],
      tipoDocumentoRecebedor: [TipoDocumento.Cpf],
      documentoRecebedor: [null, Validators.compose([Utility.isValidCpf()])],
      tipoDocumentoVendedor: [TipoDocumento.Cpf],
      documentoVendedor: [null, Validators.compose([Utility.isValidCpf()])],
      indicadorTaxaMora: [BooleanOption.NAO, Validators.required],
      valorTaxaMora: [{ value: '000', disabled: true }],
      indicadorTaxaMulta: [BooleanOption.NAO, Validators.required],
      valorTaxaMulta: [{ value: '000', disabled: true }],
      indicadorComissao: [BooleanOption.NAO, Validators.required],
      comissao: [{ value: '000', disabled: true }],
      indicadorPenalidade: [BooleanOption.NAO, Validators.required],
      penalidade: [{ value: 'CONFORME CLAUSULAS CONTRATUAIS', disabled: true }],
      comentario: [null, Validators.maxLength(1000)]
    });

    if (this.uf) {
      this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.forEach(campo => {
        Utility.changeFieldValidators(this.formulario, campo, [Validators.required])
      })
    }
  }

  loadDataForm(): void {
    if (this.mode == Mode.Edit) {

      this.rascunhoService.obterRascunhoComplementar(this.identifier)
        .subscribe((response: AtualizarRascunhoComplementarResponse) => this.setValues(response));
    }
  }

  submit(btnTrigger?: boolean): void {
    this.formChangedEvent.emit({
      isValid: this.formulario.valid,
      nomeFormularioRegitro: NomeFormularioRegistro.complemento
    });

    if (this.formulario.valid) {
      if (!this.alreadySubmited || btnTrigger) {
        this.alreadySubmited = btnTrigger;
        if (!btnTrigger) { this.store.dispatch(startInfoLoading({ payload: 'Salvamento automático' })); }
        this.criarRascunhoContratoComplementar();

        this.rascunhoService.atualizarRascunhoComplementar(this.rascunhoComplementar, this.identifier)
          .subscribe((response: AtualizarRascunhoComplementarResponse) => {

            if (!response.isSuccessful) {
              response.errors.forEach((error) => {
                this.notifierService.showNotification(error.message, `${error.code}`, 'error');
              })
            }
          }, (error: ErrorMessage[]) => { this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error') });

        Utility.waitFor(() => this.store.dispatch(stopInfoLoading()), 2000)
        return;
      }
    }

    if (btnTrigger) { this.formulario.markAllAsTouched(); }
  }

  mascaraDocumento(tipoDocumento: string): string {
    if (tipoDocumento == TipoDocumento.Cpf)
      return Documento.mascaraCPF();

    return Documento.mascaraCNPJ();
  }

  setValorPadrao(control: string, valor: string) {
    if (this.formulario.get(control).value == null || this.formulario.get(control).value == '') {
      this.formulario.get(control).setValue(valor);
    }
  }

  habilitarTaxaMora(value: string) {
    const valorTaxaMoraControl = this.formulario.get('valorTaxaMora')
    if (valorTaxaMoraControl !== null) valorTaxaMoraControl.clearValidators()

    if (value == BooleanOption.SIM) {
      valorTaxaMoraControl.setValidators(Validators.required);
      valorTaxaMoraControl.enable();
    } else {
      valorTaxaMoraControl.setValue('000');
      valorTaxaMoraControl.disable();
    }

    valorTaxaMoraControl.updateValueAndValidity();
  }

  habilitarTaxaMulta(value: string) {
    const valorTaxaMultaControl = this.formulario.get('valorTaxaMulta');
    if (valorTaxaMultaControl !== null) valorTaxaMultaControl.clearValidators();

    if (value == BooleanOption.SIM) {
      valorTaxaMultaControl.setValidators(Validators.required);
      valorTaxaMultaControl.enable();
    } else {
      valorTaxaMultaControl.setValue('000');
      valorTaxaMultaControl.disable();
    }

    valorTaxaMultaControl.updateValueAndValidity();
  }

  habilitarComissao(value: string) {
    const comissaoControl = this.formulario.get('comissao');
    comissaoControl.clearValidators();

    if (value == BooleanOption.SIM) {
      comissaoControl.setValidators(Validators.required);
      comissaoControl.enable();
    } else {
      comissaoControl.setValue('000');
      comissaoControl.disable();
    }

    comissaoControl.updateValueAndValidity();
  }

  habilitarPenalidade(value: string) {
    const penalidadeControl = this.formulario.get('penalidade');
    penalidadeControl.clearValidators();

    if (value == BooleanOption.SIM) {
      penalidadeControl.setValidators(Validators.required);
      penalidadeControl.enable();
    } else {
      penalidadeControl.setValue('CONFORME CLAUSULAS CONTRATUAIS');
      penalidadeControl.disable();
    }

    penalidadeControl.updateValueAndValidity();
  }

  mudarObrigatoriedade(campo: string) {
    if (this.uf) {
      if (this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.filter(value => value === campo).length > 0) { return true; }
    }
    return false;
  }

  private criarRascunhoContratoComplementar(): void {
    this.rascunhoComplementar.taxaContrato = this.uf === 'PR' ? this.formulario.get('taxaContrato').value.toString() : null;
    this.rascunhoComplementar.taxaIof = Utility.isNullOrEmpty(this.formulario.get('taxaIof').value) ? this.formulario.get('taxaIof').value : this.formulario.get('taxaIof').value.replace("%", '');
    this.rascunhoComplementar.taxaJurosMes = Utility.isNullOrEmpty(this.formulario.get('taxaJurosMes').value) ? this.formulario.get('taxaJurosMes').value : this.formulario.get('taxaJurosMes').value.replace("%", '');
    this.rascunhoComplementar.taxaJurosAno = Utility.isNullOrEmpty(this.formulario.get('taxaJurosAno').value) ? this.formulario.get('taxaJurosAno').value : this.formulario.get('taxaJurosAno').value.replace("%", '');
    this.rascunhoComplementar.indice = this.formulario.get('indice').value;
    this.rascunhoComplementar.nomeRecebedorPagamento = this.formulario.get('nomeRecebedorPagamento').value;
    this.rascunhoComplementar.indicadorTaxaMora = JSON.parse(this.formulario.get('indicadorTaxaMora').value);
    this.rascunhoComplementar.indicadorComissao = JSON.parse(this.formulario.get('indicadorComissao').value);
    this.rascunhoComplementar.indicadorTaxaMulta = JSON.parse(this.formulario.get('indicadorTaxaMulta').value);
    this.rascunhoComplementar.indicadorPenalidade = JSON.parse(this.formulario.get('indicadorPenalidade').value);
    this.rascunhoComplementar.documentoRecebedor.numero = this.formulario.get('documentoRecebedor').value;
    this.rascunhoComplementar.documentoRecebedor.tipoDocumento = Utility.isNullOrEmpty(this.formulario.get('documentoRecebedor').value) ? null : Documento.convertToNumber(this.formulario.get('tipoDocumentoRecebedor').value);
    this.rascunhoComplementar.documentoVendedor.numero = this.formulario.get('documentoVendedor').value;
    this.rascunhoComplementar.documentoVendedor.tipoDocumento = Utility.isNullOrEmpty(this.formulario.get('documentoVendedor').value) ? null : Documento.convertToNumber(this.formulario.get('tipoDocumentoVendedor').value);
    this.rascunhoComplementar.comentario = this.formulario.get('comentario').value;

    if (this.rascunhoComplementar.indicadorTaxaMora || this.uf === 'RJ') {
      this.rascunhoComplementar.valorTaxaMora = Utility.isNullOrEmpty(this.formulario.get('valorTaxaMora').value) ? this.formulario.get('valorTaxaMora').value : this.formulario.get('valorTaxaMora').value.replace("%", '');
    } else {
      this.rascunhoComplementar.valorTaxaMora = '000';
    }

    if (this.rascunhoComplementar.indicadorComissao || this.uf === 'RJ') {
      this.rascunhoComplementar.comissao = Utility.isNullOrEmpty(this.formulario.get('comissao').value) ? this.formulario.get('comissao').value : this.formulario.get('comissao').value.replace("%", '');
    } else {
      this.rascunhoComplementar.comissao = '000';
    }

    if (this.rascunhoComplementar.indicadorTaxaMulta) {
      this.rascunhoComplementar.valorTaxaMulta = Utility.isNullOrEmpty(this.formulario.get('valorTaxaMulta').value) ? this.formulario.get('valorTaxaMulta').value : this.formulario.get('valorTaxaMulta').value.replace("%", '');
    } else {
      this.rascunhoComplementar.valorTaxaMulta = '000';
    }

    if (this.rascunhoComplementar.indicadorPenalidade || this.uf === 'RJ') {
      this.rascunhoComplementar.penalidade = this.formulario.get('penalidade').value;
    } else {
      this.rascunhoComplementar.penalidade = 'CONFORME CLAUSULAS CONTRATUAIS';
    }
  }

  private setValues(response: AtualizarRascunhoComplementarResponse) {
    this.formulario.get('taxaIof').setValue(`${response.taxaIof == undefined ? '000' : (response.taxaIof == '0' ? '000' : response.taxaIof)}`);
    this.formulario.get('taxaContrato').setValue(`${this.uf === 'PR' ? "350" : response.taxaContrato}`);
    this.formulario.get('taxaJurosMes').setValue(`${response.taxaJurosMes == undefined ? '000' : (response.taxaJurosMes == '0' ? '000' : response.taxaJurosMes)}`);
    this.formulario.get('taxaJurosAno').setValue(`${response.taxaJurosAno == undefined ? '000' : (response.taxaJurosAno == '0' ? '000' : response.taxaJurosAno)}`);
    this.formulario.get('indice').setValue(response.indice);
    this.formulario.get('nomeRecebedorPagamento').setValue(response.nomeRecebedorPagamento == undefined ? '' : response.nomeRecebedorPagamento);
    this.formulario.get('tipoDocumentoRecebedor').setValue(Documento.convertToString(response.documentoRecebedor.tipoDocumento));
    this.formulario.get('tipoDocumentoVendedor').setValue(Documento.convertToString(response.documentoVendedor.tipoDocumento));
    this.formulario.get('indicadorTaxaMora').setValue(`${response.indicadorTaxaMora}`);
    this.formulario.get('valorTaxaMora').setValue(`${response.indicadorTaxaMora ? (response.valorTaxaMora == undefined ? '000' : response.valorTaxaMora) : '000'}`);
    this.formulario.get('indicadorTaxaMulta').setValue(`${response.indicadorTaxaMulta}`);
    this.formulario.get('valorTaxaMulta').setValue(`${response.indicadorTaxaMulta ? (response.valorTaxaMulta == undefined ? '000' : response.valorTaxaMulta) : '000'}`);
    this.formulario.get('indicadorComissao').setValue(`${response.indicadorComissao}`);
    this.formulario.get('comissao').setValue(`${response.indicadorComissao ? (response.comissao == undefined ? '000' : response.comissao) : '000'}`);
    this.formulario.get('indicadorPenalidade').setValue(`${response.indicadorPenalidade}`);
    this.formulario.get('penalidade').setValue(response.indicadorPenalidade ? response.penalidade : 'CONFORME CLAUSULAS CONTRATUAIS');
    this.formulario.get('comentario').setValue(response.comentario == undefined ? '' : response.comentario);

    if (response.indicadorTaxaMora) { this.formulario.get('valorTaxaMora').enable(); }
    else { this.formulario.get('indicadorTaxaMora').setValue(BooleanOption.NAO) }

    if (response.indicadorTaxaMulta) { this.formulario.get('valorTaxaMulta').enable(); }
    else { this.formulario.get('indicadorTaxaMulta').setValue(BooleanOption.NAO) }

    if (response.indicadorComissao) { this.formulario.get('comissao').enable(); }
    else { this.formulario.get('indicadorComissao').setValue(BooleanOption.NAO) }

    if (response.indicadorPenalidade) { this.formulario.get('penalidade').enable(); }
    else { this.formulario.get('indicadorPenalidade').setValue(BooleanOption.NAO) }

    Utility.waitFor(() => {
      this.formulario.get('documentoRecebedor').setValue(response.documentoRecebedor.numero == undefined ? '' : response.documentoRecebedor.numero);
      this.formulario.get('documentoVendedor').setValue(response.documentoVendedor.numero == undefined ? '' : response.documentoVendedor.numero);
    }, 2000)
  }

  private setDocumentValidator(tipoDocumento: string, control: string) {
    const documento = this.formulario.get(control);
    documento.clearValidators();

    if (tipoDocumento == "cpf") { documento.setValidators(Validators.compose([Utility.isValidCpf()])); }
    else { documento.setValidators(Validators.compose([Utility.isValidCnpj()])); }

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

  private setRetornoContrato(complementar) {
    let valores = <AtualizarRascunhoComplementarResponse>{
      taxaContrato: complementar.taxaContrato,
      taxaIof: complementar.taxaIof,
      taxaJurosMes: complementar.taxaJurosMes,
      taxaJurosAno: complementar.taxaJurosAno,
      indice: complementar.indice,
      nomeRecebedorPagamento: complementar.nomeRecebedorPagamento,
      documentoRecebedor: <Documento>{
        tipoDocumento: complementar.documentoRecebedor.tipoDocumento == 0 ? 1 : complementar.documentoRecebedor.tipoDocumento,
        numero: complementar.documentoRecebedor.numero == null ? '' : complementar.documentoRecebedor.numero
      },
      documentoVendedor: <Documento>{
        tipoDocumento: complementar.documentoVendedor.tipoDocumento == 0 ? 1 : complementar.documentoVendedor.tipoDocumento,
        numero: complementar.documentoVendedor.numero == null ? '' : complementar.documentoVendedor.numero
      },
      indicadorTaxaMora: complementar.indicadorTaxaMora,
      valorTaxaMora: Utility.isNullOrEmpty(complementar.valorTaxaMora) ? '000' : complementar.valorTaxaMora,
      indicadorTaxaMulta: complementar.indicadorTaxaMulta,
      valorTaxaMulta: Utility.isNullOrEmpty(complementar.valorTaxaMulta) ? '000' : complementar.valorTaxaMulta,
      indicadorComissao: complementar.indicadorComissao,
      comissao: Utility.isNullOrEmpty(complementar.comissao) ? '000' : complementar.comissao,
      indicadorPenalidade: complementar.indicadorPenalidade,
      penalidade: Utility.isNullOrEmpty(complementar.penalidade) ? 'CONFORME CLAUSULAS CONTRATUAIS' : complementar.penalidade,
      comentario: complementar.comentario
    };

    this.setValues(valores);
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
