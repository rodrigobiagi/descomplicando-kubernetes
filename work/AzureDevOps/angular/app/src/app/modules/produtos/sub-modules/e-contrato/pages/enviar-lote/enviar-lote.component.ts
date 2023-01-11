import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { SendFileComponent } from 'src/app/shared/components/send-file/send-file.component';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { PermissoesConvidados } from '../../core/models/perfis/perfis-permissoes.model';
import { ResumoLote } from '../../core/models/transacoes/resumo-lote.model';
import { ObterLotesRequest } from '../../core/requests/transacoes/obter-lotes.request';
import { ObterLotesResponse } from '../../core/responses/transacoes/obter-lotes.response';
import { DialogCustomService } from '../../services/dialog-custom.service';
import { TransacaoService } from '../../services/transacao.service';

export interface ListaRegistro {
  numeroLote: string;
  dataSolicitacao: string;
  dataProcessamento: string;
  status: string;
  versaoArquivo: string;
  usuario: string;
  tipoOperacao: string;
  registrados: string;
  acoes: string;
}
@Component({
  selector: 'app-enviar-lote',
  templateUrl: './enviar-lote.component.html',
  styleUrls: ['./enviar-lote.component.scss']
})
export class EnviarLoteComponent implements OnInit {

  columnsToDisplay = ['Protocolo do lote', 'Data da solicitação', 'Data do processamento', 'Status', 'Versão do arquivo', 'Usuário', 'Tipo de arquivo', 'Registrados', 'Ações'];
  expandedElement: ListaRegistro | null;
  totalItems: number = 0;

  items$: Observable<object>;
  refresh$ = new Subject();
  readonly isLoadingResults$ = new BehaviorSubject(true);

  registrosSucesso: number;
  registrosTotal: number;
  childstate: boolean = false;

  permissoesV020: Permissao;
  permissoesV040: Permissao;
  permissoesFuncao: Permissao;
  sortListTransacoes: ObterLotesRequest = <ObterLotesRequest>{ sort: null };

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public dialog: MatDialog,
    private dialogService: DialogCustomService,
    private transacaoService: TransacaoService,
    private notifierService: NotifierService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<{ preloader: IPreloaderState }>) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url'].split('enviar-lote')[1]?.includes('consultar-registro');
      }
    });
  }

  ngOnInit(): void {
    this.verifyPermission();
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesV020 = this.getPermissaoMasterDefault();
      this.permissoesV040 = this.getPermissaoMasterDefault();
      this.permissoesFuncao = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    let listaPermissoesConvidado = JSON.parse(localStorage.getItem('permissionsConvidado')) as PermissoesConvidados[];

    this.permissoesV020 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'LOTE_ENVIO_LOTE_020'))[0];
    this.permissoesV040 = listaPermissoes.filter(permissao => (permissao.palavraChave == 'LOTE_ENVIO_LOTE_040'))[0];
    this.permissoesFuncao = listaPermissoes.filter(permissao => (permissao.palavraChave == 'LOTE_ENVIO_LOTE_FUNCAO'))[0];

    if ((!this.permissoesFuncao.consultar && !this.permissoesV020.consultar && !this.permissoesV040.consultar)
      && this.getPermissaoConvidado(listaPermissoesConvidado, 'LOTE_ENVIO_LOTE_020').length == 0
      && this.getPermissaoConvidado(listaPermissoesConvidado, 'LOTE_ENVIO_LOTE_040').length == 0
      && this.getPermissaoConvidado(listaPermissoesConvidado, 'LOTE_ENVIO_LOTE_FUNCAO').length == 0) {
      this.router.navigate(['./permissao-negada']);
      return;
    }
  }

  getPermissaoConvidado(listaPermissoes: PermissoesConvidados[], palavraChave: string): PermissoesConvidados[] {
    return listaPermissoes.filter(permissao => permissao.palavraChave == palavraChave && permissao.consultar);
  }

  ngAfterViewInit() {
    this.carregarGrid();
  }

  carregarGrid() {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults$.next(true)
          return this.obterResumoLotes(this.paginator.pageIndex, this.paginator.pageSize)
        }),
        map((result: { lotes: ResumoLote[], totalItems: number }) => {
          this.totalItems = result.totalItems
          this.isLoadingResults$.next(false)
          return result.lotes
        }),
        catchError((err) => {
          this.isLoadingResults$.next(false)
          console.info(err)
          return of([])
        })
      )
    this.items$.subscribe()
  }

  private obterResumoLotes(pageIndex: number, pageSize: number): Observable<ObterLotesResponse> {
    return this.transacaoService.obterLotes(this.sortListTransacoes, pageIndex, pageSize)
  }

  onClickEnviarLote() {
    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '500px',
      data: {
        component: SendFileComponent,
        title: 'Envio de arquivos',
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
      let fileBase64 = "";
      let versaoLote = null;
      let operacao = null;
      let nomeArquivo = "";
      this.dialogService.dialogData$.subscribe(data => {
        fileBase64 = data.file;
        versaoLote = data.versaoLote;
        operacao = data.operacao;
        nomeArquivo = data.nomeArquivo;
      });

      if (fileBase64 == 'nodata') return;

      if (confirmacao) {
        this.store.dispatch(showPreloader({ payload: '' }));
        this.transacaoService.enviarLote(fileBase64, versaoLote, operacao, nomeArquivo).toPromise()
          .then(response => {
            if (response.isSuccessful) {
              this.notifierService.showNotification(response.status, 'Envio de lote', 'success');
              this.refresh$.next();
              this.store.dispatch(closePreloader());
              return;
            }

            this.notifierService.showNotification(response.errors[0].message, 'Erro ' + response.errors[0].code, 'error');
            this.store.dispatch(closePreloader());
          })
          .catch(response => {
            this.notifierService.showNotification(response.error.errors[0].message, 'Erro ' + response.error.errors[0].code, 'error');
            this.store.dispatch(closePreloader());
          })
      }
    })
  }

  getRegistrosSucesso(registrados: string) {
    return +registrados.split('/')[0];
  }

  getRegistrosTotal(registrados: string) {
    return +registrados.split('/')[1];
  }

  getInconsistencias(registrados: string) {
    let inconsistencias = this.getRegistrosTotal(registrados) - this.getRegistrosSucesso(registrados);
    if (inconsistencias == 0) return '';

    return `${inconsistencias} inconsistência${inconsistencias > 1 ? 's' : ''}`;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  goToConsulta(protocoloLote: string) {
    this.router.navigate([`../enviar-lote/consultar-registro`, protocoloLote], { relativeTo: this.activatedRoute });
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case "Protocolo do lote":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `numeroLote.${sort.direction}` }
        break;

      case "Data da solicitação":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `dataSolicitacao.${sort.direction}` }
        break;

      case "Data do processamento":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `dataProcessamento.${sort.direction}` }
        break;

      case "Status":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `status.${sort.direction}` }
        break;

      case "Versão do arquivo":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `versaoArquivo.${sort.direction}` }
        break;

      case "Usuário":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `usuario.${sort.direction}` }
        break;

      case "Tipo de arquivo":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `tipoDoArquivo.${sort.direction}` }
        break;

      case "Registrados":
        this.sortListTransacoes = <ObterLotesRequest>{ sort: `registrados.${sort.direction}` }
        break;
    }

    this.obterResumoLotes(this.paginator.pageIndex, this.paginator.pageSize);
    this.refresh$.next();
  }

  onClickDownload(numeroLote) {
    this.transacaoService.obterLote(numeroLote).toPromise()
      .then(response => {
        this.downloadArquivo(response.url, response.nomeArquivo);
      })
  }

  onClickDownloadRetorno(numeroLote, tipo) {
    this.transacaoService.obterLoteBase64(numeroLote, tipo).toPromise()
      .then(response => {
        let mimeType = '';
        if (tipo == 'CSV') {
          mimeType = 'text/csv';
        } else {
          mimeType = 'text/plain';
        }

        let arquivoBase64 = `data:${mimeType};base64,${response.loteBase64}`;
        this.downloadArquivo(arquivoBase64, response.nomeArquivo);
      })
  }

  downloadArquivo(file, nomeArquivo) {
    var element = document.createElement('a');
    element.setAttribute('download', nomeArquivo);
    element.setAttribute('href', file)
    document.body.appendChild(element);
    element.click();
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

