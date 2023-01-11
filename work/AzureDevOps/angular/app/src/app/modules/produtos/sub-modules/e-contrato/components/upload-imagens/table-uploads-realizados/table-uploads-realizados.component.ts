import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { PermissoesConvidados } from '../../../core/models/perfis/perfis-permissoes.model';
import { UploadsRealizadosFiltro } from '../../../core/models/upload-imagens/uploads-realizados-filtro.model';
import { UploadsRealizados } from '../../../core/models/upload-imagens/uploads-realizados.model';
import { BaixarInconsistenciaImagemResponse } from '../../../core/responses/contratos/baixar-inconsistencia-imagem.response';
import { ObterUploadsRealizadosResponse } from '../../../core/responses/upload-imagens/obter-uploads-realizados.response';
import { ContratoService } from '../../../services/contrato.service';
import { DialogCustomService } from '../../../services/dialog-custom.service';
import { DialogRevisarInconsistenciasComponent } from '../dialog-revisar-inconsistencias/dialog-revisar-inconsistencias.component';

@Component({
  selector: 'app-table-uploads-realizados',
  templateUrl: './table-uploads-realizados.component.html',
  styleUrls: ['./table-uploads-realizados.component.scss']
})
export class TableUploadsRealizadosComponent implements OnInit {

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private contratoService: ContratoService,
    public dialog: MatDialog,
    public dialogService: DialogCustomService,
    private notifierService: NotifierService,
    private router: Router
  ) { }

  displayedColumns: string[] = [
    'nomeArquivo',
    'nomeFantasia',
    'criadoEm',
    'processadoEm',
    'status',
    'acoes',
  ];

  @Input('refreshGrid') set setRefreshGrid(value) { this.carregaGrid(); }
  @Input('filtro') set setFiltro(value) { this.carregaGrid(value); }
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('table') tableSort: MatSort;
  sortListaUploads: string = null;

  items$: Observable<UploadsRealizados[]>;
  uploads: UploadsRealizados[] = [];

  dataSource = new MatTableDataSource(this.uploads);
  refresh$ = new Subject();
  totalItems = 0;

  permissoesConsulta: Permissao;
  permissoesConvidadoConsulta: PermissoesConvidados[];

  filtro: UploadsRealizadosFiltro = new UploadsRealizadosFiltro();

  readonly isLoadingResults$ = new BehaviorSubject(true);

  ngOnInit(): void {
    this.verifyPermission();
  }

  ngAfterViewInit() {
    this.carregaGrid();
  }

  carregaGrid(filtros: UploadsRealizadosFiltro = null) {
    if (this.paginator) { this.paginator.pageIndex = 0; }

    this.items$ = merge(this.refresh$, (this.paginator == undefined ? 0 : this.paginator.page)).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarUploads(
          this.paginator?.pageIndex,
          this.paginator?.pageSize,
          filtros
        );
      }),
      map((result: { totalItems: number; transacoesImagens: UploadsRealizados[] }) => {
        this.totalItems = result.totalItems;
        this.uploads = result.transacoesImagens
        this.dataSource = new MatTableDataSource<UploadsRealizados>(result.transacoesImagens);
        this.isLoadingResults$.next(false);
        this.dataSource.sort = this.tableSort;

        this.store.dispatch(closePreloader())
        return result.transacoesImagens;
      }),
      catchError((err) => {
        this.isLoadingResults$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
    this.items$.subscribe();
  }

  listarUploads(pageIndex: number, pageSize: number, filtros: UploadsRealizadosFiltro = null): Observable<ObterUploadsRealizadosResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(pageIndex, pageSize, filtros)
    return this.contratoService.obterUploadsRealizados(filtro);
  }

  getParams(pageIndex: number = 0, pageSize: number = 25, filtros: UploadsRealizadosFiltro = null) {
    let filtro = <UploadsRealizadosFiltro>{
      CriadoEmInicio: filtros != null ? (filtros.CriadoEmInicio != null ? filtros.CriadoEmInicio : '') : '',
      CriadoEmFim: filtros != null ? (filtros.CriadoEmFim != null ? filtros.CriadoEmFim : '') : '',
      StatusRegistroImagemMsgIds: filtros != null ? (filtros.StatusRegistroImagemMsgIds != null ? filtros.StatusRegistroImagemMsgIds : '') : '',
      PageIndex: pageIndex,
      PageSize: pageSize,
      Sort: this.sortListaUploads
    }

    return filtro;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  async onClickRevisarInconsistencia(upload: UploadsRealizados) {
    if ((!this.permissoesConsulta?.editar && +sessionStorage.getItem('empresaId') == upload.empresaId)
      && this.permissoesConvidadoConsulta.findIndex(p => p.editar && p.empresaId == upload.empresaId) == -1) { return; }

    this.store.dispatch(showPreloader({ payload: '' }))
    let contratos = await this.contratoService.obterImagemRevisao(upload.empresaId, upload.nomeArquivo).toPromise()
      .then((response) => { return response.contratos; });
    this.store.dispatch(closePreloader());

    const dialogRef = this.dialog.open(DialogCustomComponent, {
      width: '780px',
      data: {
        component: DialogRevisarInconsistenciasComponent,
        title: `Existe mais de um contrato para este chassi <label class='text-danger'>${upload.nomeArquivo}</label>.`,
        buttonCancel: {
          value: false,
          text: 'Fechar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar'
        },
        disableSaveWithoutData: true,
        contratos: contratos
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        let contratoSelecionado;
        this.dialogService.dialogData$.subscribe(contrato => contratoSelecionado = contrato);
        if (contratoSelecionado == 'nodata') return;
        this.associarImagemContrato(upload.empresaId, contratoSelecionado.data.contrato.contratoId, upload.protocolo);
      }
    })
  }

  associarImagemContrato(empresaId: number, contratoId: number, protocolo: string) {
    this.contratoService.associarImagemContrato(empresaId, contratoId, protocolo).subscribe(response => {
      if (response.protocoloImagem) {
        this.notifierService.showNotification(response.status, '', 'success');
        this.refresh$.next();
        return;
      }

      this.notifierService.showNotification(response.errors[0].message, '', 'error');
    });
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  sortData(sort: Sort) {
    this.sortListaUploads = `${sort.active}.${sort.direction}`

    this.listarUploads(this.paginator.pageIndex, this.paginator.pageSize, this.filtro);
    this.refresh$.next();
  }

  baixarInconsistenciasImagem(protocolo: string) {
    this.store.dispatch(showPreloader({ payload: '' }));
    this.contratoService.baixarInconsistenciaImagem(protocolo).subscribe(response => {
      if (response.nomeArquivo) {
        this.downloadImagem(response);
      }

      this.store.dispatch(closePreloader());
    });
  }

  downloadImagem(response: BaixarInconsistenciaImagemResponse) {
    const decodedBase64 = decodeURIComponent(escape(window.atob(response.inconsistenciasBase64)));
    const link = document.createElement("a");
    const file = new Blob([decodedBase64], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = response.nomeArquivo;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  permissaoRevisao(row: UploadsRealizados) {
    if (+sessionStorage.getItem('empresaId') == row.empresaId) { return !this.permissoesConsulta?.editar; }
    return (this.permissoesConvidadoConsulta.findIndex(p => p.editar && p.empresaId == row.empresaId) == -1);
  }

  private verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesConsulta = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    let listaPermissoesConvidado = JSON.parse(localStorage.getItem('permissionsConvidado')) as PermissoesConvidados[];

    this.permissoesConsulta = listaPermissoes.filter(permissao => (permissao.palavraChave == 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS'))[0];
    this.permissoesConvidadoConsulta = this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS');

    if (!this.permissoesConsulta?.consultar && this.permissoesConvidadoConsulta.filter(p => p.consultar).length == 0) {
      this.router.navigate(['../']);
    }
  }

  private getPermissaoConvidado(listaPermissoes: PermissoesConvidados[], palavraChave: string): PermissoesConvidados[] {
    return listaPermissoes.filter(permissao => permissao.palavraChave == palavraChave);
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
