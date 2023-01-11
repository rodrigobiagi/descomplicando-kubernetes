import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogCustomComponent } from 'src/app/shared/components/dialog-custom/dialog-custom.component';
import { DialogSimpleComponent } from 'src/app/shared/components/dialog-simple/dialog-simple.component';
import { Permissao } from '../acessos/perfis/core/models/perfis/permissao.model';
import { DialogCommonComponent } from '../produtos/sub-modules/e-contrato/components/dialog-common/dialog-common.component';
import { PermissoesConvidados } from '../produtos/sub-modules/e-contrato/core/models/perfis/perfis-permissoes.model';
import { MatCarousel, MatCarouselComponent } from '@ngmodule/material-carousel'
import { BannerComunicacaoMKT } from './core/models/banner-comunicacao-mkt.model';
import { BannerBtn } from './core/models/banner-btn.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute) { }

  permissoesRegistroContrato: boolean;
  consultaContrato: boolean;
  envioLote: boolean;
  filtroGrafico: number;
  filtroPeriodo: number;

  bannerSlides: BannerComunicacaoMKT[] = [
    {
      img: './../../../../assets/img/e-contrato/banner.png',
      h5: 'Atleta patrocinado pela Tecnobank vai disputar Mundial de Paracanoagem em Portugal',
      btn: <BannerBtn[]>[
        {
          type: 'secondary',
          label: 'Saber mais',
          url: 'https://www.tecnobank.com.br/noticias/atleta-patrocinado-pela-tecnobank-vai-disputar-mundial-de-paracanoagem-em-portugal'
        },
        {
          type: 'outline-white',
          label: 'Explorar notícias',
          url: 'https://www.tecnobank.com.br/noticias'
        }
      ]
    },
    {
      img: './../../../../assets/img/e-contrato/banner.png',
      h5: 'Atleta patrocinado pela Tecnobank vai disputar Mundial de Paracanoagem em Portugal',
      btn: <BannerBtn[]>[
        {
          type: 'secondary',
          label: 'Saber mais',
          url: 'https://www.tecnobank.com.br/noticias/atleta-patrocinado-pela-tecnobank-vai-disputar-mundial-de-paracanoagem-em-portugal'
        },
        {
          type: 'outline-white',
          label: 'Explorar notícias',
          url: 'https://www.tecnobank.com.br/noticias'
        }
      ]
    },
    {
      img: './../../../../assets/img/e-contrato/banner.png',
      h5: 'Atleta patrocinado pela Tecnobank vai disputar Mundial de Paracanoagem em Portugal',
      btn: <BannerBtn[]>[
        {
          type: 'secondary',
          label: 'Saber mais',
          url: 'https://www.tecnobank.com.br/noticias/atleta-patrocinado-pela-tecnobank-vai-disputar-mundial-de-paracanoagem-em-portugal'
        },
        {
          type: 'outline-white',
          label: 'Explorar notícias',
          url: 'https://www.tecnobank.com.br/noticias'
        }
      ]
    }
  ];

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

    if (listaPermissoes.filter(permissao => permissao.palavraChave == 'PORTAL_DASHBOARDS' && permissao.consultar).length == 0) {
      this.router.navigate(['./permissao-negada']);
      return;
    }

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

  onClickAtalho(atalho: string) {
    let permissaoNegada = {
      width: '430px',
      data: {
        title: 'Você não tem permissão de fazer isto.',
        text: 'Contate o administrador do sistema para poder realizar esta ação.',
        buttonCancel: {
          value: false,
          text: 'Cancelar',
        },
        buttonConfirm: {
          value: true,
          text: 'Entendi'
        },
        disableCancelBtn: true
      }
    }

    switch (atalho) {
      case 'registrar-contrato':
        if (this.permissoesRegistroContrato) {
          this.router.navigate(['/produtos/e-contrato/registro-contrato'], { relativeTo: this.activatedRoute });
          return;
        }

        this.dialog.open(DialogCommonComponent, permissaoNegada);
        break;

      case 'enviar-lote':
        if (this.envioLote) {
          this.router.navigate(['/produtos/e-contrato/enviar-lote'], { relativeTo: this.activatedRoute });
          return;
        }

        this.dialog.open(DialogCommonComponent, permissaoNegada);
        break;

      case 'consultar-contrato':
        if (this.consultaContrato) {
          this.router.navigate(['/produtos/e-contrato/consultar-registro'], { relativeTo: this.activatedRoute });
          return;
        }

        this.dialog.open(DialogCommonComponent, permissaoNegada);
        break;
    }
  }

  filtroGraficoChanged(option: number) {
    this.filtroGrafico = option;
  }

  filtroPeriodoChanged(option: number) {
    this.filtroPeriodo = option;
  }

}
