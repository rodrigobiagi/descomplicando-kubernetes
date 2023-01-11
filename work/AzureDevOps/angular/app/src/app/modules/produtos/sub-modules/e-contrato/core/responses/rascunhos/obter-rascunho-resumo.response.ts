import { BaseResponse } from "src/app/core/responses/base.response";
import { RascunhoResumo } from "../../models/rascunhos/rascunho-resumo.model";

export class ObterRascunhoResumoResponse extends BaseResponse {
    rascunho: RascunhoResumo;

    constructor() {
        super();
        this.rascunho = new RascunhoResumo();
    }
}