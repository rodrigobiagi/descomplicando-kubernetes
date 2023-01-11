import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Utility } from 'src/app/core/common/utility';
import { Usuario } from 'src/app/core/models/usuarios/usuario.model';
import { Documento } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/common/documento.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { UsuariosFiltro } from '../../core/models/usuarios/usuarios-filtro.model';
import { ObterUsuariosPaginationResponse } from '../../core/responses/usuarios/obter-usuarios-pagination.response';

import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { UsuariosService } from '../../services/backoffice/usuarios.service';
import { Permissao } from '../../../perfis/core/models/perfis/permissao.model';

@Component({
  selector: 'app-table-usuarios',
  templateUrl: './table-usuarios.component.html',
  styleUrls: ['./table-usuarios.component.scss']
})
export class TableUsuariosComponent implements OnInit {

  @Input('refreshGrid') set setRefreshGrid(value) {
    if (this.init) this.carregaGridUsuarios(value)
  }
  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridUsuarios(value)
  }
  @Output('atualizarGrids') atualizarGrids: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('paginator') paginator: MatPaginator;

  pesquisa: UsuariosFiltro = null;
  displayedColumns: string[] = [
    'nomeCompleto',
    'cpf',
    'email',
    'criadoEm',
    'modificadoEm',
    'status',
    'opcoes',
  ];
  usuarios: Usuario[] = [];
  dataSource = new MatTableDataSource(this.usuarios);
  totalRegistros: number = 0;
  usuario: Usuario;
  items$: Observable<Usuario[]>;
  totalItems = 0;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  sortListaUsuarios: string = '';
  init: boolean = false;
  readonly isLoadingResults$ = new BehaviorSubject(true);

  permissoesUsuario: Permissao;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd && val.urlAfterRedirects == '/usuarios';
      if (navEnd) { this.refresh$.next() }

    });
  }

  ngOnInit(): void {
    this.verifyPermission();
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesUsuario = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    this.permissoesUsuario = listaPermissoes.filter(permissao => (permissao.palavraChave == 'ACESSOS_USUARIOS'))[0];
  }

  ngAfterViewInit() {
    this.carregaGridUsuarios();
    this.init = true;
  }

  carregaGridUsuarios(filtros: UsuariosFiltro = null) {
    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarUsuarios(
          this.paginator.pageIndex,
          this.paginator.pageSize,
          filtros
        );
      }),
      map((result: { totalItems: number; usuarios: Usuario[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<Usuario>(result.usuarios);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.usuarios;
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

  listarUsuarios(pageIndex: number = 0, pageSize: number = 5, filtros: UsuariosFiltro): Observable<ObterUsuariosPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(filtros)
    return this.usuariosService.obterUsuarios(pageIndex, pageSize, filtro, this.sortListaUsuarios);
  }

  getParams(filtros: UsuariosFiltro = null) {
    const userGuid = sessionStorage.getItem('userGuid')
    const filtro = <UsuariosFiltro>{
      usuarioGuid: userGuid != null ? (userGuid != null ? userGuid : null) : null,
      nomeUsuario: filtros != null ? (filtros.nomeUsuario != null ? filtros.nomeUsuario : null) : null,
      cpf: filtros != null ? (filtros.cpf != null ? filtros.cpf : null) : null,
      status: filtros != null ? (filtros.status != null ? (filtros.status.length > 1 ? null : filtros.status[0]) : null) : null,
      de: filtros != null ? (filtros.de != null ? filtros.de : null) : null,
      ate: filtros != null ? (filtros.ate != null ? filtros.ate : null) : null,
    }

    return filtro;
  }

  formatDocumento() {
    return Documento.mascaraCPF();
  }

  formatDate(date: string) {
    return Utility.formatDate(date);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case "nomeCompleto":
        this.sortListaUsuarios = `primeiroNome.${sort.direction}`
        break;

      case "email":
        this.sortListaUsuarios = `email.${sort.direction}`
        break;

      case "cpf":
        this.sortListaUsuarios = `documento.${sort.direction}`
        break;

      case "status":
        this.sortListaUsuarios = `ativo.${sort.direction}`
        break;

      default:
        this.sortListaUsuarios = `${sort.active}.${sort.direction}`
        break;
    }

    this.listarUsuarios(0, 5, this.pesquisa);
    this.refresh$.next();
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  editarUsuario(usuarioGuid: string) {
    if (!this.permissoesUsuario.editar) return;

    this.router.navigate(['atualizar-usuario', usuarioGuid], {
      relativeTo: this.activatedRoute,
    });
  }

  inativarOuAtivarUsuario(usuarioId: string, ativo: boolean) {
    if (!this.permissoesUsuario.editar) return;

    this.store.dispatch(showPreloader({ payload: '' }))

    if (ativo) {
      this.usuariosService.inativarUsuario(usuarioId).subscribe((result) => {
        if (result.usuarioGuid) {
          this.notifierService.showNotification(
            'Usuário inativado.',
            'Sucesso',
            'success'
          );
          this.refresh$.next();
        }

        this.store.dispatch(closePreloader())
      });
      return;
    }

    this.usuariosService.ativarUsuario(usuarioId).subscribe((result) => {
      if (result.usuarioGuid) {
        this.notifierService.showNotification(
          'Usuário ativado.',
          'Sucesso',
          'success'
        );
        this.refresh$.next();
      }

      this.store.dispatch(closePreloader())
    });
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
