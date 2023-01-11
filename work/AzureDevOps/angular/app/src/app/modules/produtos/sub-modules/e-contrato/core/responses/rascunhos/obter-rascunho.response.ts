import { BaseResponse } from "src/app/core/responses/base.response";
import { ContratoComplementar } from "../../models/contratos/contrato-complementar.model";
import { Contrato } from "../../models/contratos/contrato.model";
import { Credor } from "../../models/contratos/credor.model";
import { Devedor } from "../../models/contratos/devedor.model";
import { Financiamento } from "../../models/contratos/financiamento.model";
import { Veiculo } from "../../models/contratos/veiculo.model";

export class ObterRascunhoResponse extends BaseResponse {
    identifier: string;
    ufLicenciamento: string;
    operacaoId: number;
    tipoFormulario: number;
    protocoloOrigem: string;
    veiculo: Veiculo[];
    contrato: Contrato;
    complementar: ContratoComplementar;
    financiamento: Financiamento;
    credor: Credor;
    devedor: Devedor;
    
    constructor() {
        super()
        this.veiculo = new Array<Veiculo>();
        this.contrato = new Contrato();
        this.complementar = new ContratoComplementar();
        this.financiamento = new Financiamento();
        this.credor = new Credor();
        this.devedor = new Devedor();
    }
}