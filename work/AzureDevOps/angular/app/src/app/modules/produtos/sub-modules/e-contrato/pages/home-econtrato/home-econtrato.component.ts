import { Component, OnInit } from '@angular/core';
import { LogLevel } from '@microsoft/signalr';
import { Store } from '@ngrx/store';
import { Console } from 'console';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { notificarRegistroContrato } from 'src/app/shared/store/notificacoes/notificacao-registro-contrato/actions/notificacao-registro-contrato.actions';
import { INotificacaoRegistroContratoState } from 'src/app/shared/store/notificacoes/notificacao-registro-contrato/notificacao-registro-contrato.reducer';
import { PermissoesConvidados } from '../../core/models/perfis/perfis-permissoes.model';

@Component({
  selector: 'app-home-econtrato',
  templateUrl: './home-econtrato.component.html',
  styleUrls: ['./home-econtrato.component.scss']
})
export class HomeEcontratoComponent implements OnInit {

  constructor() { }

  permissoesRegistroContrato: boolean;
  consultaContrato: boolean;
  envioLote: boolean;

  ngOnInit(): void {
    this.verifyPermission();
  }

  verifyPermission() {
    let ehmaster = JSON.parse(localStorage.getItem('ehmaster')) as boolean;

    if (ehmaster) {
      this.permissoesRegistroContrato = true;
      this.envioLote = true;
      this.consultaContrato = true;
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

    this.envioLote = listaPermissoes.filter(permissao =>
      (permissao.palavraChave == 'LOTE_ENVIO_LOTE_020' && permissao.consultar)
      || (permissao.palavraChave == 'LOTE_ENVIO_LOTE_040' && permissao.consultar)
      || (permissao.palavraChave == 'LOTE_ENVIO_LOTE_FUNCAO' && permissao.consultar)).length > 0

      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'LOTE_ENVIO_LOTE_020').length > 0)
      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'LOTE_ENVIO_LOTE_040').length > 0)
      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'LOTE_ENVIO_LOTE_FUNCAO').length > 0);

    this.consultaContrato = listaPermissoes.filter(permissao => (permissao.palavraChave == "CONTRATO_CONSULTAR_REGISTROS_CONTRATOS" && permissao.consultar)).length > 0
      || (this.getPermissaoConvidado(listaPermissoesConvidado, 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS').length > 0);
  }

  getPermissaoConvidado(listaPermissoes: PermissoesConvidados[], palavraChave: string): PermissoesConvidados[] {
    return listaPermissoes.filter(permissao => permissao.palavraChave == palavraChave && permissao.consultar);
  }
}
