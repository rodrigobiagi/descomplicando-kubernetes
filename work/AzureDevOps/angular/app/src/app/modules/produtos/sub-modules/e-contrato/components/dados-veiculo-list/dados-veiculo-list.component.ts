import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Utility } from 'src/app/core/common/utility';
import { SubSink } from 'subsink';
import { Veiculo } from '../../core/models/contratos/veiculo.model';
import { ContratoService } from '../../services/contrato.service';

@Component({
  selector: 'app-dados-veiculo-list',
  templateUrl: './dados-veiculo-list.component.html',
  styleUrls: ['./dados-veiculo-list.component.scss']
})
export class DadosVeiculoListComponent implements OnInit {

  constructor(private contratoService: ContratoService) { }

  displayedColumns: string[] = [
    'ufchassi',
    'acoes'
  ];

  veiculosList: Veiculo[];
  dataSource = new MatTableDataSource([]);
  totalItems: number = 0;
  items$: Observable<Veiculo[]>;

  private subscriptions = new SubSink();

  @ViewChild('paginator') paginator: MatPaginator;
  @Output('removerVeiculo') removerVeiculo: EventEmitter<number> = new EventEmitter<number>();
  @Output('editarVeiculo') editarVeiculo: EventEmitter<number> = new EventEmitter<number>();
  @Input() substituicaoGarantia: boolean = false;

  ngOnInit(): void {
    this.subscriptions.add(
      this.contratoService.veiculosAdicionados$.subscribe(value => {
        this.veiculosList = value;
        this.dataSource = new MatTableDataSource(this.veiculosList);
        this.totalItems = this.veiculosList.length;
        this.dataSource.paginator = this.paginator;
       })
    )
  }

  onClickEditarVeiculo(id: number) {
    this.editarVeiculo.emit(id);
  }

  onClickRemoverVeiculo(id: number) {
    this.removerVeiculo.emit(id);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(tipoElemento, nomeElemento, guidElemento);
  }


}
