import { Consorcio } from "../../models/contratos/consorcio.model";
import { LiberacaoCredito } from "../../models/contratos/liberacao-credito.model";

export class AtualizarRascunhoFinanciamentoRequest {
    valorTotalDivida: string;
    valorParcela: string;
    quantidadeParcela: number;
    dataVencimentoPrimeiraParcela: string;
    dataVencimentoUltimaParcela: string;
    municipioLiberacaoCredito: string;
    liberacaoCredito: LiberacaoCredito;
    consorcio: Consorcio;

    constructor() {
        this.liberacaoCredito = new LiberacaoCredito();
        this.consorcio = new Consorcio();
    }
}