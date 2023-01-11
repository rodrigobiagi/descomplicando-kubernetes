import { Observable } from "rxjs/internal/Observable";

export interface ITransacaoService {
    obterTodasTransacoes(pageIndex: number, pageSize: number);
    obterDetalhesTransacao(protocolo: string);
    obterStatusTransacoes();
    filtrarTransacoes(filtro);
    enviarLote(base64: string): Observable<any>;
}