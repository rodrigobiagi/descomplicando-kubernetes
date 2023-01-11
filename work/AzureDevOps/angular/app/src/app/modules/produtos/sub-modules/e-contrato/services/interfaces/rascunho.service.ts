import { Observable } from "rxjs";
import { AtualizarRascunhoComplementarRequest } from "../../core/requests/rascunhos/atualizar-rascunho-complementar.request";
import { AtualizarRascunhoContratoRequest } from "../../core/requests/rascunhos/atualizar-rascunho-contrato.request";
import { AtualizarRascunhoCredorRequest } from "../../core/requests/rascunhos/atualizar-rascunho-credor.request";
import { AtualizarRascunhoDevedorRequest } from "../../core/requests/rascunhos/atualizar-rascunho-develodr.request";
import { AtualizarRascunhoFinanciamentoRequest } from "../../core/requests/rascunhos/atualizar-rascunho-financiamento.request";
import { AtualizarRascunhoVeiculoRequest } from "../../core/requests/rascunhos/atualizar-rascunho-veiculo.request";
import { CriarRascunhoResumoRequest } from "../../core/requests/rascunhos/criar-rascunho-resumo.request";
import { AtualizarRascunhoComplementarResponse } from "../../core/responses/rascunhos/atualizar-rascunho-complementar.response";
import { AtualizarRascunhoContratoResponse } from "../../core/responses/rascunhos/atualizar-rascunho-contrato.response";
import { AtualizarRascunhoDevedorResponse } from "../../core/responses/rascunhos/atualizar-rascunho-devedor.response";
import { AtualizarRascunhoCredorResponse } from "../../core/responses/rascunhos/atualizar-rascunho-credor.response";
import { AtualizarRascunhoFinanciamentoResponse } from "../../core/responses/rascunhos/atualizar-rascunho-financiamento.response";
import { AtualizarRascunhoVeiculoResponse } from "../../core/responses/rascunhos/atualizar-rascunho-veiculo.response";
import { CriarRascunhoResumoResponse } from "../../core/responses/rascunhos/criar-rascunho-resumo.response";
import { ObterRascunhoResumoPaginationResponse } from "../../core/responses/rascunhos/obter-rascunho-resumo-pagination.response";
import { ObterRascunhoResumoResponse } from "../../core/responses/rascunhos/obter-rascunho-resumo.response";
import { ObterRascunhoResponse } from "../../core/responses/rascunhos/obter-rascunho.response";
import { ObterRevisaoRascunhoResponse } from "../../core/responses/rascunhos/obter-revisao-rascunho.response";

export interface IRascunhoService { 

    atualizarRascunhoVeiculo(rascunho: AtualizarRascunhoVeiculoRequest, identifier: string): Observable<AtualizarRascunhoVeiculoResponse>;
    atualizarRascunhoContrato(rascunho: AtualizarRascunhoContratoRequest, identifier: string): Observable<AtualizarRascunhoContratoResponse>;
    atualizarRascunhoComplementar(rascunho: AtualizarRascunhoComplementarRequest, identifier: string): Observable<AtualizarRascunhoComplementarResponse>;
    atualizarRascunhoFinanciamento(rascunho: AtualizarRascunhoFinanciamentoRequest, identifier: string): Observable<AtualizarRascunhoFinanciamentoResponse>;
    atualizarRascunhoCredor(rascunho: AtualizarRascunhoCredorRequest, identifier: string): Observable<AtualizarRascunhoCredorResponse>;
    atualizarRascunhoDevedor(rascunho: AtualizarRascunhoDevedorRequest, identifier: string): Observable<AtualizarRascunhoDevedorResponse>;
    criarRascunhoResumo(rascunho: CriarRascunhoResumoRequest): Observable<CriarRascunhoResumoResponse>;
    excluirRascunho(identifier: string): Observable<boolean>;
    obterRascunhosResumo(pageIndex: number, pageSize: number): Observable<ObterRascunhoResumoPaginationResponse>;
    obterRascunho(identifier: string): Observable<ObterRascunhoResponse>;
    obterRascunhoResumo(identifier: string): Observable<ObterRascunhoResumoResponse>;
    obterRascunhoVeiculo(identifier: string): Observable<AtualizarRascunhoVeiculoResponse>;
    obterRascunhoContrato(identifier: string): Observable<AtualizarRascunhoContratoResponse>;
    obterRascunhoCredor(identifier: string): Observable<AtualizarRascunhoCredorResponse>;
    obterRascunhoDevedor(identifier: string): Observable<AtualizarRascunhoDevedorResponse>;
    obterRascunhoComplementar(identifier: string): Observable<AtualizarRascunhoComplementarResponse>;
    obterRascunhoFinanciamento(identifier: string): Observable<AtualizarRascunhoFinanciamentoResponse>;
    obterRevisaoRascunhoVeiculo(identifier: string): Observable<ObterRevisaoRascunhoResponse>;
    obterRevisaoRascunhoContrato(identifier: string): Observable<ObterRevisaoRascunhoResponse>;
    obterRevisaoRascunhoComplementar(identifier: string): Observable<ObterRevisaoRascunhoResponse>;
    obterRevisaoRascunhoFinanciamento(identifier: string): Observable<ObterRevisaoRascunhoResponse>;
    obterRevisaoRascunhoCredor(identifier: string): Observable<ObterRevisaoRascunhoResponse>;
    obterRevisaoRascunhoDevedor(identifier: string): Observable<ObterRevisaoRascunhoResponse>;
}