import { Documento } from "../../models/common/documento.model";

export class AtualizarRascunhoComplementarRequest {
    taxaContrato: string;
    taxaIof: string;
    taxaJurosMes: string;
    taxaJurosAno: string;
    indice: string;
    indicadorTaxaMora: boolean;
    valorTaxaMora: string;
    indicadorTaxaMulta: boolean;
    valorTaxaMulta: string;
    indicadorComissao: boolean;
    comissao: string;
    indicadorPenalidade: boolean;
    penalidade: string;
    nomeRecebedorPagamento: string;
    documentoRecebedor: Documento;
    documentoVendedor: Documento;
    comentario: string;

    constructor() {
        this.documentoRecebedor = new Documento();
        this.documentoVendedor = new Documento();
    }
}