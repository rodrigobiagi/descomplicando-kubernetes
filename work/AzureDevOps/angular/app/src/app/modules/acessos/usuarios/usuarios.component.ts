import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Utility } from 'src/app/core/common/utility';

import { TipoFilterField } from 'src/app/shared/core/enums/tipo-filter-field.enum';
import { FieldOption } from 'src/app/shared/core/models/grid-filter/field-option.model';
import { FilterCustomField } from 'src/app/shared/core/models/grid-filter/filter-custom-field.model';
import { FilterField } from 'src/app/shared/core/models/grid-filter/filter-field.model';
import { GridFilter } from 'src/app/shared/core/models/grid-filter/grid-filter.model';
import { Documento } from '../../produtos/sub-modules/e-contrato/core/models/common/documento.model';
import { Permissao } from '../perfis/core/models/perfis/permissao.model';
import { UsuarioEmpresaGrupoEconomico } from './core/models/usuarios/usuario-empresa-grupo-economico.model';
import { UsuariosConvidadosFiltro } from './core/models/usuarios/usuarios-convidados-filtro.model';
import { UsuariosFiltro } from './core/models/usuarios/usuarios-filtro.model';
import { UsuariosService } from './services/backoffice/usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService
  ) {
    router.events.subscribe((val) => {
      let navEnd = (val instanceof NavigationEnd && val.urlAfterRedirects == '/usuarios');
      if (navEnd) {
        if (this.init) {
          this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
          this.refreshUsuarioConvidadoGrid = !this.refreshUsuarioConvidadoGrid;
        }
      }
    });
  }

  childstate: boolean = false;
  init: boolean = false;
  filterActive: boolean = false;
  atualizarGrid: boolean = false;
  showRedefinirUsuarioBtn: boolean = false;
  showRedefinirUsuarioConvidadoBtn: boolean = false;
  refreshUsuarioGrid: boolean = false;
  refreshUsuarioConvidadoGrid: boolean = false;
  usuarioAba: boolean = true;

  empresaId: number = +sessionStorage.getItem('empresaId');
  ehmaster: boolean = false;

  //#region Filtro Usuarios
  filtroUsuario: UsuariosFiltro = null;
  filterOptionPeriodo: FieldOption[] = [];
  fieldNome: FilterField = <FilterField>{ id: 'nomeUsuario', titulo: 'Por nome', tipo: TipoFilterField.Text, validators: Validators.minLength(3) };
  fieldDocumento: FilterField = <FilterField>{ id: 'cpf', titulo: 'Por CPF', tipo: TipoFilterField.Text, validators: Validators.minLength(3) };
  fieldPeriodo: FilterField = <FilterField>{
    id: 'Periodo', titulo: 'Por período', tipo: TipoFilterField.Period, options: this.filterOptionPeriodo, customFields: [
      <FilterCustomField>{ id: 'DataInicio' },
      <FilterCustomField>{ id: 'DataFim' }]
  };
  fieldStatus: FilterField = <FilterField>{
    id: 'status', titulo: 'Por status', tipo: TipoFilterField.Checkbox, selectAllOptions: 'Todos', options: [
      <FieldOption>{ value: true, label: 'Ativos' },
      <FieldOption>{ value: false, label: 'Inativos' }]
  };
  filter: GridFilter = <GridFilter>{
    id: 'usuarios',
    customFields: false,
    fields: [
      this.fieldNome,
      this.fieldDocumento,
      this.fieldPeriodo,
      this.fieldStatus
    ]
  }
  //#endregion

  //#region Filtro Usuarios Convidados
  filterOptionPerfil: FieldOption[] = [];
  listPerfilOptionsSelected: FieldOption[] = [];
  filterOptionEmpresa: FieldOption[] = [];
  listEmpresaOptionsSelected: FieldOption[] = [];

  empresaControl: FormControl;
  empresaSearchControl: FormControl;

  filtroUsuarioConvidado: UsuariosConvidadosFiltro = null;
  fieldNomeConvidado: FilterField = <FilterField>{ id: 'nomeUsuarioConvidado', titulo: 'Por nome', tipo: TipoFilterField.Text, validators: Validators.minLength(3) };
  fieldDocumentoConvidado: FilterField = <FilterField>{ id: 'cpfConvidado', titulo: 'Por CPF', tipo: TipoFilterField.Text, validators: Validators.minLength(3) };
  fieldPerfilConvidado: FilterField = <FilterField>{ id: 'perfilId', titulo: 'Por perfil', tipo: TipoFilterField.Checkbox, options: this.filterOptionPerfil, searchInput: false };
  fieldEmpresaConvidado: FilterField = <FilterField>{ id: 'empresaIdConvidado', titulo: 'Por empresa', tipo: TipoFilterField.Checkbox, options: this.filterOptionEmpresa, searchInput: false };
  filterConvidado: GridFilter = <GridFilter>{
    id: 'usuarios-convidados',
    customFields: false,
    fields: [
      this.fieldNomeConvidado,
      this.fieldDocumentoConvidado,
      this.fieldPerfilConvidado,
      this.fieldEmpresaConvidado
    ]
  }

  //#endregion

  permissoesUsuario: Permissao;

  ngOnInit(): void {
    this.ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;
    this.verifyPermission();
    this.carregarPerfisFiltro();
    this.carregarEmpresasFiltro();
  }

  ngAfterViewInit() {
    this.init = true;
  }

  verifyPermission() {
    if (this.ehmaster) {
      this.permissoesUsuario = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    this.permissoesUsuario = listaPermissoes.filter(permissao => (permissao.palavraChave == 'ACESSOS_USUARIOS'))[0];

    if (!this.permissoesUsuario.consultar) {
      this.router.navigate(['/permissao-negada']);
    }
  }

  redefinirFiltro() {
    this.filtroUsuario = null;
    this.refreshUsuarioGrid = !this.refreshUsuarioGrid;
    this.showRedefinirUsuarioBtn = false;
  }

  redefinirFiltroConvidado() {
    this.filtroUsuarioConvidado = null;
    this.refreshUsuarioConvidadoGrid = !this.refreshUsuarioConvidadoGrid;
    this.showRedefinirUsuarioConvidadoBtn = false;
  }

  search(event) {
    this.filtroUsuario = <UsuariosFiltro>{
      nomeUsuario: event.get('nomeUsuario'),
      cpf: event.get('cpf'),
      status: event.get('status'),
      de: event.get('De'),
      ate: event.get('Ate')
    }
    this.showRedefinirUsuarioBtn = true;
  }

  searchConvidados(event) {
    this.filtroUsuarioConvidado = <UsuariosConvidadosFiltro>{
      nome: event.get("nomeUsuarioConvidado"),
      cpf: event.get("cpfConvidado"),
      perfilId: event.get("perfilId"),
      empresaIdConvidado: event.get("empresaIdConvidado")
    }
    this.showRedefinirUsuarioConvidadoBtn = true;
  }

  criarUsuario() {
    if (!this.permissoesUsuario.admin) return;

    this.router.navigate(['criar-usuario'], {
      relativeTo: this.activatedRoute,
    });
  }

  criarUsuarioConvidado() {
    this.router.navigate(['convidar-usuario'], {
      relativeTo: this.activatedRoute,
    });
  }

  changeTab(usuario: any) {
    this.usuarioAba = usuario.index == 0;
  }

  private carregarPerfisFiltro() {
    this.usuariosService.obterPerfisConvidados(this.empresaId).subscribe(response => {
      if (response.isSuccessful) {
        let options = [];
        response.perfis.forEach(perfil => { options.push(<FieldOption>{ value: perfil.id, label: perfil.nome }); })
        this.filterConvidado.fields.filter(field => field.id == "perfilId")[0].options = options;
      }
    });
  }

  private carregarEmpresasFiltro() {
    this.usuariosService.obterEmpresasGrupoEconomico(this.empresaId).subscribe(response => {
      if (response.isSuccessful) {
        let options = [];
        response.empresas.forEach(empresa => { options.push(<FieldOption>{ value: empresa.id, label: this.getClienteNomeCnpj(empresa) }); })
        this.filterConvidado.fields.filter(field => field.id == "empresaIdConvidado")[0].options = options;
      }
    });
  }

  private getClienteNomeCnpj(cliente: UsuarioEmpresaGrupoEconomico) {
    let cnpj = <Documento>{ numero: cliente.cnpj, tipoDocumento: 2 };
    return `${cliente.name} (${Utility.formatDocument(cnpj)})`
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
