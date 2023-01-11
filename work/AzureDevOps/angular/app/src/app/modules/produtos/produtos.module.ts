import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ProdutosRoutingModule } from "./produtos-routing.module";
import { EcontratoModule } from "./sub-modules/e-contrato/e-contrato.module";
import { HomeProdutosComponent } from './pages/home-produtos/home-produtos.component';

@NgModule({
  declarations: [
    HomeProdutosComponent
  ],
  imports: [
    CommonModule,
    ProdutosRoutingModule,
    EcontratoModule,
  ]
})
export class ProdutosModule { }