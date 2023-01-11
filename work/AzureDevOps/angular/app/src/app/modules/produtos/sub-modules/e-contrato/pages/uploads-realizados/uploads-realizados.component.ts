import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { PermissoesConvidados } from '../../core/models/perfis/perfis-permissoes.model';
import { UploadsRealizadosFiltro } from '../../core/models/upload-imagens/uploads-realizados-filtro.model';
import { BaixarInconsistenciaImagemResponse } from '../../core/responses/contratos/baixar-inconsistencia-imagem.response';
import { DominioResponse } from '../../core/responses/dominios/dominio.response';
import { ContratoService } from '../../services/contrato.service';
import { DominioService } from '../../services/dominio.service';

@Component({
  selector: 'app-uploads-realizados',
  templateUrl: './uploads-realizados.component.html',
  styleUrls: ['./uploads-realizados.component.scss']
})
export class UploadsRealizadosComponent implements OnInit {

  constructor(private dominioService: DominioService,
    private router: Router,
    private contratoService: ContratoService,
    private store: Store<{ preloader: IPreloaderState }>) { }

  filtro = null;
  hasActive: boolean;
  refreshGrid: boolean = false;
  showRedefinirBtn: boolean = false;
  init: boolean = false;
  childstate: boolean = false;
  permissoesConsulta: Permissao;
  permissoesConvidadoConsulta: PermissoesConvidados[];

  //#region Filtro Perfis

  filterOptionPeriodo: FieldOption[] = [];
  filterOptionStatus: FieldOption[] = [];
  fieldPerfilPeriodo: FilterField = <FilterField>{
    id: 'Periodo', titulo: 'Por período', tipo: TipoFilterField.Period, options: this.filterOptionPeriodo, maxDays: 30, customFields: [
      <FilterCustomField>{ id: 'De' },
      <FilterCustomField>{ id: 'Ate' }]
  };
  fieldPerfilStatus: FilterField = <FilterField>{ id: 'StatusRegistroImagemMsgIds', titulo: 'Por status', tipo: TipoFilterField.Checkbox, selectAllOptions: 'Todos', options: this.filterOptionStatus };

  filter: GridFilter = <GridFilter>{
    customFields: false,
    fields: [
      this.fieldPerfilPeriodo,
      this.fieldPerfilStatus
    ]
  }
  //#endregion

  ngOnInit(): void {
    this.verifyPermission();
    this.carregarPeriodo();
    this.carregarImagemStatus();
  }

  redefinirFiltro() {
    this.filtro = null;
    this.refreshGrid = !this.refreshGrid;
    this.showRedefinirBtn = false;
  }

  search(event) {
    this.filtro = {
      CriadoEmInicio: event.get('De'),
      CriadoEmFim: event.get('Ate'),
      StatusRegistroImagemMsgIds: event.get('StatusRegistroImagemMsgIds')
    }

    this.showRedefinirBtn = true;
  }

  baixarRelatorio() {
    this.store.dispatch(showPreloader({ payload: '' }));

    const filtro = this.getParams(this.filtro)
    this.contratoService.baixarRelatorioInconsistenciasImg(filtro).subscribe(response => {
      if (response.nomeArquivo) {
        this.downloadImagem(response);
      }
      this.store.dispatch(closePreloader());
    });
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

  private downloadImagem(response: BaixarInconsistenciaImagemResponse) {
    const decodedBase64 = decodeURIComponent(escape(window.atob(response.inconsistenciasBase64)));
    const link = document.createElement("a");
    const file = new Blob([decodedBase64], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = response.nomeArquivo;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private getParams(filtros: UploadsRealizadosFiltro = null) {
    let filtro = <UploadsRealizadosFiltro>{
      CriadoEmInicio: filtros != null ? (filtros.CriadoEmInicio != null ? filtros.CriadoEmInicio : '') : '',
      CriadoEmFim: filtros != null ? (filtros.CriadoEmFim != null ? filtros.CriadoEmFim : '') : '',
      StatusRegistroImagemMsgIds: filtros != null ? (filtros.StatusRegistroImagemMsgIds != null ? filtros.StatusRegistroImagemMsgIds : '') : '',
    }

    return filtro;
  }

  private carregarPeriodo() {
    this.dominioService.obterPorTipo('PERIODO')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach(periodo => {
            this.filterOptionPeriodo.push(<FieldOption>{ value: periodo.palavraChave, label: periodo.valor });
          });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`)
        })
      },
        error => console.info(error)
      )
  }

  private carregarImagemStatus() {
    this.contratoService.obterImagemStatus().subscribe(response => {
      response.statusRegistroImagemMensagens.forEach(status => {
        this.filterOptionStatus.push(<FieldOption>{ value: status.id, label: status.mensagem });
      });
    })
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
