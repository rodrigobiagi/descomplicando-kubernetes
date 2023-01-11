import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Utility } from 'src/app/core/common/utility';
import { DialogCommonComponent } from 'src/app/modules/produtos/sub-modules/e-contrato/components/dialog-common/dialog-common.component';
import { EmpresasUsuario } from 'src/app/modules/produtos/sub-modules/e-contrato/core/models/empresas/empresas-usuario.model';
import { CriarCargoRequest } from 'src/app/modules/produtos/sub-modules/e-contrato/core/requests/_backoffice/empresas/criar-cargo.request';
import { CriarDepartamentoRequest } from 'src/app/modules/produtos/sub-modules/e-contrato/core/requests/_backoffice/empresas/criar-departamento.request';
import { BackofficeService } from 'src/app/modules/produtos/sub-modules/e-contrato/services/_backoffice/_backoffice.service';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Permissao } from '../../perfis/core/models/perfis/permissao.model';
import { Cargos } from '../core/models/empresas/cargos.model';
import { Departamentos } from '../core/models/empresas/departamentos.model';
import { UsuarioEmpresa } from '../core/models/usuarios/usuario-empresa.model';
import { CriarUsuarioEmpresaRequest } from '../core/requests/usuarios/criar-usuario-empresa.request';
import { UsuariosService } from '../services/backoffice/usuarios.service';

@Component({
  selector: 'app-criar-usuario',
  templateUrl: './criar-usuario.component.html',
  styleUrls: ['./criar-usuario.component.scss']
})
export class CriarUsuarioComponent implements OnInit {
  createUsuarioForm = this.formBuilder.group({
    empresaId: 1,
    nome: '',
    sobrenome: '',
    email: ['', Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")],
    cpf: '',
    telefone: '',
    ramal: '',
    perfil: { value: '', disabled: true },
    departamento: { value: '', disabled: true },
    cargo: { value: '', disabled: true },
    ativo: { value: true, disabled: true },
    novoDepartamento: [null],
    novoCargo: [null]
  });

  perfis;
  departamentos: Departamentos[];
  cargos: Cargos[];
  empresas: EmpresasUsuario[];

  selectedEmpresa = null;
  selectedPerfil = null;

  loggedUsuarioGuid: string = null;
  loggedEmpresaId: string = null;
  usuarioGuid: string = null;
  usuarioModel = null;

  permissoesUsuario: Permissao;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private backofficeService: BackofficeService,
    private notifierService: NotifierService,
    public dialog: MatDialog,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    this.loggedUsuarioGuid = sessionStorage.getItem('userGuid');
    this.loggedEmpresaId = sessionStorage.getItem('empresaId');
    this.usuarioGuid = this.activatedRoute.snapshot.params['usuarioGuid'];
  }

  ngOnInit(): void {
    this.verifyPermission();

    this.carregarEmpresasUsuario();

    if (this.usuarioGuid != null) {
      this.store.dispatch(showPreloader({ payload: '' }));
      Utility.waitFor(() => { this.carregarUsuario(); }, 5000);
    }
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesUsuario = this.getPermissaoMasterDefault();
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    this.permissoesUsuario = listaPermissoes.filter(permissao => (permissao.palavraChave == 'ACESSOS_USUARIOS'))[0];

    if (!this.permissoesUsuario.editar || (!this.usuarioGuid && !this.permissoesUsuario.admin)) {
      this.router.navigate(['./permissao-negada']);
      return;
    }
  }

  submitUsuario() {
    let usuario = <CriarUsuarioEmpresaRequest>{
      primeiroNome: this.createUsuarioForm.get('nome').value,
      sobrenome: this.createUsuarioForm.get('sobrenome').value,
      telefone: this.createUsuarioForm.get('telefone').value,
      ramal: this.createUsuarioForm.get('ramal').value,
      documento: this.createUsuarioForm.get('cpf').value,
      email: this.createUsuarioForm.get('email').value,
      ehMaster: false,
      perfilId: this.createUsuarioForm.get('perfil').value,
      departamentoId: this.createUsuarioForm.get('departamento').value,
      cargoId: this.createUsuarioForm.get('cargo').value,
      ativo: this.createUsuarioForm.get('ativo').value,
      empresaId: this.createUsuarioForm.get('empresaId').value
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if (!this.usuarioGuid) {
      this.usuariosService.criarUsuarioEmpresa(usuario)
        .toPromise().then((result) => {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          this.store.dispatch(closePreloader())
          this.notifierService.showNotification(
            'Usuário criado.',
            'Sucesso',
            'success'
          );
          this.store.dispatch(closePreloader())
          this.router.navigate(['../'], {
            relativeTo: this.activatedRoute,
          });
        },
        ).catch(result => {
          this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
          this.store.dispatch(closePreloader())
        }
        );

      return;
    }

    this.usuariosService.atualizarUsuario(this.usuarioGuid, usuario)
      .subscribe(result => {
        if (result) {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          if (this.usuarioModel.ativo == usuario.ativo) {
            this.atualizaUsuarioSucesso();
            return;
          }

          // this.ativarInativarUsuario(usuario);
        }
      }, error => { this.store.dispatch(closePreloader()) });
  }

  atualizaUsuarioSucesso() {
    this.store.dispatch(closePreloader())
    this.notifierService.showNotification(
      'Usuário atualizado.',
      'Sucesso',
      'success'
    );
    this.store.dispatch(closePreloader())
    this.router.navigate(['../../'], {
      relativeTo: this.activatedRoute,
    });
  }

  carregarUsuario() {
    this.usuariosService.obterUsuarioPorGuid(this.usuarioGuid, parseInt(this.loggedEmpresaId)).subscribe(result => {
      if (result.id) {
        this.usuarioModel = {
          empresaId: result.empresaId,
          id: result.id,
          perfil: result.perfil.id,
          usuarioGuid: result.usuarioGuid,
          primeiroNome: result.primeiroNome,
          sobrenome: result.sobrenome,
          nomeCompleto: result.nomeCompleto,
          email: result.email,
          ativo: result.ativo,
          criadoEm: result.criadoEm,
          modificadoEm: result.modificadoEm,
        };

        this.createUsuarioForm.setValue({
          empresaId: result.empresaId,
          nome: result.primeiroNome,
          sobrenome: result.sobrenome,
          email: result.email,
          cpf: result.documento,
          telefone: result.telefone,
          ramal: result.ramal,
          perfil: result.perfil.id,
          departamento: result.departamentoId,
          cargo: result.cargoId,
          ativo: result.ativo,
          novoDepartamento: null,
          novoCargo: null,
        });
      }

      this.createUsuarioForm.get('email').disable();

      this.store.dispatch(closePreloader())
    });
  }

  selectedEmpresaEvent(event) {
    if (event) {
      this.carregarPerfis();
      this.carregarDepartamentos();
      this.carregarCargos();

      this.createUsuarioForm.controls['perfil'].enable();
      this.createUsuarioForm.controls['cargo'].enable();
      this.createUsuarioForm.controls['departamento'].enable();
    } else {
      this.createUsuarioForm.controls['perfil'].disable();
      this.createUsuarioForm.controls['perfil'].reset();
      this.createUsuarioForm.controls['cargo'].disable();
      this.createUsuarioForm.controls['cargo'].reset();
      this.createUsuarioForm.controls['departamento'].disable();
      this.createUsuarioForm.controls['departamento'].reset();

    }
  }

  carregarEmpresasUsuario() {
    this.backofficeService.obterEmpresasUsuario(this.loggedUsuarioGuid).subscribe(result => {
      this.empresas = result.empresas;
    })
  }

  carregarDepartamentos() {
    this.backofficeService.obterDepartamentos(this.createUsuarioForm.get('empresaId').value).subscribe(result => {
      this.departamentos = result.departamentos;
    })
  }

  carregarCargos() {
    this.backofficeService.obterCargos(this.createUsuarioForm.get('empresaId').value).subscribe(result => {
      this.cargos = result.cargos;
    })
  }

  carregarPerfis() {
    const params = new HttpParams()
      .set('pageIndex', 0)
      .set('pageSize', 50)
      .set('Status', true)

    this.backofficeService
      .obterPerfis(this.createUsuarioForm.get('empresaId').value, params)
      .subscribe((result) => {
        this.perfis = result.perfis;
      });
  }


  novoDepartamento(departamentoId) {
    return this.departamentos?.filter(departamento => departamento.id == departamentoId)[0]?.nome == 'Outros';
  }

  novoCargo(cargoId) {
    return this.cargos?.filter(departamento => departamento.id == cargoId)[0]?.nome == 'Outros';
  }

  adicionarDepartamento(value) {
    this.backofficeService.criarDepartamento(this.createUsuarioForm.get('empresaId').value, <CriarDepartamentoRequest>{ nome: value }).subscribe(result => {
      if (result.departamentoId) {
        this.carregarDepartamentos();
        this.createUsuarioForm.get('departamento').setValue(result.departamentoId);
      }
    })
  }

  adicionarCargo(value) {
    this.backofficeService.criarCargo(this.createUsuarioForm.get('empresaId').value, <CriarCargoRequest>{ nome: value }).subscribe(result => {
      if (result.cargoId) {
        this.carregarCargos();
        this.createUsuarioForm.get('cargo').setValue(result.cargoId);
      }
    })
  }

  enviarUsuario() {
    if (this.usuarioGuid) {
      this.submitUsuario();
      return;
    }

    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: 'Cadastrar usuário',
        text: 'O usuário receberá um e-mail de definição de senha. Deseja continuar? ',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Cadastrar'
        }
      }
    })

    dialogRef.afterClosed().subscribe(confirmacao => {
      if (confirmacao) {
        this.submitUsuario();
      }
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
