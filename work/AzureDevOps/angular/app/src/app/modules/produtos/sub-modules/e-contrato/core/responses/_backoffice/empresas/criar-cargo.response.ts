import { BaseResponse } from "src/app/core/responses/base.response";

export class CriarCargoResponse extends BaseResponse {
    cargoId: number;
    nome: string;
}