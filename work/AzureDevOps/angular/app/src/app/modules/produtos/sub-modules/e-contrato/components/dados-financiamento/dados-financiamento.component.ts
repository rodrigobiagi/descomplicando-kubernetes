import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
import { Consorcio } from '../../core/models/contratos/consorcio.model';
import { LiberacaoCredito } from '../../core/models/contratos/liberacao-credito.model';
import { Municipio } from '../../core/models/geograficos/municipio.model';
import { AtualizarRascunhoFinanciamentoRequest } from '../../core/requests/rascunhos/atualizar-rascunho-financiamento.request';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { MunicipioResponse } from '../../core/responses/geograficos/municipio.response';
import { AtualizarRascunhoFinanciamentoResponse } from '../../core/responses/rascunhos/atualizar-rascunho-financiamento.response';
import { GeograficoService } from '../../services/geografico.service';
import { RascunhoService } from '../../services/rascunho.service';
import { FORMATO_DATA } from '../../core/models/common/formato-dataPicker.model';
import { RegrasCamposPorEstado } from '../../core/models/contratos/regras-campos-por-estado.model';

import { Store } from '@ngrx/store';
import { debounceTime } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { GravameResponse } from '../../core/responses/contratos/gravame.response';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-dados-financiamento',
  templateUrl: './dados-financiamento.component.html',
  styleUrls: ['./dados-financiamento.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: FORMATO_DATA },
  ]
})

export class DadosFinanciamentoComponent implements OnInit, OnDestroy, IForm {

  timer: NodeJS.Timeout;

  formulario: FormGroup;
  rascunhoFinanciamento: AtualizarRascunhoFinanciamentoRequest = new AtualizarRascunhoFinanciamentoRequest();
  ufSelecionada: string;
  municipios: Municipio[] = [];
  municipiosFiltrados: Municipio[] = [];
  municipioSelecionado: Municipio = new Municipio();
  mode: Mode;
  tipoOperacao: TipoOperacao;
  idMunicipio: number = 0;
  private identifier: string = null;
  erroDataFinal: boolean = false;
  minDate: Date;
  maxDate: Date;
  uf: string;
  retornoGravame: GravameResponse;
  private subscriptions = new SubSink();
  private regrasCampos: RegrasCamposPorEstado[] = []

  ufsLicenciamento: string[];

  alreadySubmited: boolean = false;

  @Output() formChangedEvent = new EventEmitter<FormularioAlteradoEvent>();
  @Input('tipoOperacao') set setTipoOperacao(value) {
    if (value !== undefined) {
      this.tipoOperacao = value;
    }
  }
  @Input() contrato: ConsultarContratoResponse;
  @Input('retornoGravame') set setRetornoGravame(value) {
    if (value != null) {
      this.retornoGravame = value;
      if (value.codigo == 0) { this.setGravameDados(this.retornoGravame.dataVigenciaContrato); }
    }
  }

  constructor(private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private store: Store<{ infoLoading: IInfoLoadingState }>,
    private notifierService: NotifierService,
    private rascunhoService: RascunhoService,
    private geograficoService: GeograficoService,
    private _ref: ChangeDetectorRef) {

    this.identifier = this.activeRoute.snapshot.params['identifier'];

    this.activeRoute.queryParams
      .subscribe(params => {
        this.mode = params.mode as Mode
        this.uf = params.uf
      });

    this.maxDate = new Date();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDataForm();

    this.formulario.valueChanges
      .pipe(debounceTime(3000))
      .subscribe(() => this.submit());

    this.formulario.get('ufLiberacaoCredito').valueChanges
      .subscribe((value: string) => {
        if (!Utility.isNullOrEmpty(value)) {
          this.filtrarMunicipio(value)
          this.formulario.get('municipioLiberacaoCredito').enable()
        }
      });

    this.formulario.get('municipioLiberacaoCredito').valueChanges
      .subscribe((item: string) => this.filterData(item));

    this.carregarUfsLicenciamento();
  }

  ngAfterViewInit() {
    if (this.contrato !== undefined) {
      Utility.waitFor(() => {
        this.setRetornoContrato(this.contrato.financiamento);
        this._ref.detectChanges();
      }, 2000)
    }
  }

  initializeForm(): void {
    this.formulario = this.fb.group({
      valorTotalDivida: [null, Validators.required],
      valorParcela: [null, Validators.required],
      qtdeParcela: [null, Validators.required],
      dataVencimentoPrimeiraParcela: [null, Validators.required],
      dataVencimentoUltimaParcela: [null, Validators.required],
      dataLiberacaoCredito: [null, Validators.required],
      ufLiberacaoCredito: [null, Validators.required],
      municipioLiberacaoCredito: [null, Validators.required],
      cotaConsorcio: [null, Validators.maxLength(6)],
      numeroGrupo: [null]
    });

    if (this.uf) {
      this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.forEach(campo => {
        Utility.changeFieldValidators(this.formulario, campo, [Validators.required])
      })
    }

    this.formulario.get('municipioLiberacaoCredito').disable()
  }

  loadDataForm(): void {
    if (this.mode == Mode.Edit) {
      this.rascunhoService.obterRascunhoFinanciamento(this.identifier)
        .subscribe((response: AtualizarRascunhoFinanciamentoResponse) => this.setValues(response));
    }
  }

  submit(btnTrigger?: boolean): void {
    this.formChangedEvent.emit({
      isValid: this.formulario.valid,
      nomeFormularioRegitro: NomeFormularioRegistro.financiamento
    });

    if (this.formulario.valid) {
      if (!this.alreadySubmited || btnTrigger) {
        this.alreadySubmited = btnTrigger;
        if (!btnTrigger) { this.store.dispatch(startInfoLoading({ payload: 'Salvamento automático' })); }
        this.criarRascunhoFinanciamento();

        if (!Utility.isNullOrEmpty(this.identifier)) {
          this.rascunhoService.atualizarRascunhoFinanciamento(this.rascunhoFinanciamento, this.identifier)
            .subscribe((response: AtualizarRascunhoFinanciamentoResponse) => {

              if (!response.isSuccessful) {
                response.errors.forEach((error) => {
                  this.notifierService.showNotification(error.message, `${error.code}`, 'error');
                  if (error.message.includes('Municipio não localizado')) { this.formulario.get('municipioLiberacaoCredito').setErrors({ 'not-located': true }) }
                })
              }

            }, (error: ErrorMessage[]) => { this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error'); })

          Utility.waitFor(() => this.store.dispatch(stopInfoLoading()), 2000)
          return;
        }
      }
    }

    if (btnTrigger) { this.formulario.markAllAsTouched(); }
  }

  keypressNumber(event) {
    if (event.value.length >= event.maxLength) {
      event.value = event.value.slice(0, event.maxLength);
      this.formulario.get('qtdeParcela').setValue(event.value);
      return false;
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

  mudarObrigatoriedade(campo: string) {
    if (this.uf) {
      if (this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.filter(value => value === campo).length > 0) return true
    }
    return false
  }

  private criarRascunhoFinanciamento(): void {
    this.rascunhoFinanciamento.valorTotalDivida =
      this.formulario.get('valorTotalDivida').value ? parseFloat(this.formulario.get('valorTotalDivida').value).toFixed(2) : null;
    this.rascunhoFinanciamento.valorParcela =
      this.formulario.get('valorParcela').value ? parseFloat(this.formulario.get('valorParcela').value).toFixed(2) : null;
    this.rascunhoFinanciamento.quantidadeParcela =
      this.formulario.get('qtdeParcela').value ? this.formulario.get('qtdeParcela').value : null;
    this.rascunhoFinanciamento.dataVencimentoPrimeiraParcela =
      this.formulario.get('dataVencimentoPrimeiraParcela').value ? Utility.formatDate(this.formulario.get('dataVencimentoPrimeiraParcela').value) : null;
    this.rascunhoFinanciamento.dataVencimentoUltimaParcela =
      this.formulario.get('dataVencimentoUltimaParcela').value ? Utility.formatDate(this.formulario.get('dataVencimentoUltimaParcela').value) : null;
    this.rascunhoFinanciamento.liberacaoCredito.data =
      this.formulario.get('dataLiberacaoCredito').value ? Utility.formatDate(this.formulario.get('dataLiberacaoCredito').value) : null;
    this.rascunhoFinanciamento.liberacaoCredito.uf = this.formulario.get('ufLiberacaoCredito').value;
    this.rascunhoFinanciamento.municipioLiberacaoCredito = this.formulario.get('municipioLiberacaoCredito').value;
    this.rascunhoFinanciamento.consorcio.cota = this.formulario.get('cotaConsorcio').value;
    this.rascunhoFinanciamento.consorcio.grupo = this.formulario.get('numeroGrupo').value;
  }

  private setValues(response: AtualizarRascunhoFinanciamentoResponse) {
    this.formulario.get('valorTotalDivida').setValue(response.valorTotalDivida);
    this.formulario.get('valorParcela').setValue(response.valorParcela);
    this.formulario.get('qtdeParcela').setValue(response.quantidadeParcela);
    this.formulario.get('ufLiberacaoCredito').setValue(response.liberacaoCredito.uf);
    this.formulario.get('cotaConsorcio').setValue(response.consorcio.cota);
    this.formulario.get('numeroGrupo').setValue(response.consorcio.grupo);

    this.formulario.get('dataVencimentoPrimeiraParcela')
      .setValue(this.alteraFormatoData(response.dataVencimentoPrimeiraParcela))
    this.formulario.get('dataVencimentoUltimaParcela')
      .setValue(this.alteraFormatoData(response.dataVencimentoUltimaParcela));
    this.formulario.get('dataLiberacaoCredito')
      .setValue(this.alteraFormatoData(response.liberacaoCredito.data));

    if (response.municipioLiberacaoCredito != undefined) { this.formulario.get('municipioLiberacaoCredito').setValue(response.municipioLiberacaoCredito); }
  }

  private filtrarMunicipio(uf: string, valores: AtualizarRascunhoFinanciamentoResponse = null) {
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
          this.municipios = municipios.municipios;
          if (this.idMunicipio > 0 && valores != null) {
            valores.municipioLiberacaoCredito = this.municipios?.filter((item: Municipio) => { return item.id == this.idMunicipio })[0]?.nome;
          }
        })
    }
  }

  private filterData(value: string) {
    if (value != undefined) {
      const valueInput = value.toLocaleLowerCase()
      this.municipiosFiltrados = this.municipios?.filter((item: Municipio) => {
        return item.nome.toLowerCase().indexOf(valueInput) > -1
      })
    }
  }

  private setRetornoContrato(financiamento) {
    let valores = <AtualizarRascunhoFinanciamentoResponse>{
      valorTotalDivida: financiamento.valorTotalDivida,
      valorParcela: financiamento.valorParcela,
      quantidadeParcela: financiamento.quantidadeParcela,
      liberacaoCredito: <LiberacaoCredito>{
        uf: financiamento.liberacaoCredito.uf,
        data: financiamento.liberacaoCredito.data
      },
      consorcio: <Consorcio>{
        cota: financiamento.consorcio.cota,
        grupo: financiamento.consorcio.grupo
      },
      dataVencimentoPrimeiraParcela: financiamento.dataVencimentoPrimeiraParcela,
      dataVencimentoUltimaParcela: financiamento.dataVencimentoUltimaParcela,
    }

    this.idMunicipio = financiamento.idMunicipio;
    this.filtrarMunicipio(valores.liberacaoCredito.uf, valores);

    if (financiamento.idMunicipio != undefined) {
      Utility.watchCondition(this.timer, () => {
        if (valores.municipioLiberacaoCredito != undefined) {
          this.setValues(valores);
          return true;
        }
      }, 1000)
    }
    else { this.setValues(valores); }
  }

  verificaDatasParcelamento(data: any) {
    let data1
    let data2
    data1 = Utility.formatDate(this.formulario.get('dataVencimentoPrimeiraParcela').value)
    data2 = Utility.formatDate(data)

    if (data1 !== '' && data2 !== '') {
      const data1Split = data1.split('-')
      const data2Split = data2.split('-')
      const novaData1 = new Date(data1Split[2], data1Split[1] - 1, data1Split[0])
      const novaData2 = new Date(data2Split[2], data2Split[1] - 1, data2Split[0])

      if (novaData1.getTime() <= novaData2.getTime()) {
        this.erroDataFinal = false
      } else {
        this.erroDataFinal = true
        this.formulario.get('dataVencimentoUltimaParcela').setValue('')
      }
    }
  }

  private alteraFormatoData(data: string) {
    if (data == undefined) return;

    const diaMesAnoDataContrato = data.split('/')
    const novoModeloData = new Date(Number(diaMesAnoDataContrato[2]), Number(diaMesAnoDataContrato[1]) - 1, Number(diaMesAnoDataContrato[0]))

    return novoModeloData
  }

  private setGravameDados(dataGravame: string) {
    if (Utility.isNullOrEmpty(dataGravame)) return;

    Utility.waitFor(() => {
      if (!this.formulario.get('dataVencimentoUltimaParcela').disabled) { this.formulario.get('dataVencimentoUltimaParcela').setValue(new Date(+dataGravame.split('/')[2], (+dataGravame.split('/')[1] - 1), +dataGravame.split('/')[0])); }
    }, 3000);
  }

  setaDataMinima(data: any) {
    let data1
    data1 = Utility.formatDate(data)
    const data1Split = data1.split('-')
    this.minDate = new Date(data1Split[2], data1Split[1] - 1, data1Split[0])
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.identifier = null;
    this.idMunicipio = 0;
    this.store.dispatch(stopInfoLoading());
  }

  replaceSpecialChar() {
    let texto = this.formulario.get('municipioLiberacaoCredito').value;
    texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    this.formulario.controls['municipioLiberacaoCredito'].setValue(texto);
    return texto;
  }
}
