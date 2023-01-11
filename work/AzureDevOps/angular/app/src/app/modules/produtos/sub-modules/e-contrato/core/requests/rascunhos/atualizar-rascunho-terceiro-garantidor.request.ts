import { Contato } from "../../models/common/contato.model";
import { Documento } from "../../models/common/documento.model";
import { Endereco } from "../../models/common/endereco.model";

export class AtualizarRascunhoTerceiroGarantidorRequest {
    nomeTerceiroGarantidor: string;
    documento: Documento;
    endereco: Endereco;
    contato: Contato;

    constructor() {
        this.documento = new Documento();
        this.endereco = new Endereco();
        this.contato = new Contato();
    }
}