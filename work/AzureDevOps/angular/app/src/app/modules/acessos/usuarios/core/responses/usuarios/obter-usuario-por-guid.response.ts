import { BaseResponse } from "src/app/core/responses/base.response";
import { Perfis } from "../../models/empresas/perfis.model";

export class ObterUsuarioPorGuidResponse extends BaseResponse {
    id: number;
    perfil: Perfis;
    usuarioGuid: string;
    primeiroNome: string;
    sobrenome: string;
    nomeCompleto: string;
    documento: string;
    email: string;
    ativo: boolean;
    recebeComunicados: boolean;
    telefone: string;
    ramal: string;
    departamentoId?: number;
    cargoId?: number;
    criadoEm: string;
    modificadoEm: string;
    empresaId: number;
}
