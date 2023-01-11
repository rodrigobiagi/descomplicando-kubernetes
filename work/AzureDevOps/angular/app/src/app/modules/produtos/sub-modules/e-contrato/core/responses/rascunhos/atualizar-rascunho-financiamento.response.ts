import { BaseResponse } from "src/app/core/responses/base.response";
import { Consorcio } from "../../models/contratos/consorcio.model";
import { LiberacaoCredito } from "../../models/contratos/liberacao-credito.model";

export class AtualizarRascunhoFinanciamentoResponse extends BaseResponse {
    valorTotalDivida: number;
    dataVencimentoPrimeiraParcela: string;
    dataVencimentoUltimaParcela: string;
    valorParcela: number;
    quantidadeParcela: number;
    municipioLiberacaoCredito: string;
    liberacaoCredito: LiberacaoCredito;
    consorcio: Consorcio;

    constructor() {
        super()
        this.liberacaoCredito = new LiberacaoCredito();
        this.consorcio = new Consorcio();
    }
}