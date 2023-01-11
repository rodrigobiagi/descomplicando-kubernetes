import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthService } from './core/auth/auth.service';
import { BackofficeService } from './modules/produtos/sub-modules/e-contrato/services/_backoffice/_backoffice.service';
import { closePreloader, showPreloader } from './shared/store/preloader/actions/preloader.actions';
import { IPreloaderState } from './shared/store/preloader/preloader.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private backofficeService: BackofficeService,
    private authService: AuthService,
    private store: Store<{ preloader: IPreloaderState }>) { }

  accessDenied: boolean = null;
  empresaId: number = null;
  userGuid: string = null;
  bloquear: boolean = false;

  ngOnInit() {
    this.authService.obterUsuarioAtual().then(usuario => {
      this.empresaId = usuario.empresaId;
      this.userGuid = usuario.id;

      this.verifyUsuarioMaster();
      this.verifyPermissionConvidado();

      this.getUsuarioInfo();
    });
  }

  verifyPermission() {
    this.backofficeService.obterPermissoesUsuario(this.empresaId, this.userGuid).subscribe(response => {
      localStorage.setItem('portalPermissions', JSON.stringify(response.permissoes));
      if (response.permissoes.length == 0 || response.permissoes.filter(permissao => permissao.consultar).length == 0) {
        this.bloquear = true;
        return;
      }

      this.accessDenied = false;
      this.store.dispatch(closePreloader());
    });
  }

  verifyUsuarioMaster() {
    this.store.dispatch(showPreloader({ payload: '' }))
    this.backofficeService.verificaUsuarioMaster(this.userGuid, this.empresaId).subscribe(response => {
      localStorage.setItem('ehmaster', JSON.stringify(response.ehUsuarioMaster));
      localStorage.setItem('empresa', response.nomeEmpresa);
      if (!response.ehUsuarioMaster) {
        this.verifyPermission();
        return;
      }
      this.store.dispatch(closePreloader());
    })
  }

  verifyPermissionConvidado() {
    this.backofficeService.obterPermissoesUsuarioConvidado(this.userGuid).subscribe(response => {
      localStorage.setItem('permissionsConvidado', JSON.stringify(response.permissoes));
      if (response.permissoes.length == 0 || response.permissoes.filter(permissao => permissao.consultar).length == 0) {
        if (this.bloquear) {
          this.denyAccess();
          return;
        }
      }

      this.accessDenied = false;
      this.store.dispatch(closePreloader());
    });
  }

  denyAccess() {
    this.store.dispatch(closePreloader());
    this.accessDenied = true;
    this.authService.logout(true);
  }

  getUsuarioInfo() {
    this.backofficeService.obterUsuarioInfo(this.userGuid, this.empresaId).subscribe(response => {
      localStorage.setItem('usuarioinfo', JSON.stringify(response));
    })
  }
}
