export class FiltrarTransacoesRequest {
    TipoOperacao?: number;
    Uf?: string;
    StatusTransacao?: number;
    NumeroContrato?: string;
    Renavam?: number;
    Chassi?: string;
    NumeroGravame?: string;
    Placa?: string;
    DocumentoDevedor?: string;
    DocumentoCredor?: string[];
    DataInicio: string;
    DataFim: string;
    ProtocoloLote?: string;
    PageIndex?: number;
    PageSize?: number;
}
