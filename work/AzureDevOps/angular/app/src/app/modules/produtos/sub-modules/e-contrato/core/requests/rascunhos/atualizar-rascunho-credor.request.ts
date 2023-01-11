import { Contato } from "../../models/common/contato.model";
import { Endereco } from "../../models/common/endereco.model";
import { AgenteFinanceiro } from "../../models/contratos/agente-financeiro.model";

export class AtualizarRascunhoCredorRequest {
    empresaId: number;
    agenteFinanceiro: AgenteFinanceiro;
    endereco: Endereco;
    contato: Contato;

    constructor() {
        this.agenteFinanceiro = new AgenteFinanceiro();
        this.endereco = new Endereco();
        this.contato = new Contato();
    }
}