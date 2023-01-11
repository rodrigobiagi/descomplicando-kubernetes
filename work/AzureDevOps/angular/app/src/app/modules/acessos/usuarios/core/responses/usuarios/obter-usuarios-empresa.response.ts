import { BaseResponse } from "src/app/core/responses/base.response";
import { UsuariosConvidados } from "../../models/usuarios/usuarios-convidados.model";

export class ObterUsuariosEmpresaResponse extends BaseResponse {
  usuariosConvidados: UsuariosConvidados[]; 
}