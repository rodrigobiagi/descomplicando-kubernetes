import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Usuario } from 'src/app/core/models/usuarios/usuario.model';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  nomeUsuario: string;
  menuActive: boolean = false;
  inicialUsuario: string;

  constructor(
    public authService: AuthService,
    private menuService: MenuService) { }

  ngOnInit(): void {
    this.authService.obterUsuarioAtual()
      .then((usuario: Usuario) => {
        this.nomeUsuario = usuario.nome.nomeCompleto;
        this.inicialUsuario = this.nomeUsuario.slice(0, 1);
      })

    this.menuService.activeMenu$.subscribe(menu => { this.menuActive = menu })
  }

  onActiveMenu() {
    this.menuActive = !this.menuActive;
    this.menuService.activateMenu(this.menuActive);
  }

}
