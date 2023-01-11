import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/core/guards/auth.guard";

import { HomeProdutosComponent } from "./pages/home-produtos/home-produtos.component";

const routes: Routes = [
    {
        path: '',
        component: HomeProdutosComponent,
        data: {
            breadcrumb: 'Produtos'
        },
        canActivate: [AuthGuard]
    },
    {
        path: 'e-contrato',
        loadChildren: () => import('./sub-modules/e-contrato/e-contrato.module').then(m => m.EcontratoModule)
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProdutosRoutingModule { }