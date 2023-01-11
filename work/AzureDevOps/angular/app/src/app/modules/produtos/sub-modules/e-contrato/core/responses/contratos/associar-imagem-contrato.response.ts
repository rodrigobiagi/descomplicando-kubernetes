import { BaseResponse } from "src/app/core/responses/base.response";

export class AssociarImagemContratoResponse extends BaseResponse {
  dataTransacao: string;
  protocoloImagem: string;
  status: string;
}