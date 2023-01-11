import { DetalheBaixarCancelarContrato } from "./detalhe-baixar-cancelar-contrato.model";

export class TransacoesDetalhes {
    nomeUsuario: string;
    tipoDocumento: number;
    documento: string;
    tipoRestricao: number;
    numeroContrato: string;
    gravame: string;
    renavam: string;
    placa: string;
    codigoRetorno?: number;
    descricaoRetorno: string;
    tipoRestricaoDescricao: string;
    existeInconsistencia?: boolean;
    ultimoProtocolo: boolean;
    detalheBaixarCancelarContrato?: DetalheBaixarCancelarContrato;
    podeCancelar: boolean;
}