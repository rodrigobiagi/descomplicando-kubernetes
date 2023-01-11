import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { DialogCommonComponent } from 'src/app/modules/produtos/sub-modules/e-contrato/components/dialog-common/dialog-common.component';
import { Documento } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/common/documento.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { UsuariosConvidadosFiltro } from '../../core/models/usuarios/usuarios-convidados-filtro.model';
import { UsuariosConvidados } from '../../core/models/usuarios/usuarios-convidados.model';
import { ObterUsuariosConvidadosPaginationResponse } from '../../core/responses/usuarios/obter-usuarios-convidados-pagination.response';
import { UsuariosService } from '../../services/backoffice/usuarios.service';

@Component({
  selector: 'app-table-usuarios-convidados',
  templateUrl: './table-usuarios-convidados.component.html',
  styleUrls: ['./table-usuarios-convidados.component.scss']
})
export class TableUsuariosConvidadosComponent implements OnInit {

  @Input('refreshGrid') set setRefreshGrid(value) {
    if (this.init) this.carregaGridUsuarios(value)
  }
  @Input('filtro') set setFiltro(value) {
    if (this.init) this.carregaGridUsuarios(value)
  }
  @Output('atualizarGrids') atualizarGrids: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('paginatorConvidados') paginatorConvidados: MatPaginator;

  pesquisa: UsuariosConvidadosFiltro = null;
  displayedColumns: string[] = [
    'nome',
    'cpf',
    'email',
    'dataLiberacao',
    'nomePerfil',
    'nomeEmpresa',
    'opcoes',
  ];
  usuariosConvidados: UsuariosConvidados[] = [];
  totalRegistros: number = 0;
  usuarioConvidado: UsuariosConvidados;
  items$: Observable<UsuariosConvidados[]>;
  totalItems = 0;
  refresh$ = new Subject();
  pipe = new DatePipe('en-US');
  sortListaUsuarios: string = '';
  init: boolean = false;
  readonly isLoadingResults$ = new BehaviorSubject(true);
  empresaId: number = +sessionStorage.getItem('empresaId');
  nomeEmpresa: string = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private store: Store<{ preloader: IPreloaderState }>,
    private notifierService: NotifierService,
    public dialog: MatDialog
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd && val.urlAfterRedirects == '/usuarios';
      if (navEnd) { this.refresh$.next() }
    });
  }

  ngOnInit(): void {
    this.nomeEmpresa = localStorage.getItem('empresa');
   }

  ngAfterViewInit() {
    this.carregaGridUsuarios();
    this.init = true;
  }

  carregaGridUsuarios(filtros: UsuariosConvidadosFiltro = null) {
    this.items$ = merge(this.refresh$, this.paginatorConvidados.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarUsuarios(
          this.paginatorConvidados.pageIndex,
          this.paginatorConvidados.pageSize,
          filtros
        );
      }),
      map((result: { totalItems: number; usuarios: UsuariosConvidados[] }) => {
        if (result.totalItems) this.totalItems = result.totalItems;

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

  listarUsuarios(pageIndex: number = 0, pageSize: number = 25, filtros: UsuariosConvidadosFiltro): Observable<ObterUsuariosConvidadosPaginationResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    const filtro = this.getParams(filtros, pageIndex, pageSize);
    return this.usuariosService.obterUsuariosConvidados(this.empresaId, filtro);
  }

  getParams(filtros: UsuariosConvidadosFiltro = null, pageIndex: number = 0, pageSize: number = 25) {
    let cpf = filtros?.cpf;
    if (cpf) cpf = this.removeSpecialChar(cpf);

    const filtro = <UsuariosConvidadosFiltro>{
      nome: filtros != null ? (filtros.nome != null ? filtros.nome : '') : '',
      cpf: cpf != null ? cpf : '',
      perfilId: filtros != null ? (filtros.perfilId != null ? filtros.perfilId : '') : '',
      empresaIdConvidado: filtros != null ? (filtros.empresaIdConvidado != null ? filtros.empresaIdConvidado : '') : '',
      pageIndex: pageIndex,
      pageSize: pageSize,
      sort: this.sortListaUsuarios
    }

    return filtro;
  }

  removeSpecialChar(cpf: string): string {
    return cpf.replace('.', '').replace('.', '').replace('-', '');
  }

  formatDocumento() {
    return Documento.mascaraCPF();
  }

  formatDate(date: string) {
    return Utility.formatGridDate(date);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case "nome":
        this.sortListaUsuarios = `nome.${sort.direction}`
        break;

      case "email":
        this.sortListaUsuarios = `email.${sort.direction}`
        break;

      case "cpf":
        this.sortListaUsuarios = `cpf.${sort.direction}`
        break;

      default:
        this.sortListaUsuarios = `${sort.active}.${sort.direction}`
        break;
    }

    this.listarUsuarios(0, 25, this.pesquisa);
    this.refresh$.next();
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginatorConvidados.pageIndex = event.pageIndex;
    this.paginatorConvidados.pageSize = event.pageSize;
    this.paginatorConvidados.page.emit(event);
  }

  editarUsuarioConvidado(usuarioId: string) {
    this.router.navigate(['atualizar-usuario-convidado', usuarioId], { relativeTo: this.activatedRoute, });
  }

  excluirUsuarioConvidado(usuario: UsuariosConvidados) {
    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: 'Atenção',
        text: `Esta ação irá remover todos os acessos do usuário ${usuario.nome} na empresa ${this.nomeEmpresa}. Tem certeza de que deseja prosseguir?`,
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Confirmar'
        }
      }
    })

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.excluir(usuario.id);
        return;
      }
    });
  }

  excluir(usuarioId: number) {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.usuariosService.excluirUsuarioConvidado(usuarioId).subscribe(response => {
      if (!response.errors) {
        this.notifierService.showNotification(`Usuário convidado excluído!`, 'Sucesso', 'success');
        this.refresh$.next();
      }
      this.store.dispatch(closePreloader())
    })
  }
}
