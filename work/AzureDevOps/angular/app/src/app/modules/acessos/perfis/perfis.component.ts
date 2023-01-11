import { Component, OnInit } from '@angular/core';
import { NavigationEnd, ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { DominioService } from '../../produtos/sub-modules/e-contrato/services/dominio.service';
import { DominioResponse } from '../../produtos/sub-modules/e-contrato/core/responses/dominios/dominio.response';
import { PerfisFiltro } from './core/models/perfis/perfis-filtro.model';
import { Permissao } from './core/models/perfis/permissao.model';

@Component({
  selector: 'app-perfis',
  templateUrl: './perfis.component.html',
  styleUrls: ['./perfis.component.scss']
})
export class PerfisComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dominioService: DominioService,
  ) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url']?.includes('incluir') || val['url']?.includes('editar');
        if (this.init && !this.childstate) {
          this.refreshPerfilGrid = !this.refreshPerfilGrid;
        }

      }
    })
    this.empresaId = +this.activatedRoute.snapshot.params['empresaId'];
  }

  filtroPerfil: PerfisFiltro = null;
  hasActivePerfil: boolean;
  refreshPerfilGrid: boolean = false;
  showRedefinirPerfilBtn: boolean = false;
  init: boolean = false;
  empresaId: number;
  childstate: boolean = false;

  permissoesPerfil: Permissao = <Permissao>{

  };

  //#region Filtro Perfis

  filterOptionPeriodo: FieldOption[] = [];

  fieldPerfilNome: FilterField = <FilterField>{ id: 'PalavraChave', titulo: 'Por nome do perfil', tipo: TipoFilterField.Text, validators: Validators.minLength(3) };
  fieldPerfilPeriodo: FilterField = <FilterField>{
    id: 'Periodo', titulo: 'Por período', tipo: TipoFilterField.Period, options: this.filterOptionPeriodo, customFields: [
      <FilterCustomField>{ id: 'De' },
      <FilterCustomField>{ id: 'Ate' }]
  };
  fieldPerfilStatus: FilterField = <FilterField>{
    id: 'areaStatus', titulo: 'Por status', tipo: TipoFilterField.Checkbox, selectAllOptions: 'Todos', options: [
      <FieldOption>{ value: true, label: 'Ativos' },
      <FieldOption>{ value: false, label: 'Inativos' }]
  };

  filter: GridFilter = <GridFilter>{
    id: 'perfis',
    customFields: false,
    fields: [
      this.fieldPerfilNome,
      this.fieldPerfilPeriodo,
      this.fieldPerfilStatus
    ]
  }
  //#endregion

  ngOnInit(): void {
    this.verifyPermission();
    this.carregarPeriodo();
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesPerfil = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    this.permissoesPerfil = listaPermissoes.filter(permissao => (permissao.palavraChave == 'ACESSOS_PERFIS'))[0];

    if (!this.permissoesPerfil.consultar) {
      this.router.navigate(['../']);
    }
  }

  ngAfterViewInit() {
    this.init = true;
  }

  obterPerfilPorId(perfilId: number) {
    if (!this.permissoesPerfil.editar) return;

    this.router.navigate(['editar-perfil', perfilId], {
      relativeTo: this.activatedRoute
    });
  }

  incluirPerfil() {
    if (!this.permissoesPerfil.admin) return;

    this.router.navigate(['incluir-perfil'], {
      relativeTo: this.activatedRoute
    });
  }

  redefinirFiltro() {
    this.filtroPerfil = null;
    this.refreshPerfilGrid = !this.refreshPerfilGrid;
    this.showRedefinirPerfilBtn = false;
  }

  search(event) {
    let status = event.get(this.fieldPerfilStatus.id);
    this.filtroPerfil = <PerfisFiltro>{
      De: event.get('De'),
      Ate: event.get('Ate'),
      Status: status ? (status.length > 1 ? null : status[0]) : null,
      PalavraChave: event.get(this.fieldPerfilNome.id)
    }

    this.showRedefinirPerfilBtn = true;
  }

  private carregarPeriodo() {
    this.dominioService.obterPorTipo('PERIODO')
      .subscribe((response: DominioResponse) => {
        if (response.isSuccessful) {
          response.valorDominio.forEach(periodo => { this.filterOptionPeriodo.push(<FieldOption>{ value: periodo.palavraChave, label: periodo.valor }); });
        }

        response.errors.forEach((error) => {
          console.info(`${error.code}-${error.message}`)
        })
      },
        error => console.info(error)
      )
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
