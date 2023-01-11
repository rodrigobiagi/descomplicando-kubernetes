import { BaseResponse } from "src/app/core/responses/base.response";
import { DadosRevisaoRascunho } from "../../models/rascunhos/dados-revisao-rascunho.model";

export class ObterRevisaoRascunhoResponse extends BaseResponse{
    categoria: string;
    dadosRevisaoRascunho: DadosRevisaoRascunho[] = [];
}