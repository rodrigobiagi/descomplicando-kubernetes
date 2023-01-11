import { MetadadoContrato } from "../../models/common/metadado-contrato.model";

export class CancelarBaixarContratoRequest {
  protocolo: string;
  baixarContrato: boolean;
  cancelarContrato: boolean;
  metadadoContrato: MetadadoContrato;
}