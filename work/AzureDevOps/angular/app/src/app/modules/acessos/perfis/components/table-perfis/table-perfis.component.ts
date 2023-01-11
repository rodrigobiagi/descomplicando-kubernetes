import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Utility } from 'src/app/core/common/utility';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { PerfisFiltro } from '../../core/models/perfis/perfis-filtro.model';

import { Store } from '@ngrx/store';
import { BehaviorSubject, of, Subject, merge } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { EmpresasService } from '../../services/backoffice/empresas.service';
import { Perfis } from '../../../usuarios/core/models/empresas/perfis.model';
import { ObterPerfisResponse } from 'src/app/modules/produtos/sub-modules/e-contrato/core/responses/_backoffice/empresas/obter-perfis.response';
import { Permissao } from '../../core/models/perfis/permissao.model';


@Component({
  selector: 'app-table-perfis',
  templateUrl: './table-perfis.component.html',
  styleUrls: ['./table-perfis.component.scss']
})
export class TablePerfilComponent implements OnInit {

  constructor(
    private store: Store<{ preloader: IPreloaderState }>,
    private empresasService: EmpresasService
  ) {

    this.empresaId = parseInt(sessionStorage.getItem('empresaId'));
  }

  displayedColumnsPerfis: string[] = [
    'nome',
    'descricao',
    'criadoEm',
    'modificadoEm',
    'ativo',
    'acoes',
  ];

  @Input('refreshGrid') set setRefreshGrid(value) { this.carregaGridPerfis(); }
  @Input('filtro') set setFiltro(value) { this.carregaGridPerfis(value); }
  @Output('clickEditar') clickEditar: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild('paginatorPerfis') paginatorPerfis: MatPaginator;
  @ViewChild('tablePerfis') perfisSort: MatSort;

  itemsPerfis$: Observable<Perfis[]>;
  perfis: Perfis[] = [];
  dataSourcePerfis = new MatTableDataSource(this.perfis);
  refreshPerfis$ = new Subject();
  totalItemsPerfis = 0;

  empresaId: number = null;

  permissoesPerfil: Permissao;

  readonly isLoadingResultsPerfis$ = new BehaviorSubject(true);

  ngOnInit(): void {
    this.verifyPermission();
  }

  ngAfterViewInit() {
    this.carregaGridPerfis();
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesPerfil = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    this.permissoesPerfil = listaPermissoes.filter(permissao => (permissao.palavraChave == 'ACESSOS_PERFIS'))[0];
  }

  carregaGridPerfis(filtros: PerfisFiltro = null) {

    if (this.paginatorPerfis) { this.paginatorPerfis.pageIndex = 0; }

    this.itemsPerfis$ = merge(this.refreshPerfis$, (this.paginatorPerfis == undefined ? 0 : this.paginatorPerfis.page)).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResultsPerfis$.next(true);
        return this.listarPerfis(
          this.empresaId,
          this.paginatorPerfis?.pageIndex,
          this.paginatorPerfis?.pageSize,
          filtros
        );
      }),
      map((result: { totalItems: number; perfis: Perfis[] }) => {
        this.totalItemsPerfis = result.totalItems;
        this.perfis = result.perfis
        this.dataSourcePerfis = new MatTableDataSource<Perfis>(result.perfis);
        this.isLoadingResultsPerfis$.next(false);
        this.dataSourcePerfis.sort = this.perfisSort;

        this.store.dispatch(closePreloader())
        return result.perfis;
      }),
      catchError((err) => {
        this.isLoadingResultsPerfis$.next(false);
        console.info(err);
        this.store.dispatch(closePreloader())
        return of([]);
      })
    );
    this.itemsPerfis$.subscribe();
  }

  listarPerfis(empresaId: number, pageIndex: number, pageSize: number, filtros: PerfisFiltro = null): Observable<ObterPerfisResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(pageIndex, pageSize, filtros)
    return this.empresasService.obterPerfis(empresaId, filtro);
  }

  getParams(pageIndex: number = 0, pageSize: number = 25, filtros: PerfisFiltro = null) {
    let filtro = <PerfisFiltro>{
      De: filtros != null ? (filtros.De != null ? filtros.De : '') : '',
      Ate: filtros != null ? (filtros.Ate != null ? filtros.Ate : '') : '',
      Status: filtros != null ? (filtros.Status != null ? filtros.Status : '') : '',
      PalavraChave: filtros != null ? (filtros.PalavraChave != null ? filtros.PalavraChave : '') : '',
      PageIndex: pageIndex,
      PageSize: pageSize
    }

    return filtro;
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorPerfis.pageIndex = event.pageIndex;
    this.paginatorPerfis.pageSize = event.pageSize;
    this.paginatorPerfis.page.emit(event);
  }

  onClickEditar(id: number) {
    if (!this.permissoesPerfil.editar) return;
    
    this.clickEditar.emit(id);
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
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
