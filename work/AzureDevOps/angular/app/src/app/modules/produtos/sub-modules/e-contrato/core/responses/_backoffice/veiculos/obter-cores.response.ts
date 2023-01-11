import { BaseResponse } from "src/app/core/responses/base.response";
import { Cores } from "../../../models/veiculos/cores.model";

export class ObterCoresResponse extends BaseResponse {
    cores: Cores[];
}