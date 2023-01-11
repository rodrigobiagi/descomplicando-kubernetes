import { MetadadoContrato } from "../../models/common/metadado-contrato.model";

export class RegistrarImagemRequest {
    imagemBase64: string;
    nomeArquivo: string;
    metadadoContrato?: MetadadoContrato;
}