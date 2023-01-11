import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterUsuarioConvidadoResponse extends BaseResponse {
  empresaId: number;
  empresaIdConvidado: number;
  perfilId: number;
  usuarioId: number;
  nomeUsuario: string;
  email: string;
  ativo: boolean;
  cnpj: string;
  nomeEmpresa: string;
}