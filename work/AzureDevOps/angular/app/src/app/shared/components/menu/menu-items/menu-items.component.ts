import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from 'src/app/shared/services/menu.service';
import { Menu } from '../menu.model';

@Component({
  selector: 'app-menu-items',
  templateUrl: './menu-items.component.html',
  styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent implements OnInit {

  constructor(private menuService: MenuService,
    private router: Router) { }

  activeMenuItem: boolean = false;
  menuItemId: string = null;

  @Input() menuItems: Menu[]
  @Input() thirdLevel: boolean = false;
  @Input('mouseEnter') set setMouseEnter(value) {
    this.menuItemId = value;
    this.onMouseEnter(value);
  }

  ngOnInit(): void {
    this.menuService.activeMenu$.subscribe(menu => {
      this.activeMenuItem = menu;
      if (!this.activeMenuItem) {
        let itemAtivo = this.menuItems?.filter(item => item.active)[0];
        if (itemAtivo) { itemAtivo.active = false; }
      }
    })
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
      if (menuItem.active) { this.menuItemId = menuItem.id; }
      else { this.menuItemId = null; }
    }
  }

  onMouseEnter(itemId: string) {
    if (itemId != null) {
      var element = document.querySelector<HTMLElement>('#' + itemId + ' ul.third-level')!;

      if (element != null) {
        if (itemId != null) {
          // mostra os itens do terceiro nivel
          var clone = element.cloneNode(true) as HTMLElement;
          clone.style.position = 'absolute';
          clone.style.visibility = 'hidden';
          clone.style.height = 'auto';
          clone.classList.add('slideClone');

          var body = document.querySelector<HTMLElement>('body')!;
          body.appendChild(clone);

          var slideCloneElement = document.querySelector(".slideClone") as HTMLElement;
          var newHeight = slideCloneElement.offsetHeight;

          document.querySelector(".slideClone").remove();
          element.style.height = newHeight + 'px';
          return;
        }

        // retorna o item ao estado original
        element.style.height = '0px';
      }
      return;
    }

    // retorna os itens ao estado original
    var elements = document.querySelectorAll('ul.third-level');

    for (let i = 0; i < elements.length; i++) {
      var elemento = elements[i] as HTMLElement;
      elemento.style.height = '0px';
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
