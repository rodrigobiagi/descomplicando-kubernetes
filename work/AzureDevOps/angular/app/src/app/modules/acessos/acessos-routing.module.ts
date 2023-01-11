import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'usuarios',
    data: {
      breadcrumb: 'Usuários'
    },
    loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule)
  },
  {
    path: 'perfis',
    data: {
      breadcrumb: 'Perfis'
    },
    loadChildren: () => import('./perfis/perfis.module').then(m => m.PerfisModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcessosRoutingModule { }
