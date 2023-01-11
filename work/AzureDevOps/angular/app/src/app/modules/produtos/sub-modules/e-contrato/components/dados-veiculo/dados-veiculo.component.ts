import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { BooleanOption } from 'src/app/core/enums/boolean-option.enum';
import { Mode } from 'src/app/core/enums/mode.enum';
import { TipoOperacao } from '../../core/enums/tipo-operacao.enum';
import { IForm } from 'src/app/core/forms/form';
import { RangeValidator } from 'src/app/core/forms/validators/range.validator';
import { ErrorMessage } from 'src/app/core/responses/error-message';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { startInfoLoading, stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';
import { IInfoLoadingState } from 'src/app/shared/store/info-loading/info-loading.reducer';
import { NomeFormularioRegistro } from '../../core/enums/tipo-formulario-registro.enum';
import { FormularioAlteradoEvent } from '../../core/events/formulario-alterado.event';
import { AtualizarRascunhoVeiculoRequest } from '../../core/requests/rascunhos/atualizar-rascunho-veiculo.request';
import { ConsultarContratoResponse } from '../../core/responses/contratos/consultar-contrato.response';
import { AtualizarRascunhoVeiculoResponse } from '../../core/responses/rascunhos/atualizar-rascunho-veiculo.response';
import { RascunhoService } from '../../services/rascunho.service';
import { AditivoService } from '../../services/aditivo.service';
import { ContratoCamposEditaveis } from '../../core/models/contratos/contrato-campos-editaveis.model';
import { ContratoService } from '../../services/contrato.service';
import { RegrasCamposPorEstado } from '../../core/models/contratos/regras-campos-por-estado.model';
import { GeograficoService } from '../../services/geografico.service';
import { GravameResponse } from '../../core/responses/contratos/gravame.response';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';
import { ObterAgentesFinanceirosResponse } from '../../core/responses/_backoffice/agentes-financeiros/obter-agentes-financeiros.response';
import { BackofficeService } from '../../services/_backoffice/_backoffice.service';
import { Marcas } from '../../core/models/veiculos/marcas.model';
import { AgenteFinanceiro } from '../../core/models/contratos/agente-financeiro.model';
import { Modelos } from '../../core/models/veiculos/modelos.model';
import { Cores } from '../../core/models/veiculos/cores.model';
import { ObterMarcasResponse } from '../../core/responses/_backoffice/veiculos/obter-marcas.response';
import { ObterModelosResponse } from '../../core/responses/_backoffice/veiculos/obter-modelos.response';
import { ObterCoresResponse } from '../../core/responses/_backoffice/veiculos/obter-cores.response';
import { ObterEspeciesResponse } from '../../core/responses/_backoffice/veiculos/obter-especies.response';
import { Especies } from '../../core/models/veiculos/especies.model';

import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { Especie } from '../../core/models/veiculos/especie.model';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogAddVeiculoComponent } from '../dialog-add-veiculo/dialog-add-veiculo.component';
import { Veiculo } from '../../core/models/contratos/veiculo.model';
import { DadosVeiculoListComponent } from '../dados-veiculo-list/dados-veiculo-list.component';
import { ObterRascunhoResumoResponse } from '../../core/responses/rascunhos/obter-rascunho-resumo.response';
import { DialogCommonComponent } from '../dialog-common/dialog-common.component';

@Component({
  selector: 'app-dados-veiculo',
  templateUrl: './dados-veiculo.component.html',
  styleUrls: ['./dados-veiculo.component.scss']
})
export class DadosVeiculoComponent implements OnInit, OnDestroy, IForm {

  formulario: FormGroup;
  rascunhoVeiculo: AtualizarRascunhoVeiculoRequest = new AtualizarRascunhoVeiculoRequest();
  marcasVeiculo: Marcas[] = [];
  marcasVeiculoFiltrados: Marcas[] = [];
  modelosVeiculo: Modelos[] = [];
  modelosVeiculoFiltrados: Modelos[] = [];
  especiesVeiculo: Especies[] = [];
  especiesVeiculoFiltrados: any[] = [];
  coresVeiculo: Cores[] = [];
  coresVeiculoFiltrados: Cores[] = [];
  mode: Mode;
  tipoOperacao: TipoOperacao;
  retornoGravame: GravameResponse;
  tipoAditivo: string;
  protocoloOrigem: string = null;
  ufsLicenciamento: string[];
  uf: string;
  loading: boolean = false;
  timer: NodeJS.Timeout;

  ehFrota: boolean;
  veiculosList: Veiculo[] = [];
  setVeiculosList: string = null;
  substituicaoGarantia: boolean = false;

  alreadySubmited: boolean = false;

  private identifier: string = null;
  private subscriptions = new SubSink();
  private veiculoEmplacado: boolean = null;
  private agenteFinanceiro: ObterAgentesFinanceirosResponse = new ObterAgentesFinanceirosResponse();

  private regrasCampos: RegrasCamposPorEstado[] = [
    {
      uf: 'RJ',
      camposObrigatorios: ['marca', 'modelo', 'cor', 'especie']
    }
  ]

  @Input() contrato: ConsultarContratoResponse;
  @Input() formID: string = null;
  @Input('ehFrota') set setEhFrota(value) { this.ehFrota = value; }
  @Input('carregarVeiculo') set carregarVeiculo(value) { if (value) { this.carregarVeiculoFrota(value); } }
  @Input('aditivo') set setAditivo(value) { if (value) { this.substituicaoGarantia = value; } }
  @Input('tipoOperacao') set setTipoOperacao(value) {
    if (value !== undefined) {
      this.tipoOperacao = value;
      this.disableFields(value);
    }
  }

  @Input('retornoGravame') set setRetornoGravame(value) {
    if (value != null) {
      this.retornoGravame = value;
      if (value.codigo == 0) { this.setGravameDados(this.retornoGravame); }
    }
  }
  @Output() formChangedEvent = new EventEmitter<FormularioAlteradoEvent>();
  @Output() addVeiculo = new EventEmitter<Veiculo>();
  @Output() numeroRestricao = new EventEmitter<number>();

  constructor(
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store<{ infoLoading: IInfoLoadingState }>,
    private rascunhoService: RascunhoService,
    private _ref: ChangeDetectorRef,
    private aditivoService: AditivoService,
    private contratoService: ContratoService,
    private geograficoService: GeograficoService,
    private agenteFinanceiroService: AgenteFinanceiroService,
    private backofficeService: BackofficeService,
    private dialog: MatDialog,
  ) {

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
      .subscribe(() => {
        if (!this.formID) this.submit()
      });

    this.formulario.get('marca').valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500)
      )
      .subscribe((item: string) => {
        this.filterData(item, 'marca')
      });

    this.formulario.get('modelo').valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500)
      )
      .subscribe((item: string) => this.filterData(item, 'modelo'));

    this.formulario.get('cor').valueChanges
      .subscribe((item: string) => this.filterData(item, 'cor'));

    this.aditivoService.tipoAditivo$.subscribe(tipoAditivo => {
      if (!this.formID) {
        this.tipoAditivo = tipoAditivo;
        this.disableFields(this.tipoOperacao)
      }
    });

    this.contratoService.protocoloOrigem$.subscribe(protocoloOrigem => { this.protocoloOrigem = protocoloOrigem; });
    this.agenteFinanceiroService.agenteFinanceiros$.subscribe(agentes => { this.carregarAgentesFinanceiros(agentes); });
  }

  refreshValidator() {
    let anoFabricacao = this.formulario.get('anoFabricacao').value;
    let anoModelo = this.formulario.get('anoModelo').value;

    if (anoModelo) {
      Utility.waitFor(() => {
        Utility.changeFieldValidators(this.formulario, 'anoFabricacao', [RangeValidator.range(anoModelo - 1, anoModelo)]);
        Utility.changeFieldValidators(this.formulario, 'anoModelo', [RangeValidator.range(anoFabricacao, anoFabricacao + 1)]);

        this.formulario.get('anoFabricacao').markAsTouched();
        this.formulario.get('anoModelo').markAsTouched();
      }, 5000);
    }
  }

  ngAfterViewInit() {
    if (this.contrato !== undefined) {
      Utility.waitFor(() => {
        this.setValues(<AtualizarRascunhoVeiculoResponse>{ veiculo: this.contrato.veiculo }, true);
        this.disableFields(this.tipoOperacao)
        this._ref.detectChanges();
      }, 2000)
    }
  }

  initializeForm(): void {

    this.formulario = this.fb.group({
      id: [null],
      chassi: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(21)])],
      renavam: [null, Validators.maxLength(11)],
      numeroRestricao: [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(8)])],
      placa: [null, Validators.compose([Validators.minLength(5), Validators.maxLength(7)])],
      ufPlaca: [null],
      anoFabricacao: [null, Validators.compose([Validators.required, RangeValidator.range(1971, 2999)])],
      anoModelo: [null, Validators.compose([Validators.required, RangeValidator.range(1971, 2999)])],
      remarcado: [BooleanOption.NAO],
      marca: [null],
      modelo: [{ value: null, disabled: true }],
      emplacado: [BooleanOption.NAO],
      especie: [null],
      cor: [null]
    });

    this.carregaMarcasVeiculo()
    this.carregaCoresVeiculos()
    this.carregaEspecieVeiculos()

    if (this.uf) {
      this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.forEach(campo => {
        Utility.changeFieldValidators(this.formulario, campo, [Validators.required])
      })
    }

    if (this.formID) {
      this.formulario.valueChanges.subscribe(value => {
        if (this.formulario.invalid) {
          this.addVeiculo.emit(null);
          return;
        }

        value.podeEditar = this.formulario.get('numeroRestricao').status !== "DISABLED";
        this.addVeiculo.emit(value);
        this.numeroRestricao.emit(this.formulario.get('numeroRestricao').value);
      })
    }
  }

  loadDataForm(): void {

    this.alteraObrigatoriedadeCampos(`${BooleanOption.NAO}`)

    if ((this.mode == Mode.Create && this.contrato === undefined) || this.formID) {
      this.formulario.get('anoFabricacao').patchValue(Utility.currentYear());
      this.formulario.get('anoModelo').patchValue(Utility.currentYear());
    }

    if (this.mode == Mode.Edit && !this.formID) {
      this.rascunhoService.obterRascunhoVeiculo(this.identifier)
        .subscribe((response: AtualizarRascunhoVeiculoResponse) => {
          this.setValues(response)
          this.disableFields(this.tipoOperacao)
        });
    }
  }

  submit(btnTrigger?: boolean): void {
    this.formChangedEvent.emit({
      isValid: this.formulario.valid || (this.formulario.status == "DISABLED" && this.veiculosList.length > 0),
      nomeFormularioRegitro: NomeFormularioRegistro.veiculo
    });

    if (this.formulario.valid || (this.formulario.status == "DISABLED" && this.veiculosList.length > 0)) {
      if (!this.alreadySubmited || btnTrigger) {
        this.alreadySubmited = btnTrigger;
        if (!btnTrigger) { this.store.dispatch(startInfoLoading({ payload: 'Salvamento automático' })); }
        this.criarRascunhoVeiculo();

        if (!Utility.isNullOrEmpty(this.identifier)) {
          this.rascunhoService.atualizarRascunhoVeiculo(this.rascunhoVeiculo, this.identifier)
            .subscribe((response: AtualizarRascunhoVeiculoResponse) => {
              this.veiculosList = response.veiculo;
              this.contratoService.retornoVeiculosAdicionados(this.veiculosList);

              if (!response.isSuccessful) {
                response.errors.forEach((error) => {
                  this.notifierService.showNotification(error.message, `${error.code}`, 'error');
                })
              }
            }, (error: ErrorMessage[]) => { this.notifierService.showNotification('Um erro interno aconteceu', 'Falha interna', 'error') });

          Utility.waitFor(() => this.store.dispatch(stopInfoLoading()), 2000);
          return;
        }
      }
    }

    if (btnTrigger) { this.formulario.markAllAsTouched(); }
  }

  alteraObrigatoriedadeCampos(value: string) {
    if (value === 'true') {
      this.formulario.get('placa').enable()
      this.formulario.get('placa').setValidators(Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(7)]))
      this.formulario.get('placa').updateValueAndValidity()
      this.formulario.get('ufPlaca').enable()
      this.formulario.get('ufPlaca').setValidators(Validators.required)
      this.formulario.get('ufPlaca').updateValueAndValidity()
      this.formulario.get('renavam').enable()
      this.formulario.get('renavam').setValidators(Validators.compose([Validators.maxLength(11), Validators.required]))
      this.formulario.get('renavam').updateValueAndValidity()
    } else {
      this.formulario.get('placa').setValue(null)
      this.formulario.get('placa').disable()
      this.formulario.get('placa').clearValidators()
      this.formulario.get('ufPlaca').setValue(null)
      this.formulario.get('ufPlaca').disable()
      this.formulario.get('ufPlaca').clearValidators()
      this.formulario.get('renavam').setValue(null)
      this.formulario.get('renavam').disable()
      this.formulario.get('renavam').clearValidators()
    }
  }

  mudarObrigatoriedade(campo: string) {
    if (this.uf) {
      if (this.regrasCampos.filter(value => value.uf === this.uf)[0]?.camposObrigatorios.filter(value => value === campo).length > 0) return true
    }
    return false
  }

  consultarGravame(chassi) {
    if (!chassi) return;

    if (this.uf == 'SP') {
      if (chassi.length >= 5) {
        this.loading = true;
        this.contratoService.consultarGravame(this.uf, chassi).toPromise();
        Utility.waitFor(() => { this.loading = false; }, 5000);
      }
    }
  }

  adicionarVeiculo() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { adicionado: false };
    const dialogRef = this.dialog.open(DialogAddVeiculoComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(veiculo => {
      if (veiculo) {
        if (!dialogConfig.data.veiculo) {
          if (this.veiculosList.filter(v => v.chassi == veiculo.chassi).length > 0) {
            const dialogOpen = this.dialog.open(DialogCommonComponent, {
              data: {
                title: 'Chassi já cadastrado nesse contrato',
                text: '',
                buttonConfirm: {
                  value: true,
                  text: 'Ok'
                },
                buttonCancel: {
                  value: false,
                  text: 'Cancelar',
                },
              }
            });

            dialogOpen.afterClosed().subscribe(confirmacao => {
              if (confirmacao) { this.adicionarVeiculo(); }
            })

            return;
          }
        }

        this.veiculosList.push(<Veiculo>{
          chassi: veiculo.chassi,
          placa: veiculo.placa,
          ufPlaca: veiculo.ufPlaca,
          anoFabricacao: veiculo.anoFabricacao,
          anoModelo: veiculo.anoModelo,
          renavam: veiculo.renavam,
          numeroRestricao: veiculo.numeroRestricao,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          emplacado: veiculo.emplacado,
          remarcado: veiculo.emplacado,
          especie: veiculo.especie,
          cor: veiculo.cor,
          podeEditar: veiculo.podeEditar
        });
        if (!dialogConfig.data.veiculo) { this.veiculoIncluido(); }
        this.atualizaVeiculosList();
      }
    });
  }

  veiculoIncluido() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { adicionado: true };
    const dialogRef = this.dialog.open(DialogAddVeiculoComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(proximo => {
      if (proximo) { this.adicionarVeiculo(); }
    });
  }

  editarVeiculo(id: number) {
    let veiculo = this.veiculosList.filter(veiculo => veiculo.id == id)[0];

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { adicionado: false, veiculo: veiculo, aditivo: this.substituicaoGarantia };
    const dialogRef = this.dialog.open(DialogAddVeiculoComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(veiculoEditado => {
      if (veiculoEditado) {
        this.atualizarVeiculosLista(id, veiculoEditado);
        this.carregarVeiculoFrota(this.veiculosList[0]);
        this.atualizaVeiculosList();
      }
    });
  }

  atualizarVeiculosLista(id: number, veiculo: Veiculo) {
    let index = this.veiculosList.indexOf(this.veiculosList.filter(veiculo => veiculo.id == id)[0]);
    if (~index) { this.veiculosList[index] = veiculo; }
  }

  removerVeiculo(id: number) {
    let index = this.veiculosList.indexOf(this.veiculosList.filter(veiculo => veiculo.id == id)[0]);
    this.rascunhoService.removerVeiculoRascunho(this.identifier, { "veiculoId": id }).toPromise();
    this.veiculosList.splice(index, 1);

    if (this.veiculosList.length == 0) this.formulario.reset();
    else { this.carregarVeiculoFrota(this.veiculosList[0]); }

    Utility.waitFor(() => {
      this.atualizaVeiculosList();
    }, 1000);
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    if (this.formID) nomeElemento = `${this.formID}_${nomeElemento}`;
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => {
      this.ufsLicenciamento = ufs.sigla;
    })
  }

  private atualizaVeiculosList() {
    this.contratoService.retornoVeiculosAdicionados(this.veiculosList);
    this.rascunhoVeiculo.veiculos = this.veiculosList;
    if (this.veiculosList.length > 0) {
      this.rascunhoService.atualizarRascunhoVeiculo(this.rascunhoVeiculo, this.identifier)
        .subscribe((response: AtualizarRascunhoVeiculoResponse) => {
          this.veiculosList = response.veiculo;
          this.contratoService.retornoVeiculosAdicionados(this.veiculosList);
          this.carregarVeiculoFrota(this.veiculosList[0]);
        });
    }
  }

  private criarRascunhoVeiculo(): void {
    let veiculo = <Veiculo>{
      chassi: this.formulario.get('chassi').value,
      placa: this.formulario.get('placa').value,
      ufPlaca: this.formulario.get('ufPlaca').value,
      anoFabricacao: Number(this.formulario.get('anoFabricacao').value),
      anoModelo: Number(this.formulario.get('anoModelo').value),
      remarcado: this.formulario.get('remarcado').value == "true",
      renavam: this.formulario.get('renavam').value ? this.formulario.get('renavam').value.toString() : null,
      numeroRestricao: Number(this.formulario.get('numeroRestricao').value) == 0 ? null : Number(this.formulario.get('numeroRestricao').value),
      emplacado: this.formulario.get('emplacado').value == "true",
      marca: this.formulario.get('marca').value,
      modelo: this.formulario.get('modelo').value,
      especie: Number(this.formulario.get('especie').value) == 0 ? null : Number(this.formulario.get('especie').value),
      cor: this.formulario.get('cor').value,
      podeEditar: this.formulario.get('numeroRestricao').status !== "DISABLED"
    };

    let veiculoIncluido = this.veiculosList.filter(v => v.numeroRestricao == veiculo.numeroRestricao)[0];

    if (veiculoIncluido) { this.atualizarVeiculosLista(veiculoIncluido.id, veiculo); }
    else { this.veiculosList.push(veiculo); }

    this.contratoService.retornoVeiculosAdicionados(this.veiculosList);
    this.rascunhoVeiculo.veiculos = this.veiculosList;
  }

  private setValues(response: AtualizarRascunhoVeiculoResponse, retornoContrato: boolean = false) {
    if (retornoContrato) { this.atualizarRascunhoSetValues(response.veiculo); }

    if (this.ehFrota == null || this.ehFrota == undefined) {
      this.rascunhoService.obterRascunhoResumo(this.identifier).subscribe((result: ObterRascunhoResumoResponse) => {
        this.ehFrota = result.rascunho.ehFrota;
        if (this.ehFrota) {
          this.veiculosList = response.veiculo;
          if (response.veiculo.length > 0) { this.carregarVeiculoFrota(response.veiculo[0]); }
          this.contratoService.retornoVeiculosAdicionados(this.veiculosList);
          return;
        }
      });
    }

    if (this.ehFrota || response.veiculo.length > 1) {
      this.veiculosList = response.veiculo;
      if (response.veiculo.length > 0) { this.carregarVeiculoFrota(response.veiculo[0]); }
      this.contratoService.retornoVeiculosAdicionados(this.veiculosList);
      return;
    }

    let veiculo = response.veiculo[0];

    if (veiculo) {
      this.formulario.get('id').setValue(veiculo.id);
      this.formulario.get('chassi').setValue(veiculo.chassi);
      this.formulario.get('placa').setValue(veiculo.placa);
      this.formulario.get('ufPlaca').setValue(veiculo.ufPlaca);
      this.formulario.get('anoFabricacao').setValue(veiculo.anoFabricacao);
      this.formulario.get('anoModelo').setValue(veiculo.anoModelo);
      this.formulario.get('remarcado').setValue(`${veiculo.remarcado}`);
      this.formulario.get('renavam').setValue(veiculo.renavam);
      this.formulario.get('numeroRestricao').setValue(veiculo.numeroRestricao);
      this.formulario.get('emplacado').setValue(`${veiculo.emplacado}`);
      this.formulario.get('marca').setValue(veiculo.marca);
      this.formulario.get('modelo').setValue(veiculo.modelo);
      this.formulario.get('especie').setValue(veiculo.especie);
      this.formulario.get('cor').setValue(veiculo.cor);

      if (veiculo.remarcado == undefined)
        this.formulario.get('remarcado').setValue(BooleanOption.NAO)

      if (veiculo.emplacado == undefined)
        this.formulario.get('emplacado').setValue(BooleanOption.NAO)

      if (this.rascunhoVeiculo.veiculos && this.tipoOperacao !== TipoOperacao.RegistrarContrato) {
        this.rascunhoVeiculo.veiculos[0].chassi = veiculo.chassi;

        if (this.tipoOperacao == TipoOperacao.AlterarContrato) {
          this.rascunhoVeiculo.veiculos[0].remarcado = veiculo.remarcado;
        }
      }

      if (veiculo.chassi) { this.consultarGravame(veiculo.chassi) }

      if (veiculo.modelo) this.formulario.get('modelo').enable();

      if (veiculo.marca) {
        Utility.waitFor(() => {
          let marcaId = this.marcasVeiculo?.filter((item: Marcas) => { return item.nome.indexOf(veiculo.marca) > -1 });

          if (marcaId.length > 0) {
            this.carregaModelosVeiculos(marcaId[0].id)

            if (veiculo.modelo) {
              Utility.watchCondition(this.timer, () => {
                if (this.modelosVeiculo.length > 0) {
                  let modeloId = this.modelosVeiculo?.filter((item: Modelos) => { return item.nome.indexOf(veiculo.modelo) > -1 })

                  if (modeloId.length > 0) {
                    this.carregaEspecieVeiculos(modeloId[0].especieId)
                    this.formulario.get('modelo').enable()
                  }
                  return true;
                }
              }, 1000)
            }
          }
        }, 2000);
      }

      this.alteraObrigatoriedadeCampos(`${veiculo.emplacado}`)

      if (!veiculo.podeEditar) this.desabilitarForm();
    }
  }

  atualizarRascunhoSetValues(veiculos: Veiculo[]) {
    let list = [];
    veiculos.forEach(v => {
      list.push({
        chassi: v.chassi,
        placa: v.placa,
        ufPlaca: v.ufPlaca,
        anoFabricacao: v.anoFabricacao,
        anoModelo: v.anoModelo,
        renavam: v.renavam,
        numeroRestricao: v.numeroRestricao,
        marca: v.marca,
        modelo: v.modelo,
        emplacado: v.emplacado,
        remarcado: v.emplacado,
        especie: v.especie,
        cor: v.cor,
        podeEditar: v.podeEditar
      })
    });

    this.veiculosList = list;
    this.rascunhoVeiculo.veiculos = this.veiculosList;
    this.rascunhoService.atualizarRascunhoVeiculo(this.rascunhoVeiculo, this.identifier)
      .subscribe((response: AtualizarRascunhoVeiculoResponse) => {
        this.veiculosList = response.veiculo;
        this.contratoService.retornoVeiculosAdicionados(this.veiculosList);
        this.carregarVeiculoFrota(this.veiculosList[0]);
      });
  }

  private carregaMarcasVeiculo() {
    this.backofficeService.obterMarcasVeiculos()
      .subscribe((response: ObterMarcasResponse) => {
        if (response.isSuccessful) {
          response.marcas.forEach((marca: Marcas) => {
            this.marcasVeiculo.push(marca)
          });
        }
      });
  }

  private carregaModelosVeiculos(marcaId: number) {
    this.backofficeService.obterModelosVeiculos(marcaId)
      .subscribe((response: ObterModelosResponse) => {
        if (response.isSuccessful) {
          response.modelos.forEach((marca: Modelos) => {
            this.modelosVeiculo.push(marca)
          });
          this.formulario.get('modelo').enable()
        }
      })
  }

  private carregaEspecieVeiculos(especieId: number = null) {
    this.backofficeService.obterEspecieVeiculos()
      .subscribe((response: ObterEspeciesResponse) => {
        if (response.isSuccessful) {
          let setEspecie
          this.especiesVeiculo = [];
          this.especiesVeiculo = response.especies;
          if (especieId) {
            setEspecie = this.especiesVeiculo.filter((item: Especie) => { return item.id == especieId })
            this.formulario?.get('especie').setValue(setEspecie[0].id);
          }
        }
        this.formulario.get('especie').enable()
      })
  }

  private carregaCoresVeiculos() {
    this.backofficeService.obterCoresVeiculos()
      .subscribe((response: ObterCoresResponse) => {
        if (response.isSuccessful) {
          response.cores.forEach((marca: Modelos) => {
            this.coresVeiculo.push(marca)
          });
        }
      })
  }

  desabilitarForm() {
    var fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'chassi', enable: false },
      { field: 'renavam', enable: false },
      { field: 'numeroRestricao', enable: false },
      { field: 'placa', enable: false },
      { field: 'ufPlaca', enable: false },
      { field: 'anoFabricacao', enable: false },
      { field: 'anoModelo', enable: false },
      { field: 'remarcado', enable: false },
      { field: 'marca', enable: false },
      { field: 'modelo', enable: false },
      { field: 'especie', enable: false },
      { field: 'emplacado', enable: false },
      { field: 'cor', enable: false }
    ];

    Utility.enableFields(this.formulario, fieldsConfig, this._ref)
    return;
  }

  private disableFields(tipoOperacao: TipoOperacao) {
    if (this.formulario === undefined) return;
    var fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'chassi', enable: true },
      { field: 'renavam', enable: true },
      { field: 'numeroRestricao', enable: true },
      { field: 'placa', enable: true },
      { field: 'ufPlaca', enable: true },
      { field: 'anoFabricacao', enable: true },
      { field: 'anoModelo', enable: true },
      { field: 'remarcado', enable: true },
      { field: 'marca', enable: true },
      { field: 'emplacado', enable: true },
      { field: 'cor', enable: true }
    ];

    if (tipoOperacao == TipoOperacao.RegistrarContrato || ((tipoOperacao == TipoOperacao.RegistrarAditivo || tipoOperacao == TipoOperacao.AlterarContrato) && (this.protocoloOrigem === null || this.protocoloOrigem === "0"))) {
      fieldsConfig.find(config => config.field == "renavam").enable = this.formulario.get('emplacado').value == 'true';
      fieldsConfig.find(config => config.field == "placa").enable = this.formulario.get('emplacado').value == 'true';
      fieldsConfig.find(config => config.field == "ufPlaca").enable = this.formulario.get('emplacado').value == 'true';
      Utility.enableFields(this.formulario, fieldsConfig, this._ref)
      return;
    }

    if (tipoOperacao !== TipoOperacao.AlterarAditivo) { this.consultarVeiculo(this.tipoAditivo) }

    if (tipoOperacao == TipoOperacao.AlterarContrato) {
      Utility.enableFields(this.formulario, <ContratoCamposEditaveis[]>[
        { field: 'chassi', enable: false },
        { field: 'remarcado', enable: false },
        { field: 'numeroRestricao', enable: false }
      ], this._ref)
    }

    if (tipoOperacao == TipoOperacao.AlterarAditivo) {
      fieldsConfig.find(config => config.field === 'chassi').enable = false
      fieldsConfig.find(config => config.field === 'renavam').enable = false
      fieldsConfig.find(config => config.field === 'emplacado').enable = false
      fieldsConfig.find(config => config.field === 'remarcado').enable = false
      fieldsConfig.find(config => config.field === 'numeroRestricao').enable = false
      fieldsConfig.find(config => config.field === 'ufPlaca').enable = false
      fieldsConfig.find(config => config.field === 'placa').enable = false
      Utility.enableFields(this.formulario, fieldsConfig, this._ref)
    }
  }

  private consultarVeiculo(tipoAditivo) {
    if (this.protocoloOrigem !== null && this.protocoloOrigem !== "0") {
      if (this.mode === Mode.Edit && this.veiculoEmplacado === null) {
        this.contratoService.consultarContratoVeiculo(this.protocoloOrigem).subscribe(value => {
          this.veiculoEmplacado = value.veiculo.emplacado
        });
      }
    }

    this.disableFieldsByAditivo(tipoAditivo, this.formulario.get('emplacado').value == 'true');
  }

  private disableFieldsByAditivo(tipoAditivo: string, emplacado: boolean = false) {
    this.tipoAditivo = tipoAditivo;
    let fieldsConfig: ContratoCamposEditaveis[] = <ContratoCamposEditaveis[]>[
      { field: 'chassi', enable: false },
      { field: 'renavam', enable: emplacado },
      { field: 'placa', enable: emplacado },
      { field: 'ufPlaca', enable: emplacado },
      { field: 'anoFabricacao', enable: true },
      { field: 'anoModelo', enable: true },
      { field: 'remarcado', enable: this.tipoOperacao !== TipoOperacao.AlterarAditivo },
      { field: 'numeroRestricao', enable: false },
      { field: 'marca', enable: true },
      { field: 'modelo', enable: true },
      { field: 'emplacado', enable: (this.protocoloOrigem !== null && this.protocoloOrigem !== "0") ? !emplacado : true },
      { field: 'especie', enable: true },
      { field: 'cor', enable: true }
    ];

    if ((this.protocoloOrigem === null || this.protocoloOrigem === "0") || this.tipoOperacao === TipoOperacao.AlterarAditivo) {
      Utility.enableFields(this.formulario, fieldsConfig, this._ref);
      return;
    }

    this.substituicaoGarantia = tipoAditivo == "TA_SUBSTITUICAO_GARANTIA";

    if (tipoAditivo == "TA_SUBSTITUICAO_GARANTIA") {
      fieldsConfig.find(config => config.field == 'chassi').enable = true;
      fieldsConfig.find(config => config.field == 'numeroRestricao').enable = false;
    }
    if (tipoAditivo == "TA_CESSAO_DIREITO_CREDOR") {
      const formGroup = this.formulario.controls;
      fieldsConfig.find(config => config.field == 'numeroRestricao').enable = false;
      Object.keys(formGroup).forEach(control => {
        var enable = false;
        if (control == 'remarcado' || (control == 'emplacado' && !emplacado)) { enable = true; }
        fieldsConfig.push({ field: control, enable: enable });
      });
    }
    else if (tipoAditivo == "TA_CESSAO_DIREITO_DEVEDOR") {
      const formGroup = this.formulario.controls;
      fieldsConfig.find(config => config.field == 'numeroRestricao').enable = false;
      Object.keys(formGroup).forEach(control => {
        var enable = false;
        if (control == 'remarcado' || (control == 'emplacado' && !emplacado)) { enable = true; }

        fieldsConfig.push({ field: control, enable: enable });
      });
    }

    Utility.enableFields(this.formulario, fieldsConfig, this._ref);
  }

  setGravameDados(gravameResponse: GravameResponse) {
    if (!this.formulario.get('anoFabricacao').disabled) { this.formulario.get('anoFabricacao').setValue(gravameResponse.anoFabricacao); }
    if (!this.formulario.get('anoModelo').disabled) { this.formulario.get('anoModelo').setValue(gravameResponse.anoModelo); }
    if (!this.formulario.get('remarcado').disabled) { this.formulario.get('remarcado').setValue(gravameResponse.remarcado == 1 ? BooleanOption.SIM : BooleanOption.NAO); }

    this.loading = false;
  }

  private carregarAgentesFinanceiros(agenteFinanceiro: AgenteFinanceiro) {
    this.agenteFinanceiro.empresa = agenteFinanceiro;
  }

  filterData(value: string, formControl: string, blur: boolean = false) {
    if (value && isNaN(+value)) {
      const valueInput = value.toLocaleLowerCase()

      switch (formControl) {
        case 'marca':
          this.marcasVeiculoFiltrados = this.marcasVeiculo?.filter((item: Marcas) => {
            return item.nome.toLowerCase().indexOf(valueInput) > -1
          })
          break;

        case 'modelo':
          this.modelosVeiculoFiltrados = this.modelosVeiculo?.filter((item: Modelos) => {
            return item.nome.toLowerCase().indexOf(valueInput) > -1
          })
          if (blur && this.modelosVeiculoFiltrados.length >= 1) {
            let especieId = this.modelosVeiculoFiltrados[0].especieId != 0 ? this.modelosVeiculoFiltrados[0].especieId : 0
            this.enviaModeloId(especieId)
            this.formulario.get('modelo').setValue(this.modelosVeiculoFiltrados[0].nome)
          }
          break;

        case 'especie':
          this.especiesVeiculoFiltrados = this.especiesVeiculo?.filter((item: Marcas) => {
            return item.nome.toLowerCase().indexOf(valueInput) > -1
          })
          break;

        case 'cor':
          this.coresVeiculoFiltrados = this.coresVeiculo?.filter((item: Marcas) => {
            return item.nome.toLowerCase().indexOf(valueInput) > -1
          })
          if (blur && this.coresVeiculoFiltrados.length >= 1) this.formulario.get('cor').setValue(this.coresVeiculoFiltrados[0].nome)
          break;

        default:
          break;
      }
    }
  }

  replaceSpecialChar(control: string) {
    let texto = this.formulario.get(control).value;
    texto = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    this.formulario.controls[control].setValue(texto);
    return texto;
  }

  enviaMarcaId(marcaId: number) {
    this.carregaModelosVeiculos(marcaId)
  }

  enviaModeloId(especieId: number) {
    this.carregaEspecieVeiculos(especieId)
  }

  onClickVeiculosAdicionados() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { adicionado: false };
    this.dialog.open(DadosVeiculoListComponent, dialogConfig);
  }

  carregarVeiculoFrota(veiculo: Veiculo) {
    Utility.waitFor(() => {
      this.formulario.get('id').setValue(veiculo.id);
      this.formulario.get('chassi').setValue(veiculo.chassi);
      this.formulario.get('placa').setValue(veiculo.placa);
      this.formulario.get('ufPlaca').setValue(veiculo.ufPlaca);
      this.formulario.get('anoFabricacao').setValue(veiculo.anoFabricacao);
      this.formulario.get('anoModelo').setValue(veiculo.anoModelo);
      this.formulario.get('remarcado').setValue(`${veiculo.remarcado}`);
      this.formulario.get('renavam').setValue(veiculo.renavam);
      this.formulario.get('numeroRestricao').setValue(veiculo.numeroRestricao);
      this.formulario.get('emplacado').setValue(`${veiculo.emplacado}`);
      this.formulario.get('marca').setValue(veiculo.marca);
      this.formulario.get('modelo').setValue(veiculo.modelo);
      this.formulario.get('especie').setValue(veiculo.especie);
      this.formulario.get('cor').setValue(veiculo.cor);

      if (veiculo.modelo) this.formulario.get('modelo').enable();

      if (!veiculo.podeEditar) { this.desabilitarForm(); }

      if (this.substituicaoGarantia) { this.disableFieldsByAditivo("TA_SUBSTITUICAO_GARANTIA"); }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.identifier = null;
    this.veiculosList = [];
    this.store.dispatch(stopInfoLoading());
  }
}
