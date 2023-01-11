import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permissao } from 'src/app/modules/acessos/perfis/core/models/perfis/permissao.model';
import { MenuService } from '../../services/menu.service';
import { Menu } from './menu.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(
    private menuService: MenuService,
    private eRef: ElementRef,
    private router: Router) { }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target) && event.path.find(p => p.className == 'sidebar') == undefined) {
      if (event.path.find(classe => classe.id == 'menuHamburger') == undefined) {
        if (this.activeMenu) { this.menuService.activateMenu(false); }
      }
    }
  }

  activeMenu: boolean = false;
  activeMenuItems: Menu[] = [];

  menuItems: Menu[] = [
    {
      id: 'DASHBOARD',
      icon: 'fa-regular fa-objects-column',
      label: 'Dashboard',
      active: false,
      link: '/dashboard'
    },
    {
      id: 'PRODUTOS',
      icon: 'fa-regular fa-layer-group',
      label: 'Produtos',
      active: false,
      link: '',
      child: [
        {
          id: 'ECONTRATO',
          label: 'eContrato',
          active: false,
          link: '/produtos/e-contrato',
          parentId: 'PRODUTOS',
          child: [
            {
              id: 'CONTRATO',
              label: 'Registro de contrato',
              active: false,
              link: '/produtos/e-contrato/registro-contrato',
              parentId: 'ECONTRATO'
            },
            {
              id: 'LOTE',
              label: 'Enviar lote',
              active: false,
              link: '/produtos/e-contrato/enviar-lote',
              parentId: 'ECONTRATO'
            },
            {
              id: 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS',
              label: 'Consultar contrato',
              active: false,
              link: '/produtos/e-contrato/consultar-registro',
              parentId: 'ECONTRATO'
            },
            {
              id: 'CONTRATO_UPLOAD_IMAGENS',
              label: 'Upload de imagens',
              active: false,
              link: '/produtos/e-contrato/upload-imagens',
              parentId: 'ECONTRATO'
            },
            {
              id: 'CONTRATO_UPLOADS_REALIZADOS',
              label: 'Uploads realizados',
              active: false,
              link: '/produtos/e-contrato/uploads-realizados',
              parentId: 'ECONTRATO'
            }
          ]
        }
      ],
    },
    {
      id: 'ACESSOS',
      icon: 'fa-regular fa-user-large',
      label: 'Acessos',
      active: false,
      link: '',
      child: [
        {
          id: 'ACESSOS_USUARIOS',
          label: 'Usuários',
          active: false,
          link: '/acessos/usuarios',
          parentId: 'ACESSOS'
        },
        {
          id: 'ACESSOS_PERFIS',
          label: 'Perfis',
          active: false,
          link: '/acessos/perfis',
          parentId: 'ACESSOS'
        }
      ]
    },
    {
      id: 'RELATORIOS',
      icon: 'fa-solid fa-chart-mixed',
      label: 'Relatórios',
      active: false,
      link: '',
      child: [
        {
          id: 'RELATORIOS_GERADOS',
          label: 'Relatórios gerados',
          active: false,
          link: '/relatorios',
          parentId: 'RELATORIOS'
        },
      ]
    },
    {
      id: 'CONFIGURACOES',
      icon: 'fa-regular fa-gear',
      label: 'Configurações',
      active: false,
      link: '/'
    },
    {
      id: 'SUPORTE',
      icon: 'fa-regular fa-message-question',
      label: 'Suporte',
      active: false,
      link: '/'
    },
  ];

  ngOnInit(): void {
    this.menuService.activeMenu$.subscribe(menu => {
      this.activeMenu = menu;
      if (!this.activeMenu) {
        let itemAtivo = this.menuItems.filter(item => item.active)[0];
        if (itemAtivo) { itemAtivo.active = false; }
      }
    });
  }

  setMenuItems() {
    let listaPermissoes = JSON.parse(localStorage.getItem('portalPermissions')) as Permissao[];
    let menuItems = [];

    let dashboard = listaPermissoes.filter(permissao => (permissao.palavraChave == 'DASHBOARD' && permissao.consultar)).length > 0;
    let produtos = this.showMenuItem(listaPermissoes, 'CONTRATO') || this.showMenuItem(listaPermissoes, 'LOTE');
    let acessos = this.showMenuItem(listaPermissoes, 'ACESSOS');

    if (dashboard) { menuItems.push(this.menuItems.filter(menu => menu.id == 'DASHBOARD')[0]); }

    if (produtos) {
      let eContratoItems = this.menuItems.filter(i => i.id == 'PRODUTOS')[0].child.filter(i => i.id == 'ECONTRATO')[0].child;

      if (!this.showMenuSubItem(listaPermissoes, 'CONTRATO_REGISTRAR_CONTRATO')
        && !this.showMenuSubItem(listaPermissoes, 'CONTRATO_ALTERAR_ADITIVO')
        && !this.showMenuSubItem(listaPermissoes, 'CONTRATO_REGISTRAR_ADITIVO')
        && !this.showMenuSubItem(listaPermissoes, 'CONTRATO_ALTERAR_CONTRATO')) {
        eContratoItems = this.removeMenuSubItem(eContratoItems, 'CONTRATO');
      }

      if (!this.showMenuSubItem(listaPermissoes, 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS')) {
        eContratoItems = this.removeMenuSubItem(eContratoItems, 'CONTRATO_CONSULTAR_REGISTROS_CONTRATOS');
      }

      if (!this.showMenuSubItem(listaPermissoes, 'LOTE_ENVIO_LOTE_020')
        && !this.showMenuSubItem(listaPermissoes, 'LOTE_ENVIO_LOTE_040')
        && !this.showMenuSubItem(listaPermissoes, 'LOTE_ENVIO_LOTE_FUNCAO')) {
        eContratoItems = this.removeMenuSubItem(eContratoItems, 'LOTE');
      }

      if (eContratoItems.length > 0) {
        this.menuItems.filter(menu => menu.id == 'PRODUTOS')[0].child.filter(i => i.id == 'ECONTRATO')[0].child = eContratoItems;
        menuItems.push(this.menuItems.filter(menu => menu.id == 'PRODUTOS')[0]);
      }
    }

    if (acessos) {
      let acessosItems = this.menuItems.filter(i => i.id == 'ACESSOS')[0].child;

      if (!this.showMenuSubItem(listaPermissoes, 'ACESSOS_USUARIOS')) {
        acessosItems = this.removeMenuSubItem(acessosItems, 'ACESSOS_USUARIOS');
      }

      if (!this.showMenuSubItem(listaPermissoes, 'ACESSOS_PERFIS')) {
        acessosItems = this.removeMenuSubItem(acessosItems, 'ACESSOS_PERFIS');
      }

      if (acessosItems.length > 0) {
        this.menuItems.filter(menu => menu.id == 'ACESSOS')[0].child = acessosItems;
        menuItems.push(this.menuItems.filter(menu => menu.id == 'ACESSOS')[0]);
      }
    }

    this.activeMenuItems = menuItems;
  }

  private showMenuItem(listaPermissoes: Permissao[], item: string) {
    return listaPermissoes.filter(p => p.palavraChave.startsWith(`${item}_`) && p.consultar).length > 0;
  }

  private showMenuSubItem(listaPermissoes: Permissao[], item: string) {
    return listaPermissoes.filter(p => p.palavraChave == item && p.consultar).length > 0;
  }

  private removeMenuSubItem(menuList: Menu[], item: string) {
    return menuList.filter(i => i.id !== item);
  }

  toggleItem(itemId: string) {
    let menuItem = this.menuItems.filter(item => item.id == itemId)[0];
    if (menuItem.child != null) {
      if (!menuItem.active) {
        let itemAtivo = this.menuItems.filter(item => item.id != itemId && item.id != menuItem.parentId && item.active)[0];
        if (itemAtivo != undefined) { itemAtivo.active = false; }

        this.menuService.activateMenu(true);
      }

      this.menuItems.filter(item => item.id == itemId)[0].active = !menuItem.active;
    }
  }

  clickLink(event, menuItem: Menu) {
    if (event.path.find(p => p.classList?.contains('arrow-child')) == undefined) {
      if (menuItem.link == '') {
        this.toggleItem(menuItem.id);
        return;
      }

      this.router.navigate([`${menuItem.link}`]);
      this.menuService.activateMenu(false);
    }
  }
}

