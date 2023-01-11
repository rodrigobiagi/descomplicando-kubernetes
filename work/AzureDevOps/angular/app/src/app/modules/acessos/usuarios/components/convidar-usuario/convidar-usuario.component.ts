import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Utility } from 'src/app/core/common/utility';
import { NotifierService } from 'src/app/shared/components/notifier/notifier.service';
import { closePreloader, showPreloader } from 'src/app/shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { Permissao } from '../../../perfis/core/models/perfis/permissao.model';
import { PerfisConvidados } from '../../core/models/usuarios/perfis-convidados.model';
import { UsuarioEmpresaGrupoEconomico } from '../../core/models/usuarios/usuario-empresa-grupo-economico.model';
import { UsuariosConvidados } from '../../core/models/usuarios/usuarios-convidados.model';
import { ConvidarUsuarioRequest } from '../../core/requests/usuarios/convidar-usuario.request';
import { ObterUsuarioConvidadoResponse } from '../../core/responses/usuarios/obter-usuario-convidado.response';
import { UsuariosService } from '../../services/backoffice/usuarios.service';

@Component({
  selector: 'app-convidar-usuario',
  templateUrl: './convidar-usuario.component.html',
  styleUrls: ['./convidar-usuario.component.scss']
})
export class ConvidarUsuarioComponent implements OnInit {
  createUsuarioConvidadoForm = this.formBuilder.group({
    produto: { value: '0', disabled: true },
    empresaId: ['', Validators.required],
    usuarioId: [{ value: null, disabled: true }, Validators.required],
    perfilId: ['', Validators.required],
    nomeEmpresa: { value: '', disabled: true },
    nomeUsuario: { value: '', disabled: true },
  });

  perfis: PerfisConvidados[];
  empresas: UsuarioEmpresaGrupoEconomico[];
  usuarios: UsuariosConvidados[];

  selectedEmpresa = null;
  selectedPerfil = null;

  empresaId: number = null;
  usuarioConvidadoId: number = null;
  usuarioConvidadoModel: ObterUsuarioConvidadoResponse;

  permissoesUsuario: Permissao;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuariosService: UsuariosService,
    private notifierService: NotifierService,
    private store: Store<{ preloader: IPreloaderState }>
  ) {
    this.empresaId = +sessionStorage.getItem('empresaId');
    this.usuarioConvidadoId = this.activatedRoute.snapshot.params['id'] ? +this.activatedRoute.snapshot.params['id'] : null;
  }

  ngOnInit(): void {
    this.verifyPermission();

    this.carregarEmpresasUsuario();
    this.carregarPerfis();

    if (this.usuarioConvidadoId != null) {
      this.carregarUsuario();
      this.store.dispatch(showPreloader({ payload: '' }));
    }

    this.createUsuarioConvidadoForm.get('empresaId').valueChanges.subscribe(value => {
      if (!this.usuarioConvidadoId) { this.createUsuarioConvidadoForm.get('usuarioId').reset(); }

      if (value) {
        this.createUsuarioConvidadoForm.get('usuarioId').enable();
        this.filtrarUsuarios(value);
        return;
      }

      this.createUsuarioConvidadoForm.get('usuarioId').disable();
    })
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesUsuario = this.getPermissaoMasterDefault();
      return;
    }

    this.router.navigate(['./permissao-negada']);
  }

  submitUsuario() {
    let nomeUsuario = !this.usuarioConvidadoId ? this.usuarios.filter(usuario => usuario.id == this.createUsuarioConvidadoForm.get('usuarioId').value)[0].nome : this.createUsuarioConvidadoForm.get('nomeUsuario').value;
    let empresaConvidado = !this.usuarioConvidadoId ? this.empresas.filter(empresa => empresa.id == this.createUsuarioConvidadoForm.get('empresaId').value)[0].name : this.createUsuarioConvidadoForm.get('nomeEmpresa').value;

    let usuarioConvidado = <ConvidarUsuarioRequest>{
      usuarioId: this.createUsuarioConvidadoForm.get('usuarioId').value,
      perfilId: this.createUsuarioConvidadoForm.get('perfilId').value,
      empresaId: this.empresaId,
      empresaIdConvidado: this.createUsuarioConvidadoForm.get('empresaId').value,
    };

    this.store.dispatch(showPreloader({ payload: '' }))

    if (!this.usuarioConvidadoId) {
      this.usuariosService.criarUsuarioConvidado(usuarioConvidado)
        .toPromise().then((result) => {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          this.store.dispatch(closePreloader())
          this.notifierService.showNotification(
            `Acesso concedido ao usuário <strong>${nomeUsuario}</strong> da <strong>${empresaConvidado}</strong>!`,
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

    this.usuariosService.atualizarUsuarioConvidado(usuarioConvidado)
      .subscribe(result => {
        if (result) {
          if (result.errors) {
            this.notifierService.showNotification(result.errors[0].message, result.errors[0].code, 'error');
            this.store.dispatch(closePreloader())
            return;
          }

          this.notifierService.showNotification(
            `Acesso concedido ao usuário <strong>${nomeUsuario}</strong> da <strong>${empresaConvidado}</strong>!`,
            'Sucesso',
            'success'
          );
          this.store.dispatch(closePreloader())
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
          return;
        }
      }, error => { this.store.dispatch(closePreloader()) });
  }

  carregarUsuario() {
    this.usuariosService.obterUsuarioConvidado(this.usuarioConvidadoId).subscribe(result => {
      if (result.empresaId) {
        this.createUsuarioConvidadoForm.setValue({
          produto: '0',
          empresaId: result.empresaIdConvidado,
          usuarioId: result.usuarioId,
          perfilId: result.perfilId,
          nomeUsuario: result.nomeUsuario,
          nomeEmpresa: result.nomeEmpresa,
        });

        this.usuarioConvidadoModel = result;
      }
      this.store.dispatch(closePreloader())
    });
  }

  filtrarUsuarios(empresaIdConvidado: number) {
    this.usuariosService.obterUsuariosEmpresa(empresaIdConvidado).subscribe(response => { this.usuarios = response.usuariosConvidados; })
  }

  carregarEmpresasUsuario() {
    this.usuariosService.obterEmpresasGrupoEconomico(this.empresaId).subscribe(result => { this.empresas = result.empresas; })
  }

  carregarPerfis() {
    this.usuariosService.obterPerfisConvidados(this.empresaId).subscribe((result) => { this.perfis = result.perfis; });
  }

  formatCnpj(cnpj: string) {
    return Utility.formatCnpj(cnpj);
  }

  getOptionEmpresa(empresa: UsuarioEmpresaGrupoEconomico) {
    return `${empresa.name} - ${this.formatCnpj(empresa.cnpj)}`
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
