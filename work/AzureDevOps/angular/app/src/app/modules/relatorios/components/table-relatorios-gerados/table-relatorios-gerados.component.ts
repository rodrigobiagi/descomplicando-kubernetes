import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable, Subject, BehaviorSubject, merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Relatorios } from '../../core/models/relatorios/relatorios-model';
import { ObterRelatoriosResponse } from '../../core/responses/obter-relatorios.response';
import { RelatoriosService } from '../../services/relatorios.service';

@Component({
  selector: 'app-table-relatorios-gerados',
  templateUrl: './table-relatorios-gerados.component.html',
  styleUrls: ['./table-relatorios-gerados.component.scss']
})
export class TableRelatoriosGeradosComponent implements OnInit {

  @Input('refreshGrid') set setRefreshGrid(value) {
    if (this.init) {
      this.listarRelatorios(0,5);
      this.refresh$.next();
    }
  }
  @ViewChild('paginator') paginator: MatPaginator;

  init: boolean = false;

  items$: Observable<Relatorios[]>;
  relatorios: Relatorios[] = [];
  sortListaRelatorios: string = '';

  dataSource = new MatTableDataSource(this.relatorios);
  refresh$ = new Subject();
  totalItems = 0;

  readonly isLoadingResults$ = new BehaviorSubject(true);

  displayedColumns: string[] = [
    'nome',
    'tipo',
    'periodo',
    'dataSolicitacao',
    'dataDisponibilizacao',
    'geradoPor',
    'solicitadoPor',
    'status',
    'acoes',
  ];

  constructor(
    private relatoriosService: RelatoriosService,
    private store: Store<{ preloader: IPreloaderState }>
  ) { }

  refreshGrid: boolean = false;

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.carregaGridRelatorios();
    this.init = true;
  }

  carregaGridRelatorios() {
    this.items$ = merge(this.refresh$, this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults$.next(true);
        return this.listarRelatorios(
          this.paginator.pageIndex + 1,
          this.paginator.pageSize,
        );
      }),
      map((result: { totalItems: number; relatorios: Relatorios[] }) => {
        this.totalItems = result.totalItems;
        this.dataSource = new MatTableDataSource<Relatorios>(result.relatorios);
        this.isLoadingResults$.next(false);
        this.store.dispatch(closePreloader())

        return result.relatorios;
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

  listarRelatorios(pageIndex: number = 0, pageSize: number = 5): Observable<ObterRelatoriosResponse> {
    this.store.dispatch(showPreloader({ payload: '' }))
    return this.relatoriosService.obterRelatorios(pageIndex, pageSize, this.sortListaRelatorios);
  }

  syncPrimaryPaginator(event: PageEvent) {
    this.paginator.pageIndex = event.pageIndex;
    this.paginator.pageSize = event.pageSize;
    this.paginator.page.emit(event);
  }

  baixarRelatorio(url) {
    if(url) {
      window.open(url, '_blank').focus();
    }
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case "nome":
        this.sortListaRelatorios = `nome.${sort.direction}`;
        break;

      case "tipo":
        this.sortListaRelatorios = `tipo.${sort.direction}`
        break;

      case "periodo":
        this.sortListaRelatorios = `periodo.${sort.direction}`
        break;

      case "dataSolicitacao":
        this.sortListaRelatorios = `dataSolicitacao.${sort.direction}`
        break;

      case "dataDisponibilizacao":
        this.sortListaRelatorios = `dataDisponibilizacao.${sort.direction}`
        break;

      case "status":
        this.sortListaRelatorios = `status.${sort.direction}`
        break;

      case "geradoPor":
        this.sortListaRelatorios = `geradoPor.${sort.direction}`
        break;

      default:
        this.sortListaRelatorios = `${sort.active}.${sort.direction}`
        break;
    }

    this.listarRelatorios(0, 5);
    this.refresh$.next();
  }


  formatDate(date: string) {
    if (!date) {
      return null;
    }

    return moment(date).format('DD/MM/YYYY[\r\n]HH:mm');
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
  }
}
