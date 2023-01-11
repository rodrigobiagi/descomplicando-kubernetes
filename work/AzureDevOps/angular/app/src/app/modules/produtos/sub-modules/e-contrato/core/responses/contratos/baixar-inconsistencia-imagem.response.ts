import { BaseResponse } from "src/app/core/responses/base.response";

export class BaixarInconsistenciaImagemResponse extends BaseResponse {
  inconsistenciasBase64: string;
  nomeArquivo: string;
}