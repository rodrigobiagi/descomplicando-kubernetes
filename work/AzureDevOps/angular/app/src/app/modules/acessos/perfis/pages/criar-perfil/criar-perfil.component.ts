import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Utility } from 'src/app/core/common/utility';
import { TipoElemento } from 'src/app/core/enums/tipo-elemento.enum';
import { DialogCommonComponent } from 'src/app/modules/produtos/sub-modules/e-contrato/components/dialog-common/dialog-common.component';
import { EmpresasUsuario } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/empresas/empresas-usuario.model';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Grupo } from '../../core/models/perfis/grupo.model';
import { Permissao } from '../../core/models/perfis/permissao.model';
import { CriarPerfilRequest } from '../../core/request/criar-perfil.request';
import { ObterPerfilResponse } from '../../core/response/obter-perfil.response';
import { EmpresasService } from '../../services/backoffice/empresas.service';
import { GrupoPermissaoService } from '../../services/backoffice/grupo-permissao.service';
import { PerfilService } from '../../services/backoffice/perfil.service';

@Component({
  selector: 'app-criar-perfil',
  templateUrl: './criar-perfil.component.html',
  styleUrls: ['./criar-perfil.component.scss']
})
export class CriarPerfilComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
    private grupoPermissaoService: GrupoPermissaoService,
    private perfilService: PerfilService,
    private activatedRoute: ActivatedRoute,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>,
    private router: Router,
    private empresaService: EmpresasService,
    public dialog: MatDialog) {
    this.perfilId = this.activatedRoute.snapshot.params['perfilId'];
  }

  perfilId: number = null;
  errorName: string = null;
  selectedEmpresa = null;
  empresas: EmpresasUsuario[];

  gruposList: Grupo[] = [];
  gruposListAux: Grupo[] = [];

  createPerfilForm = this.formBuilder.group({
    nome: ['', Validators.compose([Utility.isValidName()])],
    empresaId: null,
    descricao: '',
    convidado: false,
    ativo: true
  });

  permissoesPerfil: Permissao;

  changeConvidado: boolean = true;

  perfilModel: ObterPerfilResponse;

  ngOnInit(): void {
    this.verifyPermission();

    this.createPerfilForm.get('empresaId').patchValue(sessionStorage.getItem('empresaId'));
    this.createPerfilForm.get('convidado').valueChanges.subscribe(value => {
      if (!this.perfilModel) {
        this.changeGrupos(value)
        return;
      }

      if (!value && this.perfilModel.convidado) {
        this.verificaAlteracao();
        return;
      }

      this.changeGrupos(value)
    })

    if (this.perfilId) {
      this.carregaPerfil(this.perfilId);
      return;
    }

    this.carregaGruposPermissoes();
  }

  verificaAlteracao() {
    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: 'Atenção',
        text: 'Ao executar esta ação, qualquer usuário convidado que esteja atrelado a este perfil terá seu acesso removido. Tem certeza de que deseja prosseguir?',
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
        this.adicionarGrupos();
        return;
      }

      this.createPerfilForm.get('convidado').patchValue(true);
    });
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
      this.router.navigate(['./permissao-negada']);
      return;
    }
  }

  carregaGruposPermissoes() {
    this.grupoPermissaoService.obterGruposPermissoes().subscribe(response => {
      this.gruposList = response.grupos;
      this.gruposListAux = response.grupos;
    });
  }

  carregaPerfil(perfilId: number) {
    this.perfilService.obterPerfil(perfilId).subscribe(response => {
      this.perfilModel = response;
      this.createPerfilForm.setValue({
        empresaId: response.empresaId,
        nome: response.nome,
        descricao: response.descricao,
        convidado: response.convidado,
        ativo: response.ativo
      });

      this.gruposList = response.grupos;
      this.verificaGrupos(response.convidado);
    });
  }

  verificaGrupos(convidado: boolean = false) {
    this.grupoPermissaoService.obterGruposPermissoes().subscribe(response => {
      if (response.grupos.length > this.gruposList.length) {
        let gruposNovos: Grupo[] = [];
        if (convidado) { gruposNovos = response.grupos.filter(g => this.gruposList.every(l => l.id !== g.id && l.nome !== 'Dashboards' && l.nome != 'Contratos' && l.nome != 'Lotes')); }
        else { gruposNovos = response.grupos.filter(g => this.gruposList.every(l => l.id !== g.id)); }

        this.gruposList.push(...gruposNovos);
      }

      this.gruposListAux = this.gruposList;
      this.changeGrupos(convidado);
    });
  }

  onSubmit() {
    if (this.createPerfilForm.invalid) return;

    let criarPerfilRequest: CriarPerfilRequest = <CriarPerfilRequest>{
      empresaId: this.createPerfilForm.get('empresaId').value,
      nome: this.createPerfilForm.get('nome').value,
      descricao: this.createPerfilForm.get('descricao').value,
      convidado: this.createPerfilForm.get('convidado').value,
      ativo: this.createPerfilForm.get('ativo').value,
      grupoPermissoes: this.gruposList
    };

    this.store.dispatch(showPreloader({ payload: '' }));

    if (!this.perfilId) {
      this.empresaService.criarPerfil(criarPerfilRequest.empresaId, criarPerfilRequest).subscribe(response => {
        if (response.perfilId) {
          this.notifierService.showNotification('Perfil cadastrado com sucesso!', '', 'success');
          this.router.navigate(['../../perfis'], { relativeTo: this.activatedRoute });
          this.store.dispatch(closePreloader());
          return;
        }

        let message = this.getErrorMessage(response);
        this.notifierService.showNotification(message, '', 'error');
        this.store.dispatch(closePreloader());
      });

      return;
    }

    this.empresaService.atualizarPerfil(criarPerfilRequest.empresaId, this.perfilId, criarPerfilRequest).subscribe(response => {
      if (response.perfilId) {
        this.notifierService.showNotification('Perfil atualizado com sucesso!', '', 'success');
        this.router.navigate(['../../../perfis'], { relativeTo: this.activatedRoute });
        this.store.dispatch(closePreloader());
        return;
      }

      let message = this.getErrorMessage(response);
      this.notifierService.showNotification(message, '', 'error');
      this.store.dispatch(closePreloader());
    });
  }

  getErrorMessage(response: any) {
    let message = response.errors[0].message;
    if (response.errors[0].propertyName == 'Nome') {
      message = 'Nome de perfil já cadastrado no sistema.';
      this.errorName = 'O perfil não poderá receber este nome, tente novamente.';
      this.createPerfilForm.get('nome').setErrors({ 'incorrect': true });
    }
    return message;
  }

  checkAriaExpanded(tab: any) {
    return tab.panel._expanded;
  }

  isAllComplete(grupoId: number, permissao: string, completed: boolean = false) {
    if (completed) return true;

    let grupo = this.gruposList.filter(g => g.id == grupoId)[0];
    return grupo.permissoes != null && grupo.permissoes.every(p => p[permissao]);
  }

  updateAllComplete(grupoId: number, permissao: string, permissaoId: number) {
    let grupo = this.gruposList.filter(g => g.id == grupoId)[0];
    grupo.permissoes.filter(p => p.id == permissaoId)[0][permissao] = !grupo.permissoes.filter(p => p.id == permissaoId)[0][permissao];

    if (grupo.permissoes.filter(p => p.id == permissaoId)[0][permissao]) {
      if (permissao == 'editar') {
        grupo.permissoes.filter(p => p.id == permissaoId)[0].consultar = true;
      }
      if (permissao == 'admin') {
        grupo.permissoes.filter(p => p.id == permissaoId)[0].editar = true;
        grupo.permissoes.filter(p => p.id == permissaoId)[0].consultar = true;
      }

      return;
    }

    if (permissao == 'consultar') {
      grupo.permissoes.filter(p => p.id == permissaoId)[0].admin = false;
      grupo.permissoes.filter(p => p.id == permissaoId)[0].editar = false;
    }
    if (permissao == 'editar') {
      grupo.permissoes.filter(p => p.id == permissaoId)[0].admin = false;
    }
  }

  someComplete(grupoId: number, permissao: string): boolean {
    let grupo = this.gruposList.filter(g => g.id == grupoId)[0];
    if (grupo.permissoes == null) return false;

    return grupo.permissoes.filter(p => p[permissao]).length > 0 && !this.isAllComplete(grupoId, permissao);
  }

  setAll(completed: boolean, grupoId: number, permissao: string) {
    this.isAllComplete(grupoId, permissao, completed);
    let grupo = this.gruposList.filter(g => g.id == grupoId)[0];
    if (grupo.permissoes == null) return false;

    grupo.permissoes.forEach(p => (p[permissao] = completed));

    if (completed) {
      if (permissao == 'editar') {
        this.setAll(completed, grupoId, 'consultar');
      }
      if (permissao == 'admin') {
        this.setAll(completed, grupoId, 'editar');
        this.setAll(completed, grupoId, 'consultar');
      }

      return;
    }

    if (permissao == 'consultar') {
      this.setAll(completed, grupoId, 'admin');
      this.setAll(completed, grupoId, 'editar');
    }
    if (permissao == 'editar') {
      this.setAll(completed, grupoId, 'admin');
    }
  }

  isAllCompleteGroup(grupoId: number, completed: boolean = false) {
    if (completed) return true;

    let grupo = this.gruposList.filter(g => g.id == grupoId)[0];
    return grupo.permissoes != null && grupo.permissoes.every(p => p.admin) && grupo.permissoes.every(p => p.editar) && grupo.permissoes.every(p => p.consultar);
  }

  someCompleteGroup(grupoId: number): boolean {
    let grupo = this.gruposList.filter(g => g.id == grupoId)[0];
    if (grupo.permissoes == null) return false;

    return grupo.permissoes.filter(p => p.admin || p.editar || p.consultar).length > 0 && !this.isAllCompleteGroup(grupoId);
  }

  setAllGroup(completed: boolean, grupoId: number) {
    this.setAll(completed, grupoId, 'admin');
    this.setAll(completed, grupoId, 'editar');
    this.setAll(completed, grupoId, 'consultar');
  }

  changeGrupos(hide: boolean) {
    if (hide) {
      let grupos = this.gruposList.filter(grupo => grupo.nome != 'Dashboards' && grupo.nome != 'Contratos' && grupo.nome != 'Lotes').map(g => g.id);
      grupos.forEach(grupoId => { this.setAllGroup(false, grupoId); })
      this.gruposList = this.gruposList.filter(grupo => !grupos.includes(grupo.id));
      return;
    }

    this.gruposList = this.gruposListAux;
  }

  private adicionarGrupos() {
    this.grupoPermissaoService.obterGruposPermissoes().subscribe(response => {
      let gruposDefault = response.grupos.filter(grupo => grupo.nome != 'Dashboards' && grupo.nome != 'Contratos' && grupo.nome != 'Lotes');
      this.gruposList.push(...gruposDefault);
    });
  }

  public getElementId(tipoElemento: number, nomeElemento: string, guidElemento: any = null): string {
    return Utility.getElementId(<TipoElemento>tipoElemento, nomeElemento, guidElemento);
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
