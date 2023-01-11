import { BaseResponse } from "src/app/core/responses/base.response";
import { Endereco } from "../../models/common/endereco.model";

export class EnderecoResponse extends BaseResponse {
    endereco: Endereco;

    constructor() {
        super();
        this.endereco = new Endereco();
    }
}