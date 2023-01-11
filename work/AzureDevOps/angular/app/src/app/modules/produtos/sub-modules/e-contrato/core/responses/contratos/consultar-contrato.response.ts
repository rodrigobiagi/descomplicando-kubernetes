import { BaseResponse } from "src/app/core/responses/base.response";
import { MetadadoContrato } from "../../models/common/metadado-contrato.model";
import { ContratoComplementar } from "../../models/contratos/contrato-complementar.model";
import { Contrato } from "../../models/contratos/contrato.model";
import { Credor } from "../../models/contratos/credor.model";
import { Devedor } from "../../models/contratos/devedor.model";
import { Financiamento } from "../../models/contratos/financiamento.model";
import { Veiculo } from "../../models/contratos/veiculo.model";

export class ConsultarContratoResponse extends BaseResponse {
    requisitoContratoId: number;
    metadadoContrato: MetadadoContrato;
    contrato: Contrato;
    complementar: ContratoComplementar;
    veiculo: Veiculo[];
    financiamento: Financiamento;
    credor: Credor;
    devedor: Devedor;
}