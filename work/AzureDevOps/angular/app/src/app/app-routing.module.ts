import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissaoRedirectComponent } from './modules/permissao-redirect/permissao-redirect.component';

const routes: Routes = [
  {
    path: 'acessos',
    data: {
      breadcrumb: 'Acessos'
    },
    loadChildren: () => import('./modules/acessos/acessos.module').then(m => m.AcessosModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'produtos',
    loadChildren: () => import('./modules/produtos/produtos.module').then(m => m.ProdutosModule)
  },
  {
    path: 'configuracoes',
    loadChildren: () => import('./modules/configuracoes/configuracoes.module').then(m => m.ConfiguracoesModule)
  },
  {
    path: 'suporte',
    loadChildren: () => import('./modules/suporte/suporte.module').then(m => m.SuporteModule)
  },
  {
    path: 'relatorios',
    loadChildren: () => import('./modules/relatorios/relatorios.module').then(m => m.RelatoriosModule)
  },
  {
    path: 'permissao-negada',
    component: PermissaoRedirectComponent,
    data: {
      breadcrumb: 'Permissão negada'
    },
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
    data: {
      breadcrumb: 'Página inicial'
    },
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
