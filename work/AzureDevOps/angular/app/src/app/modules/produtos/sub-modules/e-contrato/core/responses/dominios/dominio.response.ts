import { BaseResponse } from "src/app/core/responses/base.response";
import { ValorDominio } from "../../models/dominios/valor-dominio.model";

export class DominioResponse extends BaseResponse {
    tipoDominio: string;
    valorDominio: ValorDominio[] = [];
}