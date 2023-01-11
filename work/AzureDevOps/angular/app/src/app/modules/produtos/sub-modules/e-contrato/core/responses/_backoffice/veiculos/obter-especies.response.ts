import { BaseResponse } from "src/app/core/responses/base.response";
import { Especies } from "../../../models/veiculos/especies.model";

export class ObterEspeciesResponse extends BaseResponse {
    especies: Especies[];
}