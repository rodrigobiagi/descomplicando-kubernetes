import { BaseResponse } from "src/app/core/responses/base.response";
import { Modelos } from "../../../models/veiculos/modelos.model";

export class ObterModelosResponse extends BaseResponse {
    modelos: Modelos[];
}