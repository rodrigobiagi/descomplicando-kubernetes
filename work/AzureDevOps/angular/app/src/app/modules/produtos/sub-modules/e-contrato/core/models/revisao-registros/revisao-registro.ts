import { Utility } from "src/app/core/common/utility";
import { ObterRascunhoResponse } from "../../responses/rascunhos/obter-rascunho.response";
import { Contato } from "../common/contato.model";
import { Documento } from "../common/documento.model";
import { Endereco } from "../common/endereco.model";
import { RevisaoRegistroField } from "./revisao-registro-field";

export class RevisaoRegistro {
    dadosVeiculo: RevisaoRegistroField[] = [];
    dadosContrato: RevisaoRegistroField[] = [];
    dadosComplementar: RevisaoRegistroField[] = [];
    dadosFinanciamento: RevisaoRegistroField[] = [];
    dadosCredor: RevisaoRegistroField[] = [];
    dadosDevedor: RevisaoRegistroField[] = [];

    setup(): RevisaoRegistro {
        let revisaoRegistro = new RevisaoRegistro();

        revisaoRegistro.dadosVeiculo = this.fieldsDadosVeiculo;
        revisaoRegistro.dadosContrato = this.fieldsDadosContrato;
        revisaoRegistro.dadosComplementar = this.fieldsDadosComplementar;
        revisaoRegistro.dadosFinanciamento = this.fieldsDadosFinanciamento;
        revisaoRegistro.dadosCredor = this.fieldsDadosCredor;
        revisaoRegistro.dadosDevedor = this.fieldsDadosDevedor;

        return revisaoRegistro;
    }

    setValues(response: ObterRascunhoResponse) {
        // for (let [key, value] of Object.entries(response.veiculo)) {
        //     let index = this.dadosVeiculo.findIndex(x => x.nome == key);

        //     if (typeof value === 'boolean') {
        //         this.dadosVeiculo[index].valor = value ? 'SIM' : 'NÃO';
        //     } else {
        //         this.dadosVeiculo[index].valor = value;
        //     }
        // }

        for (let [key, value] of Object.entries(response.contrato)) {
            let index = this.dadosContrato.findIndex(x => x.nome == key)
            if (this.dadosContrato[index].dataType === 'string') {
                this.dadosContrato[index].valor = value;

                if (this.dadosContrato[index].dataType === 'currency') {
                    this.dadosContrato[index].valor = Utility.formatCurrency(value);

                    if (this.dadosContrato[index].dataType === 'boolean') {
                        this.dadosContrato[index].valor = value ? 'SIM' : 'NÃO';
                    }
                }
            }
        }

        for (let [key, value] of Object.entries(response.complementar)) {
            let index = this.dadosComplementar.findIndex(x => x.nome == key)

            if (index !== -1) {
                if (this.dadosComplementar[index].dataType === 'string') {
                    this.dadosComplementar[index].valor = value;
                }
    
                if (this.dadosComplementar[index].dataType === 'boolean') {
                    this.dadosComplementar[index].valor = value ? 'SIM' : 'NÃO';
                }
            }


            if (key === 'documentoRecebedor') {
                this.dadosComplementar.forEach(complementar => {
                    if (complementar.dataType === 'string') {
                        this.dadosComplementar[0].valor = value.tipoDocumento == 2 ? Utility.formatCnpj(value.numero) : Utility.formatCpf(value.numero);
                    }
                })
            }

            if (key === 'documentoVendedor') {
                this.dadosComplementar.forEach(complementar => {
                    if (complementar.dataType === 'string') {
                        this.dadosComplementar[1].valor = value.tipoDocumento == 2 ? Utility.formatCnpj(value.numero) : Utility.formatCpf(value.numero);
                    }
                })
            }
        }


        for (let [key, value] of Object.entries(response.financiamento)) {
            let index = this.dadosFinanciamento.findIndex(x => x.nome == key);

            if (this.dadosFinanciamento[index].dataType === 'string') {
                this.dadosFinanciamento[index].valor = value;
            }

            if (this.dadosFinanciamento[index].dataType === 'currency') {
                this.dadosFinanciamento[index].valor = Utility.formatCurrency(value);
            }

            if (this.dadosFinanciamento[index].dataType === 'boolean') {
                this.dadosFinanciamento[index].valor = value ? 'SIM' : 'NÃO';
            }
        }

        for (let [key, value] of Object.entries(response.credor)) {
            let index = this.dadosCredor.findIndex(x => x.nome == key)

            if (index !== -1) {
                if (this.dadosCredor[index].dataType === 'string') {
                    this.dadosCredor[index].valor = value;
                }
            }

            if (value instanceof Documento) {
                this.dadosCredor.forEach(credor => {
                    if (credor.dataType === 'string') {
                        this.dadosCredor[0].valor = value.tipoDocumento == 2 ? Utility.formatCnpj(value.numero) : Utility.formatCpf(value.numero);
                    }
                    if (credor.dataType === 'docType') {
                        this.dadosCredor[1].valor = Documento.convertToString(value.tipoDocumento).toUpperCase()
                    }
                })
            }

            if (value instanceof Endereco) {
                this.dadosCredor.forEach(endereco => {
                    if (endereco.dataType === 'string') {
                        this.dadosCredor[3].valor = value.logradouro
                        this.dadosCredor[4].valor = value.numero
                        this.dadosCredor[5].valor = value.bairro
                        this.dadosCredor[6].valor = value.cep
                        this.dadosCredor[7].valor = value.municipio
                        this.dadosCredor[8].valor = value.uf
                        this.dadosCredor[9].valor = value.complemento
                    }
                })
            }

            if (value instanceof Contato) {
                this.dadosCredor.forEach(contato => {
                    if (contato.dataType === 'string') {
                        this.dadosCredor[10].valor = value.telefoneCompleto
                        this.dadosCredor[11].valor = value.email
                    }
                })
            }
        }


        for (let [key, value] of Object.entries(response.devedor)) {

            let index = this.dadosDevedor.findIndex(x => x.nome == key)

            if (index === 0 && value !== '') this.dadosDevedor[0].valor = value

            if (value instanceof Documento) {
                this.dadosDevedor.forEach(devedor => {

                    if (devedor.dataType === 'string') {
                        this.dadosDevedor[1].valor = value.tipoDocumento == 2 ? Utility.formatCnpj(value.numero) : Utility.formatCpf(value.numero);
                    }

                    if (devedor.dataType === 'docType') {
                        this.dadosDevedor[2].valor = Documento.convertToString(value.tipoDocumento).toUpperCase()
                    }
                })
            }

            if (value instanceof Endereco) {

                this.dadosDevedor.forEach(endereco => {
                    if (endereco.dataType === 'string') {
                        this.dadosDevedor[3].valor = value.logradouro
                        this.dadosDevedor[4].valor = value.numero
                        this.dadosDevedor[5].valor = value.bairro
                        this.dadosDevedor[6].valor = value.cep
                        this.dadosDevedor[7].valor = value.municipio
                        this.dadosDevedor[8].valor = value.uf
                        this.dadosDevedor[9].valor = value.complemento
                    }
                })
            }

            if (value instanceof Contato) {
                this.dadosDevedor.forEach(contato => {
                    if (contato.dataType === 'string') {
                        this.dadosDevedor[10].valor = value.telefoneCompleto
                        this.dadosDevedor[11].valor = value.email
                    }
                })
            }
        }
    }

    private get fieldsDadosVeiculo(): RevisaoRegistroField[] {
        let fields: RevisaoRegistroField[] = [];

        fields.push(new RevisaoRegistroField('chassi', 'Chassi', 'string', ''));
        fields.push(new RevisaoRegistroField('placa', 'Placa', 'string', ''));
        fields.push(new RevisaoRegistroField('ufPlaca', 'UF da Placa', 'string', ''));
        fields.push(new RevisaoRegistroField('anoFabricacao', 'Ano de Fabricação', 'string', ''));
        fields.push(new RevisaoRegistroField('anoModelo', 'Ano do Modelo', 'string', ''));
        fields.push(new RevisaoRegistroField('remarcado', 'Remarcado', 'boolean', ''));
        fields.push(new RevisaoRegistroField('renavam', 'Renavam', 'string', ''));
        fields.push(new RevisaoRegistroField('emplacado', 'Emplacado', 'boolean', ''));
        fields.push(new RevisaoRegistroField('marca', 'Marca', 'string', ''));
        fields.push(new RevisaoRegistroField('modelo', 'Modelo', 'string', ''));
        fields.push(new RevisaoRegistroField('especie', 'Espécie', 'string', ''));
        fields.push(new RevisaoRegistroField('cor', 'Cor', 'string', ''));

        return fields;
    }


    private get fieldsDadosContrato(): RevisaoRegistroField[] {
        let fields: RevisaoRegistroField[] = [];

        fields.push(new RevisaoRegistroField('numeroContrato', 'Nº do Contrato', 'string', 'Contrato.NumeroContrato'));
        fields.push(new RevisaoRegistroField('ufLicenciamento', 'UF Licenciamento', 'string', ''));
        fields.push(new RevisaoRegistroField('numeroRestricao', 'Nº do Gravame', 'string', 'Contrato.NumeroRestricao'));
        fields.push(new RevisaoRegistroField('tipoRestricao', 'Tipo de Restrição', 'string', 'Contrato.TipoRestricao'));
        fields.push(new RevisaoRegistroField('dataContrato', 'Data do Contrato', 'string', 'Contrato.DataContrato'));
        fields.push(new RevisaoRegistroField('numeroAditivo', 'Nº do Aditivo', 'string', 'Contrato.NumeroAditivo'));
        fields.push(new RevisaoRegistroField('dataAditivo', 'Data do Aditivo', 'string', 'Contrato.DataAditivo'));
        fields.push(new RevisaoRegistroField('tipoAditivo', 'Tipo de Aditivo', 'string', ''));

        return fields;
    }

    private get fieldsDadosComplementar(): RevisaoRegistroField[] {
        let fields: RevisaoRegistroField[] = [];

        fields.push(new RevisaoRegistroField('documentoRecebedor', 'Nº do Documento recebedor', 'string', ''))
        fields.push(new RevisaoRegistroField('documentoVendedor', 'Nº do Documento vendedor', 'string', ''))
        fields.push(new RevisaoRegistroField('taxaContrato', 'Taxa do Contrato', 'string', ''))
        fields.push(new RevisaoRegistroField('taxaIof', 'Taxa do IOF', 'string', ''))
        fields.push(new RevisaoRegistroField('indice', 'Índice', 'string', 'Complementar.Indice'))
        fields.push(new RevisaoRegistroField('nomeRecebedorPagamento', 'Nome do Recebedor', 'string', ''))
        fields.push(new RevisaoRegistroField('indicadorTaxaMora', 'Taxa Mora', 'boolean', 'Complementar.IndicadorTaxaMora'))
        fields.push(new RevisaoRegistroField('valorTaxaMora', 'Valor taxa mora', 'string', 'Complementar.ValorTaxaMora'))
        fields.push(new RevisaoRegistroField('indicadorTaxaMulta', 'Taxa Multa', 'boolean', 'Complementar.IndicadorTaxaMulta'))
        fields.push(new RevisaoRegistroField('valorTaxaMulta', 'Valor taxa Multa', 'string', 'Complementar.ValorTaxaMulta'))
        fields.push(new RevisaoRegistroField('taxaJurosMes', 'Taxa Juros mês', 'string', ''))
        fields.push(new RevisaoRegistroField('taxaJurosAno', 'Taxa Juros ano', 'string', ''))
        fields.push(new RevisaoRegistroField('indicadorComissao', 'Indicador comissão', 'boolean', 'Complementar.IndicadorComissao'))
        fields.push(new RevisaoRegistroField('comissao', 'Valor comissão', 'string', 'Complementar.Comissao'))
        fields.push(new RevisaoRegistroField('indicadorPenalidade', 'Indicador penalidade', 'boolean', 'Complementar.IndicadorPenalidade'))
        fields.push(new RevisaoRegistroField('penalidade', 'Penalidade', 'string', 'Complementar.Penalidade'))
        fields.push(new RevisaoRegistroField('comentario', 'Comentário', 'string', ''))

        return fields;
    }

    private get fieldsDadosFinanciamento(): RevisaoRegistroField[] {
        let fields: RevisaoRegistroField[] = [];

        fields.push(new RevisaoRegistroField('valorTotalDivida', 'Valor Total da Dívida', 'currency', 'Financiamento.ValorTotalDivida'));
        fields.push(new RevisaoRegistroField('valorParcela', 'Valor da Parcela', 'currency', ''));
        fields.push(new RevisaoRegistroField('quantidadeParcela', 'Qtde. de Parcelas', 'string', 'Financiamento.QuantidadeParcela'));
        fields.push(new RevisaoRegistroField('dataVencimentoPrimeiraParcela', 'Venc. da Primeira Parcela', 'string', 'Financiamento.DataVencimentoPrimeiraParcela'));
        fields.push(new RevisaoRegistroField('dataVencimentoUltimaParcela', 'Venc. da Última Parcela', 'string', 'Financiamento.DataVencimentoUltimaParcela'));
        fields.push(new RevisaoRegistroField('dataLiberacaoCredito', 'Data Liberação de Crédito', 'string', 'Financiamento.DataLiberacao'));
        fields.push(new RevisaoRegistroField('ufLiberacaoCredito', 'UF Liberação de Crédito', 'string', ''));
        fields.push(new RevisaoRegistroField('idMunicipio', 'Municipio', 'string', 'Financiamento.IdMunicipio'));
        fields.push(new RevisaoRegistroField('grupoConsorcio', 'Grupo Consorcio', 'string', ''));
        fields.push(new RevisaoRegistroField('cotaConsorcio', 'Cota do Consorcio', 'string', ''));

        return fields;
    }

    private get fieldsDadosCredor(): RevisaoRegistroField[] {
        let fields: RevisaoRegistroField[] = [];

        fields.push(new RevisaoRegistroField('numeroDocumento', 'Nº do Documento', 'string', ''))
        fields.push(new RevisaoRegistroField('tipoDocumento', 'Tipo do Documento', 'docType', ''))
        fields.push(new RevisaoRegistroField('agenteFinanceiro', 'Agente financeiro', 'string', ''))
        fields.push(new RevisaoRegistroField('logradouro', 'Logradouro', 'string', 'Credor.Endereco.Logradouro'))
        fields.push(new RevisaoRegistroField('numero', 'Número', 'string', 'Credor.Endereco.Numero'))
        fields.push(new RevisaoRegistroField('bairro', 'Bairro', 'string', 'Credor.Endereco.Bairro'))
        fields.push(new RevisaoRegistroField('cep', 'CEP', 'string', 'Credor.Endereco.Cep'))
        fields.push(new RevisaoRegistroField('municipio', 'Município', 'string', 'Credor.Endereco.Municipio'))
        fields.push(new RevisaoRegistroField('uf', 'UF', 'string', 'Credor.Endereco.Uf'))
        fields.push(new RevisaoRegistroField('complemento', 'Complemento', 'string', ''))
        fields.push(new RevisaoRegistroField('telefoneCompleto', 'Telefone', 'string', 'Credor.Contato.Telefone'))
        fields.push(new RevisaoRegistroField('email', 'e-mail', 'string', ''))

        return fields;
    }

    private get fieldsDadosDevedor(): RevisaoRegistroField[] {
        let fields: RevisaoRegistroField[] = [];

        fields.push(new RevisaoRegistroField('nomeDoFinanciado', 'Nome do Financiado', 'string', 'Devedor.NomeDoFinanciado'))
        fields.push(new RevisaoRegistroField('numeroDocumento', 'Nº do Documento', 'string', 'Devedor.Documento.Numero'))
        fields.push(new RevisaoRegistroField('tipoDocumento', 'Tipo do Documento', 'docType', 'Devedor.Documento'))
        fields.push(new RevisaoRegistroField('logradouro', 'Logradouro', 'string', 'Devedor.Endereco.Logradouro'))
        fields.push(new RevisaoRegistroField('numero', 'Número', 'string', 'Devedor.Endereco.Numero'))
        fields.push(new RevisaoRegistroField('bairro', 'Bairro', 'string', 'Devedor.Endereco.Bairro'))
        fields.push(new RevisaoRegistroField('cep', 'CEP', 'string', 'Devedor.Endereco.Cep'))
        fields.push(new RevisaoRegistroField('municipio', 'Município', 'string', 'Devedor.Endereco.Municipio'))
        fields.push(new RevisaoRegistroField('uf', 'UF', 'string', 'Devedor.Endereco.Uf'))
        fields.push(new RevisaoRegistroField('complemento', 'Complemento', 'string', ''))
        fields.push(new RevisaoRegistroField('telefoneCompleto', 'Telefone', 'string', ''))
        fields.push(new RevisaoRegistroField('email', 'e-mail', 'string', ''))

        return fields;
    }
}