import { Pipe } from "@angular/core";
import { TipoOperacao } from "../enums/tipo-operacao.enum";

@Pipe({
    name: 'tipoOperacao'
})
export class TipoOperacaoPipe {
    private nomeOperacao: string;

    transform(value: any): string {

        switch(value) {
            case Number(TipoOperacao.RegistrarContrato): {
                this.nomeOperacao = 'Registro de contrato';
                break;
            }
            case Number(TipoOperacao.AlterarContrato): {
                this.nomeOperacao = 'Alteração de contrato';
                break;
            }
            case Number(TipoOperacao.RegistrarAditivo): {
                this.nomeOperacao = 'Registro de aditivo';
                break;
            }
            case Number(TipoOperacao.AlterarAditivo): {
                this.nomeOperacao = 'Alteração de aditivo';
                break;
            }
            default: {
                this.nomeOperacao = '--';
                break;
            }
        }

        return this.nomeOperacao;
    }
}