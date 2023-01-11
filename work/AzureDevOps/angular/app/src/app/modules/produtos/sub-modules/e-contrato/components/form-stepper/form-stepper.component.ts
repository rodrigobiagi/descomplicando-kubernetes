import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { BooleanOption } from 'src/app/core/enums/boolean-option.enum';
import { Mode } from 'src/app/core/enums/mode.enum';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { SubSink } from 'subsink';
import { NomeFormularioRegistro } from '../../core/enums/tipo-formulario-registro.enum';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { FormularioAlteradoEvent } from '../../core/events/formulario-alterado.event';
import { Municipio } from '../../core/models/geograficos/municipio.model';
import { AtualizarRascunhoComplementarRequest } from '../../core/requests/rascunhos/atualizar-rascunho-complementar.request';
import { AtualizarRascunhoContratoRequest } from '../../core/requests/rascunhos/atualizar-rascunho-contrato.request';
import { AtualizarRascunhoCredorRequest } from '../../core/requests/rascunhos/atualizar-rascunho-credor.request';
import { AtualizarRascunhoDevedorRequest } from '../../core/requests/rascunhos/atualizar-rascunho-develodr.request';
import { AtualizarRascunhoFinanciamentoRequest } from '../../core/requests/rascunhos/atualizar-rascunho-financiamento.request';
import { AtualizarRascunhoVeiculoRequest } from '../../core/requests/rascunhos/atualizar-rascunho-veiculo.request';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { GravameResponse } from '../../core/responses/contratos/gravame.response';
import { MunicipioResponse } from '../../core/responses/geograficos/municipio.response';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';
import { ContratoService } from '../../services/contrato.service';
import { GeograficoService } from '../../services/geografico.service';
import { RascunhoService } from '../../services/rascunho.service';
import { DadosContratoComponent } from '../dados-contrato/dados-contrato.component';
import { DadosDevedorComponent } from '../dados-devedor/dados-devedor.component';
import { stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';
import { AgenteFinanceiro } from '../../core/models/contratos/agente-financeiro.model';
import { RevisarRegistroComponent } from '../../pages/revisar-registro/revisar-registro.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { DadosVeiculoComponent } from '../dados-veiculo/dados-veiculo.component';
import { DadosFinanciamentoComponent } from '../dados-financiamento/dados-financiamento.component';
import { DadosCredorComponent } from '../dados-credor/dados-credor.component';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';

@Component({
  selector: 'app-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrls: ['./form-stepper.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class FormStepperComponent implements OnInit, OnDestroy {

  @ViewChild(MatStepper) stepper: MatStepper;
  @ViewChild(DadosVeiculoComponent) dadosVeiculo: DadosVeiculoComponent;
  @ViewChild(DadosContratoComponent) dadosContrato: DadosContratoComponent;
  @ViewChild(DadosFinanciamentoComponent) dadosFinanciamento: DadosFinanciamentoComponent;
  @ViewChild(DadosCredorComponent) dadosCredor: DadosCredorComponent;
  @ViewChild(DadosDevedorComponent) dadosDevedor: DadosDevedorComponent;
  @ViewChild(RevisarRegistroComponent) revisar: RevisarRegistroComponent;

  timer: NodeJS.Timeout;
  timerMunicipios: NodeJS.Timeout;
  timerAgenteFinanceiro: NodeJS.Timeout;
  private subscriptions = new SubSink();
  formulario: FormGroup;
  etapaAtual: number = 0;
  formIsValid: boolean = false;
  percentualConclusao: number = 5;
  contrato: ConsultarContratoResponse;
  formulariosValidos: NomeFormularioRegistro[] = [];
  fomularioValidado$ = new Subject();
  formVeiculoCompleted = false;
  formContratoCompleted = false;
  formFinanciamentoCompleted = false;
  formCredorCompleted = false;
  formDevedorCompleted = false;
  formTerceiroGarantidorCompleted = false;
  mode: Mode;
  uf: string;
  agenteFinanceiro: AgenteFinanceiro = null;
  private identifier: string = null;

  blocoInformacoes = {
    dadosVeiculo: {
      id: 'dados-veiculo',
      titulo: 'Adicionar dados do veículo',
      descricao: 'Adicione todos os detalhes essenciais sobre o(s) veículo(s) para poder prosseguir.',
      icone: './../../../../assets/img/e-contrato/icon-dados-veiculo.png',
      enviarRegistro: false,
    },
    dadosContrato: {
      id: 'dados-contrato',
      titulo: 'Adicionar dados do contrato',
      descricao: 'Adicione todos os detalhes essenciais sobre o contrato para poder prosseguir.',
      icone: './../../../../assets/img/e-contrato/icon-dados-contrato.png',
      enviarRegistro: false,
    },
    dadosFinanciamento: {
      id: 'dados-financiamento',
      titulo: 'Adicionar dados do financiamento',
      descricao: 'Adicione todos os detalhes essenciais sobre o financiamento para poder prosseguir.',
      icone: './../../../../assets/img/e-contrato/icon-dados-financiamento.png',
      enviarRegistro: false,
    },
    dadosCredor: {
      id: 'dados-credor',
      titulo: 'Adicionar dados do credor',
      descricao: 'Adicione todos os detalhes essenciais sobre o credor para poder prosseguir.',
      icone: './../../../../assets/img/e-contrato/icon-dados-credor.png',
      enviarRegistro: false,
    },
    dadosDevedor: {
      id: 'dados-devedor',
      titulo: 'Adicionar dados do devedor',
      descricao: 'Adicione todos os detalhes essenciais sobre o devedor para poder prosseguir.',
      icone: './../../../../assets/img/e-contrato/icon-dados-devedor.png',
      enviarRegistro: false,
    },
    revisao: {
      id: 'revisao',
      titulo: 'Revise as informações',
      descricao: 'Confira se todas as informações ao lado estão corretas antes de clicar em enviar registro',
      icone: './../../../../assets/img/e-contrato/icon-revisao.png',
      enviarRegistro: true
    },
  };

  @Input() tipoOperacao: TipoOperacao;
  @Input() retornoGravame: GravameResponse;
  @Input() ehFrota: boolean;

  submitLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private contratoService: ContratoService,
    private store: Store<{ preloader: IPreloaderState }>,
    private rascunhoService: RascunhoService,
    private geograficoService: GeograficoService,
    private agenteFinanceiroService: AgenteFinanceiroService
  ) {
    this.identifier = this.activeRoute.snapshot.params['identifier'];

    this.activeRoute.queryParams.subscribe(params => {
      this.mode = params.mode as Mode
      this.uf = params.uf
    });
  }

  ngOnInit(): void {
    this.initializeForm()

    this.subscriptions.add(
      this.fomularioValidado$.subscribe(() => this.checkStatusForm()),
      this.contratoService.contrato$.subscribe(contrato => {
        if (contrato != undefined) {
          this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));
          this.contrato = contrato;

          this.submitRascunhos();
          Utility.watchCondition(this.timer, () => {
            if (this.tipoOperacao) {
              if (this.formVeiculoCompleted) {
                this.store.dispatch(closePreloader());
                return true;
              }
            }
          }, 1000)
        }
        else this.contrato = undefined
      })
    );

    if (this.mode == Mode.Edit) {
      this.store.dispatch(showPreloader({ payload: 'Por favor aguarde um momento, estamos processando as informações' }));
      Utility.waitFor(() => { this.store.dispatch(closePreloader()); }, 5000);
    }

    this.agenteFinanceiroService.agenteFinanceiros$.subscribe(agentes => this.agenteFinanceiro = agentes);
  }

  irParaEtapa(etapa: number) {
    if (etapa == 0) {
      this.etapaAtual = etapa;
      return;
    }

    if (etapa == 1) {
      this.verificaEtapa(etapa, NomeFormularioRegistro.veiculo, this.dadosVeiculo);
      return;
    }

    if (etapa == 2) {
      this.verificaEtapa(etapa, NomeFormularioRegistro.contrato, this.dadosContrato);
      return;
    }

    if (etapa == 3) {
      this.verificaEtapa(etapa, NomeFormularioRegistro.financiamento, this.dadosFinanciamento);
      return;
    }

    if (etapa == 4) {
      this.verificaEtapa(etapa, NomeFormularioRegistro.credor, this.dadosCredor);
      return;
    }

    if (etapa == 5) {
      this.verificaEtapa(etapa, NomeFormularioRegistro.devedor, this.dadosDevedor);
      return;
    }
  }

  verificaEtapa(etapa: number, form: string, component: any) {
    component.submit(true);

    this.submitLoading = true;

    Utility.waitFor(() => {
      this.submitLoading = false;
      if (this.obtemFormValidacao(form)) {
        this.etapaSucesso(etapa);
        return;
      }
    }, 1000);
    return;
  }

  private obtemFormValidacao(form: string): boolean {
    if (NomeFormularioRegistro.contrato != form) {
      return JSON.parse(this.formulario.get(form).value);
    }

    return JSON.parse(this.formulario.get(form).value) && JSON.parse(this.formulario.get(NomeFormularioRegistro.complemento).value);
  }

  etapaSucesso(etapa: number) {
    this.etapaAtual = etapa;
    this.stepper.selectedIndex = etapa;
  }

  revisarRegistro() {
    if (this.formIsValid) {
      this.activeRoute.params.subscribe(params => {
        let urlOperacao =
          this.tipoOperacao == TipoOperacao.RegistrarContrato ? 'registrar-contrato' :
            (this.tipoOperacao == TipoOperacao.AlterarContrato ? 'alterar-contrato' :
              (this.tipoOperacao == TipoOperacao.RegistrarAditivo ? 'registrar-aditivo' : 'alterar-aditivo'))

        this.router.navigate([`/produtos/e-contrato/registro-contrato/${urlOperacao}/revisar-registro/${params.identifier}`])
      });

      return
    }

    this.dadosDevedor.submit(true);
  }

  onFormChanged(event: FormularioAlteradoEvent) {
    this.formulario.get(event.nomeFormularioRegitro).setValue(`${event.isValid}`)
    this.fomularioValidado$.next();
    this.atualizarPercentualPrenchimento(event.nomeFormularioRegitro, `${event.isValid}`)
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
      formTerceiroGarantidor: [BooleanOption.SIM]
    })
  }

  private checkStatusForm() {
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

    this.formVeiculoCompleted = formVeiculoIsValid;
    this.formContratoCompleted = formContratoIsValid && formComplementoIsValid;
    this.formFinanciamentoCompleted = formFinanciamentoIsValid;
    this.formCredorCompleted = formCredorIsValid;
    this.formDevedorCompleted = formDevedorIsValid;
    this.formTerceiroGarantidorCompleted = formTerceiroGarantidorIsValid;

    this.formIsValid =
      formVeiculoIsValid &&
      formContratoIsValid &&
      formComplementoIsValid &&
      formFinanciamentoIsValid &&
      formCredorIsValid &&
      formDevedorIsValid &&
      formTerceiroGarantidorIsValid
  }

  atualizarPercentualPrenchimento(formName: NomeFormularioRegistro, isValid: string) {

    const index: number = this.formulariosValidos.indexOf(formName);
    const valid: boolean = JSON.parse(isValid);
    let percentual: number = 0;

    if (valid) {
      if (index == -1) {
        this.formulariosValidos.push(formName)
      }

    } else {
      if (index > -1) {
        this.formulariosValidos.splice(index, 1)
      }
    }

    this.formulariosValidos.forEach((value: NomeFormularioRegistro, i: number) => {
      percentual += 15;
    })

    if (percentual > 0) {
      this.percentualConclusao = percentual;
    }
  }

  corSpinner() {
    if (this.percentualConclusao < 33) {
      return 'percentual-preenchimento-spinner-low';
    } else if (this.percentualConclusao >= 33 && this.percentualConclusao <= 66) {
      return 'percentual-preenchimento-spinner-medium';
    } else {
      return 'percentual-preenchimento-spinner-high';
    }

  }

  submitRascunhos() {
    this.criarRascunhoVeiculo();
    this.criarRascunhoContrato();
    this.criarRascunhoComplemento();
    this.criarRascunhoFinanciamento();
    this.criarRascunhoDevedor();
    this.criarRascunhoCredor();
  }

  private criarRascunhoVeiculo(): void {
    let atualizarRascunhoVeiculoRequest = <AtualizarRascunhoVeiculoRequest>{
      veiculos: this.contrato.veiculo
    }

    this.rascunhoService.atualizarRascunhoVeiculo(atualizarRascunhoVeiculoRequest, this.identifier).toPromise();
  }

  private criarRascunhoContrato(): void {
    let atualizarRascunhoContratoRequest = <AtualizarRascunhoContratoRequest>{
      gravame: {
        numeroRestricao: this.contrato.contrato.numeroRestricao,
        tipoRestricao: this.contrato.contrato.tipoRestricao
      },
      dataContrato: this.contrato.contrato.dataContrato,
      aditivo: {
        numero: this.contrato.contrato.numeroAditivo,
        data: this.contrato.contrato.dataAditivo,
        tipoAditivo: this.contrato.contrato.tipoAditivo
      },
      numeroTaxaDetran: this.contrato.contrato.taxaDetran.numero
    }

    this.rascunhoService.atualizarRascunhoContrato(atualizarRascunhoContratoRequest, this.identifier).toPromise();
  }

  private criarRascunhoComplemento(): void {
    let atualizarRascunhoComplementarRequest = <AtualizarRascunhoComplementarRequest>{
      taxaContrato: this.contrato.complementar.taxaContrato?.toString(),
      taxaIof: this.contrato.complementar.taxaIof?.toString(),
      taxaJurosMes: this.contrato.complementar.taxaJurosMes?.toString(),
      taxaJurosAno: this.contrato.complementar.taxaJurosAno?.toString(),
      indice: this.contrato.complementar.indice,
      nomeRecebedorPagamento: this.contrato.complementar.nomeRecebedorPagamento,
      indicadorTaxaMora: this.contrato.complementar.indicadorTaxaMora,
      valorTaxaMora: this.contrato.complementar.valorTaxaMora?.toString(),
      indicadorTaxaMulta: this.contrato.complementar.indicadorTaxaMulta,
      valorTaxaMulta: this.contrato.complementar.valorTaxaMulta?.toString(),
      indicadorPenalidade: this.contrato.complementar.indicadorPenalidade,
      penalidade: this.contrato.complementar.penalidade,
      documentoRecebedor: {
        tipoDocumento: this.contrato.complementar.documentoRecebedor.tipoDocumento,
        numero: this.contrato.complementar.documentoRecebedor.numero
      },
      documentoVendedor: {
        tipoDocumento: this.contrato.complementar.documentoVendedor.tipoDocumento,
        numero: this.contrato.complementar.documentoVendedor.numero
      },
      comentario: this.contrato.complementar.comentario,
      indicadorComissao: this.contrato.complementar.indicadorComissao,
      comissao: this.contrato.complementar.comissao?.toString()
    };

    this.rascunhoService.atualizarRascunhoComplementar(atualizarRascunhoComplementarRequest, this.identifier).toPromise();
  }

  private criarRascunhoFinanciamento(): void {
    let atualizarRascunhoFinanciamentoResquest = <AtualizarRascunhoFinanciamentoRequest>{
      valorTotalDivida: this.contrato.financiamento.valorTotalDivida?.toString(),
      valorParcela: this.contrato.financiamento.valorParcela?.toString(),
      quantidadeParcela: this.contrato.financiamento.quantidadeParcela,
      dataVencimentoPrimeiraParcela: this.contrato.financiamento.dataVencimentoPrimeiraParcela,
      dataVencimentoUltimaParcela: this.contrato.financiamento.dataVencimentoUltimaParcela,
      liberacaoCredito: {
        uf: this.contrato.financiamento.liberacaoCredito.uf,
        data: this.contrato.financiamento.liberacaoCredito.data
      },
      consorcio: {
        cota: this.contrato.financiamento.consorcio.cota,
        grupo: this.contrato.financiamento.consorcio.grupo
      }
    }

    this.filtrarMunicipio(this.contrato.financiamento.idMunicipio, this.contrato.financiamento.liberacaoCredito.uf, atualizarRascunhoFinanciamentoResquest);

    Utility.watchCondition(this.timerMunicipios, () => {
      if (atualizarRascunhoFinanciamentoResquest.municipioLiberacaoCredito != null) {
        this.rascunhoService.atualizarRascunhoFinanciamento(atualizarRascunhoFinanciamentoResquest, this.identifier).toPromise();
        return true;
      }
    }, 1000);

  }

  private criarRascunhoDevedor(): void {
    let atualizarRascunhoDevedor = <AtualizarRascunhoDevedorRequest>{
      documento: {
        tipoDocumento: this.contrato.devedor.documento.tipoDocumento,
        numero: this.contrato.devedor.documento.numero
      },
      nomeDoFinanciado: this.contrato.devedor.nomeDoFinanciado,
      endereco: {
        cep: this.contrato.devedor.endereco.cep,
        logradouro: this.contrato.devedor.endereco.logradouro,
        numero: this.contrato.devedor.endereco.numero,
        bairro: this.contrato.devedor.endereco.bairro,
        complemento: this.contrato.devedor.endereco.complemento,
        uf: this.contrato.devedor.endereco.uf,
        municipio: this.contrato.devedor.endereco.municipio
      },
      contato: {
        ddd: this.contrato.devedor.contato.ddd,
        telefone: this.contrato.devedor.contato.telefone,
        email: this.contrato.devedor.contato.email,
        telefoneCompleto: this.contrato.devedor.contato.telefoneCompleto
      }
    }

    this.rascunhoService.atualizarRascunhoDevedor(atualizarRascunhoDevedor, this.identifier).toPromise();
  }

  private criarRascunhoCredor(): void {
    let atualizarRascunhoCredorRequest = <AtualizarRascunhoCredorRequest>{
      agenteFinanceiro: {
        documento: {
          numero: this.contrato.credor.documento.numero,
          tipoDocumento: this.contrato.credor.documento.tipoDocumento
        },
        codigoAgenteFinanceiro: this.contrato.credor.codigoAgenteFinanceiro,
        nomeAgenteFinanceiro: this.contrato.credor.nomeAgenteFinanceiro
      },
      endereco: {
        cep: this.contrato.credor.endereco.cep,
        logradouro: this.contrato.credor.endereco.logradouro,
        numero: this.contrato.credor.endereco.numero,
        bairro: this.contrato.credor.endereco.bairro,
        complemento: this.contrato.credor.endereco.complemento,
        uf: this.contrato.credor.endereco.uf,
        municipio: this.contrato.credor.endereco.municipio,
        codigoMunicipio: this.contrato.credor.endereco.codigoMunicipio
      },
      contato: {
        ddd: this.contrato.credor.contato.ddd,
        telefone: this.contrato.credor.contato.telefone,
        email: this.contrato.credor.contato.email,
        telefoneCompleto: this.contrato.credor.contato.telefoneCompleto
      }
    }

    Utility.watchCondition(this.timerAgenteFinanceiro, () => {
      this.carregarAgenteFinanceiro(this.contrato.credor.documento.numero, atualizarRascunhoCredorRequest);
      if (atualizarRascunhoCredorRequest.agenteFinanceiro.id != null) {
        this.rascunhoService.atualizarRascunhoCredor(atualizarRascunhoCredorRequest, this.identifier).toPromise();
        return true;
      }
    }, 1000);
  }

  private filtrarMunicipio(idMunicipio: number, uf: string, valores: AtualizarRascunhoFinanciamentoRequest): void {
    if (uf != undefined) {
      this.geograficoService.obterMunicipiosPorUf(uf)
        .subscribe((municipios: MunicipioResponse) => {
          let cidades = municipios.municipios;
          valores.municipioLiberacaoCredito = cidades?.filter((item: Municipio) => { return item.id == idMunicipio })[0]?.nome;
        })
    }
  }

  private carregarAgenteFinanceiro(cnpj: string, valores: AtualizarRascunhoCredorRequest): void {
    if (cnpj !== this.agenteFinanceiro.documento?.numero) return null;

    valores.agenteFinanceiro.id = this.agenteFinanceiro.id;
  }

  enviarRegistro() {
    this.revisar.enviarRegistro();
  }

  editarEtapa(etapa: number) {
    this.stepper.selectedIndex = etapa;
    this.etapaAtual = etapa;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
