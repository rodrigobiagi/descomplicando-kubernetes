import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { stopInfoLoading } from 'src/app/shared/store/info-loading/actions/info-loading.actions';
import { IPreloaderState } from 'src/app/shared/store/preloader/preloader.reducer';
import { PermissoesConvidados } from '../../core/models/perfis/perfis-permissoes.model';

@Component({
  selector: 'app-gerenciar-registro',
  templateUrl: './gerenciar-registro.component.html',
  styleUrls: ['./gerenciar-registro.component.scss']
})
export class GerenciarRegistroComponent implements OnInit {

  childstate: boolean = false;
  permissoesRegistroContrato: boolean;

  constructor(private router: Router,
    private store: Store<{ preloader: IPreloaderState }>) {
    router.events.subscribe((val) => {
      let navEnd = val instanceof NavigationEnd;
      if (navEnd) {
        this.childstate = val['url'].split('registro-contrato')[1] !== '';
        if (!this.childstate) {
          this.store.dispatch(stopInfoLoading());
        }
      }
    });
  }

  ngOnInit(): void {
    this.verifyPermission();
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesRegistroContrato = true;
      return;
    }

    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    let listaPermissoesConvidado = JSON.parse(localStorage.getItem('permissionsConvidado')) as PermissoesConvidados[];

    this.permissoesRegistroContrato = listaPermissoes.filter(permissao =>
      (permissao.palavraChave == 'CONTRATO_REGISTRAR_CONTRATO' && permissao.consultar)
      || (permissao.palavraChave == 'CONTRATO_ALTERAR_CONTRATO' && permissao.consultar)
      || (permissao.palavraChave == 'CONTRATO_REGISTRAR_ADITIVO' && permissao.consultar)
      || (permissao.palavraChave == 'CONTRATO_ALTERAR_ADITIVO' && permissao.consultar)).length > 0

      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_ALTERAR_ADITIVO').length > 0)
      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_ALTERAR_CONTRATO').length > 0)
      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_REGISTRAR_ADITIVO').length > 0)
      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_ALTERAR_ADITIVO').length > 0);

      if (!this.permissoesRegistroContrato) {
        this.router.navigate(['./permissao-negada']);
      }
  }

  getPermissaoConvidado(listaPermissoes: PermissoesConvidados[], palavraChave: string): PermissoesConvidados[] {
    return listaPermissoes.filter(permissao => permissao.palavraChave == palavraChave && permissao.consultar);
  }

}
