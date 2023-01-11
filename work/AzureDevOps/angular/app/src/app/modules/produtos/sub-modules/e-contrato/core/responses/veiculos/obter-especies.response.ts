import { BaseResponse } from "src/app/core/responses/base.response";
import { Especie } from "../../models/veiculos/especie.model";

export class ObterEspeciesResponse extends BaseResponse {
    especies: Especie[] = [];
}