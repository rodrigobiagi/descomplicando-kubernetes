export class CriarRascunhoResumoRequest {
    operacaoId: number;
    numeroContrato: string;
    ufLicenciamento: string;
    tipoFormulario: number;
    protocoloOrigem: string;
    ehFrota?: boolean;
}