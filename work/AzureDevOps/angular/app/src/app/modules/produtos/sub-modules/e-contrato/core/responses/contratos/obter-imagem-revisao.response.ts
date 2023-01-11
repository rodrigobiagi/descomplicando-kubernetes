import { BaseResponse } from "src/app/core/responses/base.response";
import { ImagemRevisaoContrato } from "../../models/upload-imagens/imagem-revisao-contrato.model";

export class ObterImagemRevisaoResponse extends BaseResponse {
  contratos: ImagemRevisaoContrato[];
}