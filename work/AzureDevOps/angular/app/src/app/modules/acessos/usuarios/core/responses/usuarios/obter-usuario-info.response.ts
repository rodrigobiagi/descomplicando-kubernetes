import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterUsuarioInfoResponse extends BaseResponse {
  nomeUsuario: string;
  email: string;
  telefone: string;
  nomeEmpresa: string;
  empresaId: number;
  cnpjEmpresa: string;
}