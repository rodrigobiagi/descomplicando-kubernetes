import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ConfiguracoesModule } from "./configuracoes/configuracoes.module";
import { ProdutosModule } from "./produtos/produtos.module";
import { SuporteModule } from "./suporte/suporte.module";
import { AcessosModule } from "./acessos/acessos.module";
import { PermissaoRedirectComponent } from './permissao-redirect/permissao-redirect.component';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { RouterModule } from "@angular/router";
import { RelatoriosModule } from "./relatorios/relatorios.module";
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardModule } from "./dashboard/dashboard.module";

@NgModule({
    declarations: [
        PermissaoRedirectComponent
    ],
    imports: [
        CommonModule,
        ProdutosModule,
        ConfiguracoesModule,
        RelatoriosModule,
        SuporteModule,
        RouterModule,
        AcessosModule,
        MatButtonModule,
        MatCardModule,
        DashboardModule,
    ]
})
export class ModulesModule {}
