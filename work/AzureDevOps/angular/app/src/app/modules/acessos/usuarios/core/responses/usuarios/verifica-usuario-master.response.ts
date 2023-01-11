import { BaseResponse } from "src/app/core/responses/base.response";

export class VerificaUsuarioMasterResponse extends BaseResponse {
  ehUsuarioMaster: boolean;
  nomeEmpresa: string;
}