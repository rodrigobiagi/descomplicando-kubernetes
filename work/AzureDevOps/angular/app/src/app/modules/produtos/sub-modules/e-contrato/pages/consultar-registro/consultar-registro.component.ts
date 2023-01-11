import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { ObterTransacoesPaginationResponse } from '../../core/responses/transacoes/obter-transacoes-pagination-response';
import { FiltrarTransacoesRequest } from '../../core/requests/transacoes/filtrar-transacoes.request';
import { DominioResponse } from '../../core/responses/dominios/dominio.response';
import { TransacaoService } from '../../services/transacao.service';
import { DominioService } from '../../services/dominio.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { Transacoes } from '../../core/models/transacoes/transacoes.model';
import { Transacao } from '../../core/models/transacoes/transacao.model';
import { TransacoesDetalhes } from '../../core/models/transacoes/transacoes-detalhes.model';
import { ValorDominio } from '../../core/models/dominios/valor-dominio.model';
import { Utility } from 'src/app/core/common/utility';
import { TipoDocumento } from 'src/app/core/enums/tipo-documento.enum';
import { Documento } from '../../core/models/common/documento.model';
import { DialogCommon } from '../../core/models/common/dialog.model';
import { DialogCustomComponent } from '../../../../../../shared/components/dialog-custom/dialog-custom.component';
import { SendImageComponent } from '../../../../../../shared/components/send-image/send-image.component';
import { DialogCustomService } from '../../services/dialog-custom.service';
import { ContratoService } from '../../services/contrato.service';
import { FORMATO_DATA } from '../../core/models/common/formato-dataPicker.model';

import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { GeograficoService } from '../../services/geografico.service';
import { ImagemService } from '../../services/image.service';
import { RegistrarImagemRequest } from '../../core/requests/contratos/registrar-imagem.request';
import { MetadadoContrato } from '../../core/models/common/metadado-contrato.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { PermissoesConvidados } from '../../core/models/perfis/perfis-permissoes.model';
import { DialogConfirmarBaixaContratoComponent } from '../../components/dialog-confirmar-baixa-contrato/dialog-confirmar-baixa-contrato.component';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterFieldReturn } from 'src/app/shared/core/models/grid-filter/filter-field-return.model';
import { AgenteFinanceiroService } from '../../services/_backoffice/agente-financeiro.service';
import { EmpresasAF } from '../../core/models/empresas/empresasAF.model';
import { CancelarBaixarContratoRequest } from '../../core/requests/contratos/cancelar-baixar-contrato.request';
import { DialogConsultarSolicitacaoBaixaComponent } from '../../components/dialog-consultar-solicitacao-baixa/dialog-consultar-solicitacao-baixa.component';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Store } from '@ngrx/store';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';

@Component({
  selector: 'app-consultar-registro',
  templateUrl: './consultar-registro.component.html',
  styleUrls: ['./consultar-registro.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: FORMATO_DATA },
  ]
})

export class ConsultarRegistroComponent implements OnInit, AfterViewInit {

  columnsToDisplay = ['Empresa', 'Data / Hora', 'UF', 'Chassi', 'N° Contrato', 'Status', 'Imagem'];
  expandedElement: Transacao | null;
  totalRegistros: number;
  transacaoDetalhes: TransacoesDetalhes = <TransacoesDetalhes>{ nomeUsuario: null, tipoDocumento: null, documento: null, tipoRestricao: null, numeroContrato: null, gravame: null, renavam: null, placa: null, codigoRetorno: null, descricaoRetorno: null, tipoRestricaoDescricao: null };
  items$: Observable<object>
  loading$: Observable<boolean>
  refresh$ = new Subject();
  readonly isLoadingResults$ = new BehaviorSubject(true);
  exibeFiltro: boolean = false;
  boxFiltro: FormGroup;
  periodoSelecionado: string = '0';
  labelChave: string = 'Selecione uma chave';
  erroDataFinal: boolean = false;
  masks: string;
  attributes = {
    type: 'text',
    maxlength: '',
  };
  statusRegistros: object;
  chavesPesquisa: any[];
  periodos: any[];
  dataDialog: DialogCommon;
  protocolo: string = null;
  minDate: Date;
  maxDate: Date;
  childstate: boolean = false;
  isLoading: boolean = false;
  ufsLicenciamento: string[];

  permissoesConsulta: Permissao;
  protocoloLote: string = null;
  consultaOperacoes: Map<string, string> = new Map<string, string>();

  usuarioGuid: string;

  //#region filter

  filter: GridFilter;
  filterOptionUF: FieldOption[] = [];
  filterOptionStatus: FieldOption[] = [];
  filterOptionPeriodo: FieldOption[] = [];
  filterOptionEmpresa: FieldOption[] = [];
  listEmpresaOptionsSelected: FieldOption[] = [];

  firstRow: FilterField[];
  secondRow: FilterField[];
  requiredFieldsError: boolean = false;
  fieldEmpresa: FilterField = <FilterField>{ id: 'DocumentoCredor', titulo: 'Por empresa', tipo: TipoFilterField.Checkbox, options: this.filterOptionEmpresa, searchInput: false };
  fieldOperacao: FilterField = <FilterField>{
    id: 'TipoOperacao', titulo: 'Por operação', tipo: TipoFilterField.Select, selectAllOptions: null, options: [
      <FieldOption>{ value: 1, label: 'Registro de contrato' },
      <FieldOption>{ value: 2, label: 'Alterar contrato', },
      <FieldOption>{ value: 3, label: 'Registrar aditvo' },
      <FieldOption>{ value: 4, label: 'Alterar aditivo' }
    ]
  };
  fieldStatus: FilterField = <FilterField>{ id: 'StatusTransacao', titulo: 'Por status', tipo: TipoFilterField.Select, selectAllOptions: null, options: this.filterOptionStatus };
  fieldPeriodo: FilterField = <FilterField>{
    id: 'Periodo', titulo: 'Por período', tipo: TipoFilterField.Custom, options: this.filterOptionPeriodo, customFields: [
      <FilterCustomField>{ id: 'DataInicio' },
      <FilterCustomField>{ id: 'DataFim' }]
  };
  fieldUf: FilterField = <FilterField>{ id: 'Uf', titulo: 'Por UF', tipo: TipoFilterField.Select, options: this.filterOptionUF, selectAllOptions: null };
  fieldOpcoes: FilterField = <FilterField>{
    id: 'opOutras', titulo: 'Outras opções', tipo: TipoFilterField.Custom, customFields: [
      <FilterCustomField>{ id: 'Chassi' },
      <FilterCustomField>{ id: 'Placa' },
      <FilterCustomField>{ id: 'NumeroContrato' },
      <FilterCustomField>{ id: 'NumeroGravame' },
      <FilterCustomField>{ id: 'Renavam' },
      <FilterCustomField>{ id: 'DocumentoDevedor' }]
  };

  empresaControl: FormControl;
  empresaSearchControl: FormControl;
  operacaoControl: FormControl;
  statusControl: FormControl;
  periodoControl: FormControl;
  dataInicialControl: FormControl;
  dataFinalControl: FormControl;
  ufControl: FormControl;
  opcoesControl: FormControl;

  redefinirField: boolean = false;
  showRedefinirButton: boolean = true;

  //#endregion

  isCancelado: boolean = false;
  isBaixado: boolean = false;

  liberaCancelar: boolean = true;
  liberaBaixar: boolean = true;

  inconsistenciaCancelar: boolean = false
  inconsistenciaBaixar: boolean = false

  @ViewChild(FormGroupDirective) formDirective: FormGroupDirective;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (this.exibeFiltro) {
      switch (event.key) {
        case 'Escape':
          this.exibeFiltro = false
          break;

        case 'ArrowUp':
          this.exibeFiltro = false
          break;

        default:
          break;
      }
    }
  }

  constructor(
    private transacaoService: TransacaoService,
    private dominioService: DominioService,
    private notifierService: NotifierService,
    private fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private dialogService: DialogCustomService,
    private contratoService: ContratoService,
    private geograficoService: GeograficoService,
    private imagemService: ImagemService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private agenteFinanceiroService: AgenteFinanceiroService,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    this.maxDate = new Date();

    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url'].split('consultar-registro')[1]?.includes('espelho-contrato') || val['url'].split('consultar-registro')[1]?.includes('visualizar-inconsistencias');

        if (val['url'].includes('enviar-lote')) {
          this.protocoloLote = this.activatedRoute.snapshot.params['protocoloLote'];
        }
      }
    });
  }

  ngOnInit() {
    this.verifyPermission();

    this.loading$ = this.isLoadingResults$;
    this.usuarioGuid = sessionStorage.getItem('userGuid');
    this.iniciaFormulario()

    this.carregarChavePesquisa();
    this.carregarEmpresasFiltro();
    this.carregarPeriodo();
    this.carregarUfsLicenciamento();
    this.carregarStatusRegistro()

    this.filter = <GridFilter>{
      id: 'consultar-registros',
      customFields: true,
      fields: [
        this.fieldEmpresa,
        this.fieldOperacao,
        this.fieldStatus,
        this.fieldPeriodo,
        this.fieldUf,
        this.fieldOpcoes,
      ]
    }
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesConsulta = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    let listaPermissoesConvidado = JSON.parse(localStorage.getItem('permissionsConvidado')) as PermissoesConvidados[];
    this.permissoesConsulta = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS'))[0];

    if (!this.permissoesConsulta.consultar && this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS').length == 0) {
      this.router.navigate(['/permissao-negada']);
    }
  }

  getPermissaoConvidado(listaPermissoes: PermissoesConvidados[], palavraChave: string): PermissoesConvidados[] {
    return listaPermissoes.filter(permissao => permissao.palavraChave == palavraChave && permissao.consultar);
  }

  ngAfterViewInit(): void {
    this.carregaTodasTransacoes()
  }

  carregaTodasTransacoes() {
    this.items$ = merge(this.refresh$, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults$.next(true)
          return this.obterTransacoes(this.paginator.pageIndex, this.paginator.pageSize)
        }),
        map((result: { transacoes: Transacoes[], totalItems: number }) => {
          this.totalRegistros = result.totalItems
          this.isLoadingResults$.next(false)
          return result.transacoes
        }),
        catchError((err) => {
          this.isLoadingResults$.next(false)
          console.info(err)
          return of([])
        })
      )
    this.items$.subscribe()
  }

  onClickImagem() {
    this.contratoService.obterImagem(this.protocolo).subscribe(response => {
      this.imagemService.setImageData(response);
    });

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: SendImageComponent,
        title: 'Imagem',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Enviar'
        },
        disableSaveWithoutData: true
      },
    });

    dialogRef.beforeClosed().subscribe(confirmacao => {
      let sendImage: any;
      this.dialogService.dialogData$.subscribe(img => { sendImage = img });
      if (sendImage == 'nodata') return;
      let requestImagem: RegistrarImagemRequest = <RegistrarImagemRequest>{
        nomeArquivo: sendImage.nomeArquivo,
        imagemBase64: sendImage.imagemBase64,
        metadadoContrato: <MetadadoContrato>{
          canalServico: 1,
        }
      };

      if (confirmacao) {
        this.authService.obterUsuarioAtual().then(usuario => {
          requestImagem.metadadoContrato.usuarioGuid = usuario.id;
          this.contratoService.enviarImagem(this.protocolo, requestImagem).toPromise()
            .then(response => {
              if (response.isSuccessful) {
                this.notifierService.showNotification(response.status, 'Envio de imagem', 'success');
                return;
              }

              this.notifierService.showNotification(response.errors[0].message, 'Erro ' + response.errors[0].code, 'error');
            })
            .catch(response => { this.notifierService.showNotification(response.error.errors[0].message, 'Erro ' + response.error.errors[0].code, 'error'); })
        });
      }
    })
  }

  search(paramsConsulta) {
    this.setDatas(paramsConsulta.get(this.fieldPeriodo.id), paramsConsulta);
    this.setOpcoesValue(paramsConsulta.get(this.fieldOpcoes.id), paramsConsulta);
    this.consultaOperacoes = paramsConsulta;
    this.showRedefinirButton = true;
    this.aplicarFiltro();
  }

  setCustomControls(event: Map<string, AbstractControl>) {
    this.empresaControl = event.get(this.fieldEmpresa.id) as FormControl;
    this.empresaSearchControl = event.get(this.fieldEmpresa.id + "_search") as FormControl;
    this.operacaoControl = event.get(this.fieldOperacao.id) as FormControl;
    this.statusControl = event.get(this.fieldStatus.id) as FormControl;
    this.periodoControl = event.get(this.fieldPeriodo.id) as FormControl;
    this.dataInicialControl = event.get(this.fieldPeriodo.customFields[0].id) as FormControl;
    this.dataFinalControl = event.get(this.fieldPeriodo.customFields[1].id) as FormControl;
    this.ufControl = event.get(this.fieldUf.id) as FormControl;
    this.opcoesControl = event.get(this.fieldOpcoes.id) as FormControl;
  }

  redefinirConsultaOperacoes() {
    this.boxFiltro.reset()
    this.iniciaFormulario();
    this.requiredFieldsError = false;
    this.labelChave = 'Escolha o tipo de pesquisa';
    this.redefinirField = !this.redefinirField;
    this.reset();
  }

  private iniciaFormulario() {
    this.boxFiltro = this.fb.group({ inputChave: [''], })
    this.boxFiltro.controls['inputChave'].disable();

    this.consultaOperacoes = new Map<string, string>();
    this.consultaOperacoes.set("TipoOperacao", null);
    this.consultaOperacoes.set("StatusTransacao", null);
    this.consultaOperacoes.set("Chassi", null);
    this.consultaOperacoes.set("Placa", null);
    this.consultaOperacoes.set("NumeroContrato", null);
    this.consultaOperacoes.set("NumeroAditivo", null);
    this.consultaOperacoes.set("Renavam", null);
    this.consultaOperacoes.set("NumeroGravame", null);
    this.consultaOperacoes.set("Uf", null);
    this.consultaOperacoes.set("DocumentoCredor", null);
    this.consultaOperacoes.set("DocumentoDevedor", null);
    this.consultaOperacoes.set("DataInicio", null);
    this.consultaOperacoes.set("DataFim", null);
    this.consultaOperacoes.set("Sort", null);
    this.consultaOperacoes.set("Email", null);
    this.showRedefinirButton = false;
  }

  private carregarTipoRestricao() {
    this.dominioService.obterPorTipo('TIPO_RESTRICAO')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach((dominio: ValorDominio) => {
            if (dominio.id == this.transacaoDetalhes.tipoRestricao) { this.transacaoDetalhes.tipoRestricaoDescricao = dominio.valor; }
          })
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`)
        })
      },
        error => console.info(error)
      )
  }

  private carregarChavePesquisa() {
    this.dominioService.obterPorTipo('CHAVE_PESQUISA')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          this.chavesPesquisa = response.valorDominio.filter(c => c.palavraChave !== 'CP_CNPJ_CREDOR');
          return;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`)
        })
      })
  }

  private carregarEmpresasFiltro() {
    this.agenteFinanceiroService.obterAgentesFinanceirosPorUsuarioGuid(this.usuarioGuid).subscribe(res => {
      let options = [];
      res.empresas.forEach(empresa => { options.push(<FieldOption>{ value: empresa.cnpj, label: this.getClienteNomeCnpj(empresa) }); })
      this.filter.fields.filter(field => field.id == "DocumentoCredor")[0].options = options;
    })
  }

  private getClienteNomeCnpj(cliente: EmpresasAF) {
    let cnpj = <Documento>{ numero: cliente.cnpj, tipoDocumento: 2 };
    return `${cliente.nome} (${Utility.formatDocument(cnpj)})`
  }

  private carregarPeriodo() {
    this.dominioService.obterPorTipo('PERIODO')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          this.periodos = response.valorDominio
          this.periodos.forEach(periodo => { this.filterOptionPeriodo.push(<FieldOption>{ value: periodo.id, label: periodo.valor }); });
          return;
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`)
        })
      },
        error => console.info(error)
      )
  }

  private carregarStatusRegistro() {
    this.transacaoService.obterStatusTransacoes()
      .subscribe((response) => {
        if (response.isSuccessful) { response.statusTransacao.forEach(status => { this.filterOptionStatus.push(<FieldOption>{ value: status.id, label: status.nome }) }) }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`)
        })
      },
        error => console.info(error)
      )
  }

  obterTransacoes(pageIndex: number, pageSize: number): Observable<ObterTransacoesPaginationResponse> {
    if (this.protocoloLote) {
      return this.filtrarTransacoes(pageIndex, pageSize);
    }
    return this.transacaoService.obterTodasTransacoes(pageIndex, pageSize)
  }

  filtrarTransacoes(pageIndex: number, pageSize: number) {
    const filtros: FiltrarTransacoesRequest = this.tratamentoParaFiltro(this.consultaOperacoes, pageIndex, pageSize)
    return this.transacaoService.filtrarTransacoes(filtros)
  }

  expandDetail(protocolo: string, expandedElement: boolean) {
    this.isLoading = true
    this.protocolo = protocolo
    this.transacaoDetalhes = new TransacoesDetalhes()
    if (expandedElement) {
      this.transacaoService.obterDetalhesTransacao(protocolo)
        .subscribe((response) => {
          if (response.isSuccessful) {
            this.transacaoDetalhes = response.result.transacaoContrato
            this.carregarTipoRestricao()
            this.isLoading = false
            if (this.transacaoDetalhes.documento) {
              this.transacaoDetalhes.documento = this.transacaoDetalhes.documento.replace(/(\d{2})?(\d{3})?(\d{3})?(\d{4})?(\d{2})/, "$1.$2.$3/$4-$5")
            }
          } else {
            this.expandedElement = null
            this.notifierService.showNotification('Não foi possível carregar os detalhes do registro.', 'Atenção', 'error')
          }
        })
    } else {
      this.isLoading = false
    }
  }

  gerenciaAberturaFiltro() {
    this.exibeFiltro = !this.exibeFiltro
  }

  selecionarPeriodo(val: string) {
    this.periodoSelecionado = val
    this.boxFiltro.get('dataInicial').clearValidators()
    this.boxFiltro.get('dataInicial').setValue('')

    this.boxFiltro.get('dataFinal').clearValidators()
    this.boxFiltro.get('dataFinal').setValue('')

    this.boxFiltro.get('porPeriodo').clearValidators()
    this.boxFiltro.get('porPeriodo').setValue('')

    this.boxFiltro.get('porPeriodo').updateValueAndValidity()
    this.boxFiltro.get('dataInicial').updateValueAndValidity()
    this.boxFiltro.get('dataFinal').updateValueAndValidity()
  }

  selecionarChave(event: MatSelectChange) {
    if (event.value !== undefined) {
      this.labelChave = event.source.triggerValue;
      this.boxFiltro.get('inputChave').enable();

      switch (this.labelChave) {
        case 'Chassi do Veículo':
          this.boxFiltro
            .get('inputChave')
            .setValidators(Validators.compose([Validators.minLength(3), Validators.maxLength(21)]))
          this.masks = ''
          this.attributes = {
            type: 'text',
            maxlength: '21'
          }
          break;
        case 'Número de Contrato':
          this.boxFiltro
            .get('inputChave')
            .setValidators(Validators.compose([Validators.minLength(3), Validators.maxLength(20)]))
          this.masks = ''
          this.attributes = {
            type: 'text',
            maxlength: '20'
          }
          break;
        case 'Renavam':
          this.boxFiltro
            .get('inputChave')
            .setValidators(Validators.compose([Validators.minLength(3), Validators.maxLength(11)]))
          this.masks = ''
          this.attributes = {
            type: 'number',
            maxlength: '11'
          }
          break;
        case 'Número Gravame':
          this.boxFiltro
            .get('inputChave')
            .setValidators(Validators.compose([Validators.minLength(5), Validators.maxLength(8)]))
          this.masks = ''
          this.attributes = {
            type: 'number',
            maxlength: '8'
          }
          break;
        case 'Placa':
          this.boxFiltro
            .get('inputChave')
            .setValidators(Validators.compose([Validators.minLength(5), Validators.maxLength(8)]))
          this.masks = ''
          this.attributes = {
            type: 'text',
            maxlength: '7'
          }
          break;
        case 'CPF Devedor':
          this.masks = this.mascaraDocumento('cpf')
          this.attributes = {
            type: 'text',
            maxlength: '15',
          }
          break;
        case 'CNPJ Devedor':
          this.masks = this.mascaraDocumento('cnpj')
          this.attributes = {
            type: 'text',
            maxlength: '18'
          }
          break;

        default:
          break;
      }
    } else {
      this.boxFiltro.get('inputChave').disable();
    }

    this.boxFiltro.get('inputChave').setValue('')
    for (let name in this.boxFiltro.controls) {
      this.boxFiltro.controls[name].setErrors(null)
    }
  }

  verificaData(dataFinal: any) {
    let data1
    let data2
    data1 = Utility.formatDate(this.boxFiltro.get('dataInicial').value)
    data2 = Utility.formatDate(dataFinal)

    if (data1 !== '' && data2 !== '') {
      const data1Split = data1.split('-')
      const data2Split = data2.split('-')
      const novaData1 = new Date(data1Split[2], data1Split[1] - 1, data1Split[0])
      const novaData2 = new Date(data2Split[2], data2Split[1] - 1, data2Split[0])

      if (novaData1.getTime() <= novaData2.getTime()) {
        this.erroDataFinal = false
      } else {
        this.erroDataFinal = true
        this.boxFiltro.get('dataFinal').setValue('')
      }
    }
  }

  setaDataMinima(dataFinal: any) {
    let data1
    data1 = Utility.formatDate(dataFinal)
    const data1Split = data1.split('-')
    this.minDate = new Date(data1Split[2], data1Split[1] - 1, data1Split[0])
  }

  carregarEspelhoContrato(transacao: Transacoes) {
    if (this.protocoloLote) {
      this.router.navigateByUrl(`/produtos/e-contrato/enviar-lote/consultar-registro/${this.protocoloLote}/espelho-contrato?protocolo=${transacao.protocolo}`);
      return;
    }

    this.router.navigateByUrl(`/produtos/e-contrato/consultar-registro/espelho-contrato?protocolo=${transacao.protocolo}`);
  }

  onClickVisualizarInconsistencias(transacao: Transacoes) {
    let tipoOperacao: string;

    if (transacao.tipoOperacao == 'Registro de Contrato') { tipoOperacao = 'registrar-contrato' }
    else if (transacao.tipoOperacao == "Registro de Aditivo") { tipoOperacao = 'registrar-aditivo' }
    else if (transacao.tipoOperacao == 'Alteracao de Contrato') { tipoOperacao = 'alterar-contrato' }
    else { tipoOperacao = 'alterar-aditivo' }

    if (this.protocoloLote) {
      this.router.navigateByUrl(`/produtos/e-contrato/enviar-lote/consultar-registro/${this.protocoloLote}/visualizar-inconsistencias?protocolo=${transacao.protocolo}&uf=${transacao.uf}&operacao=${tipoOperacao}`);
      return;
    }

    this.router.navigateByUrl(`/produtos/e-contrato/consultar-registro/visualizar-inconsistencias?protocolo=${transacao.protocolo}&uf=${transacao.uf}&operacao=${tipoOperacao}`);
  }

  tratamentoParaFiltro(filtro, pageIndex, pageSize) {
    const novoFiltro: FiltrarTransacoesRequest = {
      TipoOperacao: filtro.get('TipoOperacao') ? filtro.get('TipoOperacao') : null,
      Uf: filtro.get('Uf') ? filtro.get('Uf') : null,
      StatusTransacao: filtro.get('StatusTransacao') ? filtro.get('StatusTransacao') : null,
      NumeroContrato: filtro.get('NumeroContrato') ? filtro.get('NumeroContrato') : null,
      Renavam: filtro.get('Renavam') ? filtro.get('Renavam') : null,
      Chassi: filtro.get('Chassi') ? filtro.get('Chassi') : null,
      NumeroGravame: filtro.get('NumeroGravame') ? filtro.get('NumeroGravame') : null,
      Placa: filtro.get('Placa') ? filtro.get('Placa') : null,
      DocumentoDevedor: filtro.get('DocumentoDevedor') ? filtro.get('DocumentoDevedor') : null,
      DocumentoCredor: filtro.get('DocumentoCredor') ? filtro.get('DocumentoCredor') : null,
      DataInicio: filtro.get('DataInicio') ? filtro.get('DataInicio') : null,
      DataFim: filtro.get('DataFim') ? filtro.get('DataFim') : null,
      ProtocoloLote: this.protocoloLote ?? '',
      PageIndex: pageIndex,
      PageSize: pageSize
    }

    return novoFiltro
  }

  transformaDataParaPadraoApi(date: Date) {
    const data = new Date(Number(date))
    let novaData
    let dataPadraoApi
    novaData = data.toISOString().split('T')[0].split('-')
    dataPadraoApi = `${novaData[1]}-${novaData[2]}-${novaData[0]}`
    return dataPadraoApi
  }

  subtrairDias(date: Date, days: number) {
    const data = new Date(Number(date))
    let novaData
    let dataPadraoApi
    data.setDate(date.getDate() - days)
    novaData = data.toISOString().split('T')[0].split('-')
    dataPadraoApi = `${novaData[1]}-${novaData[2]}-${novaData[0]}`
    return dataPadraoApi
  }

  mascaraDocumento(tipoDocumento: string): string {
    if (tipoDocumento == TipoDocumento.Cpf) return Documento.mascaraCPF();
    return Documento.mascaraCNPJ();
  }

  aplicarFiltro() {
    this.paginator.pageIndex = 0
    // if (!this.boxFiltro.valid) return;

    this.items$ = merge(this.refresh$, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults$.next(true)
          return this.filtrarTransacoes(this.paginator.pageIndex, this.paginator.pageSize)
        }),
        map((result: { transacoes: Transacoes[], totalItems: number }) => {
          this.totalRegistros = result.totalItems
          this.isLoadingResults$.next(false)
          return result.transacoes
        }),
        catchError((err) => {
          this.isLoadingResults$.next(false)
          console.info(err)
          return of([])
        })
      )
    this.items$.subscribe()
  }

  reset() {
    this.formDirective.resetForm()
    this.iniciaFormulario()
    this.labelChave = 'Selecione uma chave'
    this.boxFiltro.get('inputChave').disable()
    this.periodoSelecionado = '0'
    this.paginator.pageIndex = 0
    this.carregaTodasTransacoes()
  }

  openDialog(type, transacao: Transacoes) {

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConfirmarBaixaContratoComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: type == 'baixar' ? 'Realizar baixa' : 'Realizar cancelamento'
        },
        disableSaveWithoutData: false,
        type: type,
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.cancelarBaixarContrato(type, transacao);
      }
    })

  }

  cancelarBaixarContrato(type: string, transacao: Transacoes) {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.contratoService.cancelarBaixarContrato(
      <CancelarBaixarContratoRequest>{
        protocolo: transacao.protocolo,
        baixarContrato: type == 'baixar',
        cancelarContrato: type == 'cancelar',
        metadadoContrato: <MetadadoContrato>{
          canalServico: 1,
        }
      })
      .subscribe(response => {
        if (response.errors.length == 0) {
          this.notifierService.showNotification('Solicitação enviada com sucesso!', 'Sucesso', 'success');
          this.expandDetail(transacao.protocolo, true);
        }
        this.store.dispatch(closePreloader());
      })
  }

  consultarStatus(type, transacao: Transacoes, transacaoDetalhes: TransacoesDetalhes) {

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: DialogConsultarSolicitacaoBaixaComponent,
        title: '',
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Tentar novamente'
        },
        buttonCustom: {
          value: false,
          text: 'Entendi',
          showOthers: false,
          showBtn: !transacaoDetalhes.detalheBaixarCancelarContrato.mensagensInconsistencias
        },
        disableSaveWithoutData: true,
        type: type,
        transacao: transacao,
        transacaoDetalhes: transacaoDetalhes
      },
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.cancelarBaixarContrato(type, transacao);
      }
    })
  }

  selectAll(fieldReturn: FilterFieldReturn) {
    switch (fieldReturn.field.id) {
      case this.fieldUf.id:
        this.selectAllOptions(this.ufControl, fieldReturn.selected, this.fieldUf.options);
        break;

      case this.fieldOperacao.id:
        this.selectAllOptions(this.operacaoControl, fieldReturn.selected, this.fieldOperacao.options);
        break;

      case this.fieldStatus.id:
        this.selectAllOptions(this.statusControl, fieldReturn.selected, this.fieldStatus.options);
        break;
    }
  }

  redefinir(control: FormControl, field: FilterField) {
    control.reset();

    if (field.id == this.fieldPeriodo.id) {
      this.dataInicialControl.reset();
      this.dataFinalControl.reset();
      return;
    }

    if (field.id == this.fieldOpcoes.id) {
      this.boxFiltro.reset();
      this.iniciaFormulario();
      this.labelChave = 'Escolha o tipo de pesquisa';
      return;
    }

    if (field.id == this.fieldEmpresa.id) {
      if (this.fieldEmpresa.searchInput) {
        this.empresaSearchControl.reset();
        this.onChangeSearch(null, true);
      }
    }
  }

  onChangeSearch(value: string, reset?: boolean) {
    if (reset || value == '') {
      this.searchFilter(<FieldOption>{ label: this.fieldEmpresa.id, value: '' });
      if (reset) {
        this.listEmpresaOptionsSelected = [];
        return
      }

      this.updateOptions();
      return;
    }

    if (value.length >= 3) {
      this.searchFilter(<FieldOption>{ label: this.fieldEmpresa.id, value: value });
      this.updateOptions();
    }
  }

  updateOptions() {
    Utility.waitFor(() => {
      this.listEmpresaOptionsSelected.forEach(selected => {
        let option = this.fieldEmpresa.options.filter(op => op.value == selected.value)[0];
        if (option) {
          this.fieldEmpresa.options.splice(this.fieldEmpresa.options.indexOf(option), 1);
        }
      });
    }, 1000);
  }

  searchFilter(event: FieldOption) {
    if (event.label == 'DocumentoCredor') {
      let filtro = this.checkNumbersOnly(event.value);
      this.carregarEmpresasFiltro();
    }
  }

  checkNumbersOnly(filtro: string) {
    let retorno = filtro;
    let numbers = +(retorno.replace(/[^a-zA-Z\d]*/g, ''));

    if (!isNaN(numbers)) { return numbers.toString(); }
    return filtro;
  }

  cleanDates() {
    this.dataInicialControl.reset();
    this.dataFinalControl.reset();
  }


  onChangePeriodo(value: any, inicial: boolean) {
    this.periodoControl.reset();

    if (inicial) {
      this.setaDataMinima(value);
      return;
    }

    this.verificaData(value);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }

  private carregarUfsLicenciamento() {
    this.geograficoService.obterUfsLicenciamento().subscribe(ufs => { ufs.sigla.forEach(uf => { this.filterOptionUF.push(<FieldOption>{ value: uf, label: uf }); }); })
  }

  private selectAllOptions(control: FormControl, selected: boolean, options: FieldOption[]) {
    if (selected) {
      control
        .patchValue([...options.map(item => item.value), 'selectAll']);
      return;
    }

    control.patchValue([]);
  }

  private setDatas(value: any[], paramsConsulta: Map<string, string>) {
    let dataInicialId = this.fieldPeriodo.customFields[0].id;
    let dataFinalId = this.fieldPeriodo.customFields[1].id;

    let defaulValue = value.filter(v => v.id == 'default')[0]?.value;

    if (defaulValue) {
      let periodo = this.periodos.filter((p => p.id == defaulValue))[0]?.palavraChave;

      if (periodo) {
        const date = new Date();
        paramsConsulta.set(dataFinalId, this.transformaDataParaPadraoApi(date));

        switch (periodo) {
          case 'P_ULTIMO_30_DIAS':
            paramsConsulta.set(dataInicialId, this.subtrairDias(date, 30));
            break;
          case 'P_ULTIMO_60_DIAS':
            paramsConsulta.set(dataInicialId, this.subtrairDias(date, 60));
            break;
          case 'P_ULTIMO_90_DIAS':
            paramsConsulta.set(dataInicialId, this.subtrairDias(date, 90));
            break;
        }
      }

      return;
    }

    let dataInicialValue = value.filter(v => v.id == dataInicialId)[0]?.value;

    if (dataInicialValue) {
      let dataInicial = Utility.formatDate(dataInicialValue)

      const dataISplit = dataInicial.split('-')
      paramsConsulta.set(dataInicialId, `${dataISplit[1]}-${dataISplit[0]}-${dataISplit[2]}`);

      let dataFinal = Utility.formatDate(value.filter(v => v.id == dataFinalId)[0]?.value)

      const dataFSplit = dataFinal.split('-')
      paramsConsulta.set(dataFinalId, `${dataFSplit[1]}-${dataFSplit[0]}-${dataFSplit[2]}`);
    }
  }

  private setOpcoesValue(value: any[], paramsConsulta: Map<string, string>) {
    let defaulValue = value.filter(v => v.id == 'default')[0]?.value;

    if (defaulValue) {
      let indexField = null;

      switch (this.chavesPesquisa.filter(cp => cp.id == defaulValue)[0].palavraChave) {
        case 'CP_CHASSI':
          indexField = 0;
          break;

        case 'CP_PLACA':
          indexField = 1;
          break;

        case 'CP_NUMERO_CONTRATO':
          indexField = 2;
          break;

        case 'CP_NUMERO_GRAVAME':
          indexField = 3;
          break;

        case 'CP_RENAVAM':
          indexField = 4;
          break;

        case 'CP_CPF_DEVEDOR':
          indexField = 5;
          break;

        case 'CP_CNPJ_DEVEDOR':
          indexField = 5;
          break;
      }

      paramsConsulta.set(this.fieldOpcoes.customFields[indexField].id, this.boxFiltro.get('inputChave').value);
    }
  }

  enableButton(transacaoDetalhes: TransacoesDetalhes, btn: string) {
    switch (btn) {
      case 'baixa':
        return transacaoDetalhes.codigoRetorno == 30
          && (transacaoDetalhes.detalheBaixarCancelarContrato == null
            || (transacaoDetalhes.detalheBaixarCancelarContrato.mensagensInconsistencias != null
              && transacaoDetalhes.detalheBaixarCancelarContrato.tipoOperacao == 'C'
              && !transacaoDetalhes.detalheBaixarCancelarContrato.possuiBaixaContrato
              && !transacaoDetalhes.detalheBaixarCancelarContrato.possuiCancelamentoContrato));

      case 'acompanhamento-baixa':
        return transacaoDetalhes.codigoRetorno == 30
          && (transacaoDetalhes.detalheBaixarCancelarContrato !== null && transacaoDetalhes.detalheBaixarCancelarContrato.tipoOperacao == 'B');

      case 'cancelamento':
        return transacaoDetalhes.codigoRetorno == 30
          && transacaoDetalhes.podeCancelar
          && (transacaoDetalhes.detalheBaixarCancelarContrato == null
            || (transacaoDetalhes.detalheBaixarCancelarContrato.mensagensInconsistencias != null
              && transacaoDetalhes.detalheBaixarCancelarContrato.tipoOperacao == 'B'
              && !transacaoDetalhes.detalheBaixarCancelarContrato.possuiBaixaContrato
              && !transacaoDetalhes.detalheBaixarCancelarContrato.possuiCancelamentoContrato));

      case 'acompanhamento-cancelamento':
        return transacaoDetalhes.codigoRetorno == 30
          && (transacaoDetalhes.detalheBaixarCancelarContrato !== null
            && transacaoDetalhes.detalheBaixarCancelarContrato.tipoOperacao == 'C');

    }
  }

  private getPermissaoMasterDefault(): Permissao {
    return <Permissao>{
      id: 0,
      palavraChave: "",
      nome: '',
      admin: true,
      consultar: true,
      editar: true
    };
  }
}
