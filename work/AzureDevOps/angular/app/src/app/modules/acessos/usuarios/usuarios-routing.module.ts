import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { ConvidarUsuarioComponent } from './components/convidar-usuario/convidar-usuario.component';
import { CriarUsuarioComponent } from './criar-usuario/criar-usuario.component';

import { UsuariosComponent } from './usuarios.component';

const routes: Routes = [
  {
    path: '',
    component: UsuariosComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'criar-usuario',
    component: CriarUsuarioComponent,
    data: {
      breadcrumb: 'Incluir usuário'
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'atualizar-usuario/:usuarioGuid',
    component: CriarUsuarioComponent,
    data: {
      breadcrumb: 'Alterar usuário'
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'convidar-usuario',
    component: ConvidarUsuarioComponent,
    data: {
      breadcrumb: 'Convidar usuário'
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'atualizar-usuario-convidado/:id',
    component: ConvidarUsuarioComponent,
    data: {
      breadcrumb: 'Alterar usuário convidado'
    },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosRoutingModule { }
