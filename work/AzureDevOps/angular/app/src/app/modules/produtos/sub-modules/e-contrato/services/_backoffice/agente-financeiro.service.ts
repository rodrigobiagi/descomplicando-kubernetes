import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { AgenteFinanceiro } from "../../core/models/contratos/agente-financeiro.model";
import { ObterAgentesFinanceirosResponse } from "../../core/responses/_backoffice/agentes-financeiros/obter-agentes-financeiros.response";
import { ObterEmpresasPorUsuarioGuidResponse } from "../../core/responses/_backoffice/agentes-financeiros/obter-empresas-por-usuario-guid.response";
import { IAgenteFinanceiroService } from "../interfaces/_backoffice/agente-financeiro.service";

@Injectable()
export class AgenteFinanceiroService implements IAgenteFinanceiroService {

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    api: string = `${this.appSettings.baseUrlBackofficeApi}`;

    private _agenteFinanceiros: BehaviorSubject<AgenteFinanceiro> = new BehaviorSubject(null);
    public agenteFinanceiros$ = this._agenteFinanceiros.asObservable().pipe(filter(agente => !!agente));
    
    private _empresaId: BehaviorSubject<number> = new BehaviorSubject(null);
    public empresaId$ = this._empresaId.asObservable().pipe(filter(empresaId => !!empresaId));

    retornoAgenteFinanceiro(agente: AgenteFinanceiro): void { this._agenteFinanceiros.next(agente); }
    
    retornoEmpresa(empresaId: number): void { this._empresaId.next(empresaId); }

    obterAgentesFinanceiros(usuarioGuid: string, empresaId: number, uf: string): Observable<ObterAgentesFinanceirosResponse> {
        let url = `${this.api}empresas/agentes-financeiros/${usuarioGuid}/empresa/${empresaId}/uf/${uf}`;

        return this.http.get<ObterAgentesFinanceirosResponse>(url)
            .pipe(map(data => this.transformToObterAgentesFinanceirosResponse(data)));
    }

    obterEmpresasPorUsuarioGuid(usuarioGuid: string): Observable<ObterEmpresasPorUsuarioGuidResponse> {
      let url = `${this.api}empresas/${usuarioGuid}`;

      return this.http.get<ObterEmpresasPorUsuarioGuidResponse>(url)
          .pipe(map(data => this.transformToObterEmpresasPorUsuarioGuidResponse(data)));
  }

    obterAgentesFinanceirosPorUsuarioGuid(usuarioGuid: string): Observable<ObterEmpresasPorUsuarioGuidResponse> {
      let url = `${this.api}empresas/agentes-financeiros/${usuarioGuid}`;

      return this.http.get<ObterEmpresasPorUsuarioGuidResponse>(url)
          .pipe(map(data => this.transformToObterEmpresasPorUsuarioGuidResponse(data)));
  }

    //#region Privates

    private transformToObterAgentesFinanceirosResponse(data: any): ObterAgentesFinanceirosResponse {
        let response: ObterAgentesFinanceirosResponse = new ObterAgentesFinanceirosResponse;

        if (data.isSuccessful) {
            response.empresa = data.result.empresa;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
        return response;
    }

    private transformToObterEmpresasPorUsuarioGuidResponse(data: any): ObterEmpresasPorUsuarioGuidResponse {
      let response: ObterEmpresasPorUsuarioGuidResponse = new ObterEmpresasPorUsuarioGuidResponse;

      if (data.isSuccessful) {
          response.empresas = data.result.empresas;
          return response;
      }

      data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
      return response;
  }

    //#endregion
}
