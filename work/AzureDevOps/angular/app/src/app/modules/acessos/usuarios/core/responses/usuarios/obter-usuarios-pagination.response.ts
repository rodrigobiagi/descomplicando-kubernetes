import { Usuario } from "src/app/core/models/usuarios/usuario.model";
import { BaseResponse } from "src/app/core/responses/base.response";

export class ObterUsuariosPaginationResponse extends BaseResponse {
    pageIndex: number;
    totalItems: number;
    usuarios: Usuario[];
}