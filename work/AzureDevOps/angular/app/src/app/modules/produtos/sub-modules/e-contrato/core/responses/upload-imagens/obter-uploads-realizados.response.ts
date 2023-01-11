import { BaseResponse } from "src/app/core/responses/base.response";
import { UploadsRealizados } from "../../models/upload-imagens/uploads-realizados.model";

export class ObterUploadsRealizadosResponse extends BaseResponse {
  transacoesImagens: UploadsRealizados[] = [];
  totalItems: number;
}