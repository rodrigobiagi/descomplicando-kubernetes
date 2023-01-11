import { Aditivo } from "../../models/contratos/aditivo.model";
import { Gravame } from "../../models/contratos/gravame.model";

export class AtualizarRascunhoContratoRequest {
    dataContrato: string;
    dataCompra: string;
    numeroTaxaDetran?: string;
    aditivo: Aditivo;
    gravame: Gravame;

    constructor() {
        this.aditivo = new Aditivo();
        this.gravame = new Gravame();
    }
}