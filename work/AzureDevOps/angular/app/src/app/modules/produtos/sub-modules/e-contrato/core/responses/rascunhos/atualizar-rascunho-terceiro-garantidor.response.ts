import { BaseResponse } from "src/app/core/responses/base.response";
import { Contato } from "../../models/common/contato.model";
import { Documento } from "../../models/common/documento.model";
import { Endereco } from "../../models/common/endereco.model";

export class AtualizarRascunhoTerceiroGarantidorResponse extends BaseResponse {
    nomeTerceiroGarantidor: string;
    documento: Documento;
    endereco:Endereco;
    contato: Contato;

    constructor() {
        super();
        this.documento = new Documento();
        this.endereco = new Endereco();
        this.contato = new Contato();
    }
}