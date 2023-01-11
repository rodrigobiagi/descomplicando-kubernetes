import { Perfis } from "../empresas/perfis.model";

export class UsuarioEmpresa {
    id: number;
    perfil: Perfis;
    usuarioGuid: string;
    primeiroNome: string;
    sobrenome: string;
    nomeCompleto: string;
    email: string;
    ativo: boolean;
    recebeComunicados: boolean;
    criadoEm: string;
    modificadoEm: string;
}
