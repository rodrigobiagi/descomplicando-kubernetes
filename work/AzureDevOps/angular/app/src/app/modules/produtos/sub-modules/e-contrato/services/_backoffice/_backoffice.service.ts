import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { ObterUsuarioInfoResponse } from "src/app/modules/acessos/usuarios/core/responses/usuarios/obter-usuario-info.response";
import { VerificaUsuarioMasterResponse } from "src/app/modules/acessos/usuarios/core/responses/usuarios/verifica-usuario-master.response";
import { CriarCargoRequest } from "../../core/requests/_backoffice/empresas/criar-cargo.request";
import { CriarDepartamentoRequest } from "../../core/requests/_backoffice/empresas/criar-departamento.request";
import { CriarCargoResponse } from "../../core/responses/_backoffice/empresas/criar-cargo.response";
import { CriarDepartamentoResponse } from "../../core/responses/_backoffice/empresas/criar-departamento.response";
import { ObterCargosEmpresaResponse } from "../../core/responses/_backoffice/empresas/obter-cargos.response";
import { ObterDepartamentosEmpresaResponse } from "../../core/responses/_backoffice/empresas/obter-departamentos-empresa.response";
import { ObterEmpresasPaginationResponse } from "../../core/responses/_backoffice/empresas/obter-empresas-pagination.response";
import { ObterPerfisResponse } from "../../core/responses/_backoffice/empresas/obter-perfis.response";
import { ObterPerrmissoesUsuarioResponse } from "../../core/responses/_backoffice/empresas/obter-permissoes-usuario.response";
import { ObterDetransResponse } from "../../core/responses/_backoffice/obter-detrans.response";
import { ObterEmpresasUsuarioResponse } from "../../core/responses/_backoffice/obter-empresas-usuario.response";
import { ObterPerfisPermissoesConvidadosResponse } from "../../core/responses/_backoffice/perfis/obter-permissoes-convidados.response";
import { ObterTaxaDudaResponse } from "../../core/responses/_backoffice/taxas/obter-taxa-duda.response";
import { ObterCoresResponse } from "../../core/responses/_backoffice/veiculos/obter-cores.response";
import { ObterEspeciesResponse } from "../../core/responses/_backoffice/veiculos/obter-especies.response";
import { ObterMarcasResponse } from "../../core/responses/_backoffice/veiculos/obter-marcas.response";
import { ObterModelosResponse } from "../../core/responses/_backoffice/veiculos/obter-modelos.response";
import { IBackofficeService } from "../interfaces/_backoffice/_backoffice.interface.service";

@Injectable()
export class BackofficeService implements IBackofficeService {

  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlBackofficeApi}`;

  obterDetrans(usuarioGuid: string): Observable<ObterDetransResponse> {
    let url = `${this.api}empresas/${usuarioGuid}/detrans`;

    return this.http.get<ObterDetransResponse>(url)
      .pipe(map(data => this.transformToObterDetransResponse(data)));
  }

  obterDetransPorEmpresaId(empresaId: number): Observable<ObterDetransResponse> {
    let url = `${this.api}empresas/${empresaId}/detrans`;

    return this.http.get<ObterDetransResponse>(url)
      .pipe(map(data => this.transformToObterDetransResponse(data)));
  }

  obterMarcasVeiculos() {
    let url = `${this.api}veiculo/marcas`;

    return this.http.get<ObterMarcasResponse>(url)
      .pipe(map(data => this.transformToObterMarcasVeiculoResponse(data)));
  }

  obterModelosVeiculos(marcaId: number) {
    let url = `${this.api}veiculo/${marcaId}/modelos`;

    return this.http.get<ObterModelosResponse>(url)
      .pipe(map(data => this.transformToObterModelosVeiculoResponse(data)));
  }

  obterEspecieVeiculos() {
    let url = `${this.api}veiculo/especies`;

    return this.http.get<ObterEspeciesResponse>(url)
      .pipe(map(data => this.transformToObterEspeciesVeiculoResponse(data)));
  }

  obterCoresVeiculos() {
    let url = `${this.api}veiculo/cores`;

    return this.http.get<ObterCoresResponse>(url)
      .pipe(map(data => this.transformToObterCoresVeiculoResponse(data)));
  }

  obterEmpresasUsuario(usuarioGuid: string) {
    let url = `${this.api}empresas/${usuarioGuid}`;

    return this.http.get<ObterEmpresasUsuarioResponse>(url)
      .pipe(map(data => this.transformToObterEmpresasUsuarioResponse(data)));
  }

  obterPerfis(empresaId: number, filtro: any): Observable<ObterPerfisResponse> {
    let url = `${this.api}empresas/${empresaId}/perfis`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => { if (filtro[key] !== '' || filtro[key].length !== 0) params = params.append(key, filtro[key]) });

    return this.http
      .get<ObterPerfisResponse>(url, { params: filtro })
      .pipe(map((data) => this.transformToObterPerfisResponse(data)));
  }

  obterEmpresasFiltro(pageIndex: number = 0, pageSize: number = 5, filtro: string = '', ativo: string = ''): Observable<ObterEmpresasPaginationResponse> {
    let url = `${this.api}empresas/filtro`;

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('filtro', filtro)
      .set('ativo', ativo)

    return this.http.get<ObterEmpresasPaginationResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterEmpresasResponse(data)));
  }

  obterEmpresas(pageIndex: number = 0, pageSize: number = 5, nome: string = '', ativo: string = ''): Observable<ObterEmpresasPaginationResponse> {
    let url = `${this.api}empresas`;

    const params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('nome', nome)
      .set('ativo', ativo)

    return this.http.get<ObterEmpresasPaginationResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterEmpresasResponse(data)));
  }

  criarDepartamento(empresaId: number, departamento: CriarDepartamentoRequest): Observable<CriarDepartamentoResponse> {
    let url = `${this.api}empresas/${empresaId}/departamentos`;

    return this.http.post<CriarDepartamentoResponse>(url, departamento)
      .pipe(map(data => this.transformToCriarDepartamentoResponse(data)));
  }

  obterDepartamentos(empresaId: number): Observable<ObterDepartamentosEmpresaResponse> {
    let url = `${this.api}empresas/${empresaId}/departamentos`;

    return this.http.get<ObterDepartamentosEmpresaResponse>(url)
      .pipe(map(data => this.transformToObterDepartamentosEmpresa(data)));
  }

  //#region Permissoes

  obterPermissoesUsuario(empresaId: number, usuarioGuid: string): Observable<ObterPerrmissoesUsuarioResponse> {
    let url = `${this.api}empresas/${empresaId}/permissoes/usuario/${usuarioGuid}`;

    return this.http.get<ObterPerrmissoesUsuarioResponse>(url)
      .pipe(map(data => this.transformToObterPermissoesUsuario(data)));
  }

  obterPermissoesUsuarioConvidado(usuarioGuid: string): Observable<ObterPerfisPermissoesConvidadosResponse> {
    let url = `${this.api}perfis/permissoes/usuario-convidado/${usuarioGuid}`;

    return this.http.get<ObterPerfisPermissoesConvidadosResponse>(url)
      .pipe(map(data => this.transformToObterPerfisPermissoesConvidadosResponse(data)));
  }

  verificaUsuarioMaster(usuarioGuid: string, empresaId: number) {
    let url = `${this.api}usuarios/${usuarioGuid}/master/empresa/${empresaId}`;

    return this.http.get<VerificaUsuarioMasterResponse>(url)
      .pipe(map(data => this.transformToVerificaUsuarioMasterResponse(data)));
  }

  obterUsuarioInfo(usuarioGuid: string, empresaId: number): Observable<ObterUsuarioInfoResponse> {
    let url = `${this.api}usuarios/info/${usuarioGuid}/empresa/${empresaId}`;

    return this.http.get<ObterUsuarioInfoResponse>(url)
      .pipe(map(data => this.transformToObterUsuarioInfo(data)));
  }

  //#region Privates

  private transformToObterPermissoesUsuario(data: any): ObterPerrmissoesUsuarioResponse {
    let response: ObterPerrmissoesUsuarioResponse = new ObterPerrmissoesUsuarioResponse()

    if (data.isSuccessful) {
      response.permissoes = data.result.permissoes;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterPerfisPermissoesConvidadosResponse(data: any): ObterPerfisPermissoesConvidadosResponse {
    let response: ObterPerfisPermissoesConvidadosResponse = new ObterPerfisPermissoesConvidadosResponse()

    if (data.isSuccessful) {
      response.permissoes = data.result.permissoes;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToVerificaUsuarioMasterResponse(data: any): VerificaUsuarioMasterResponse {
    let response: VerificaUsuarioMasterResponse = new VerificaUsuarioMasterResponse()

    if (data.isSuccessful) {
      response = data.result;
      response.ehUsuarioMaster = data.result.ehUsuarioMaster;
      response.nomeEmpresa = data.result.nomeEmpresa;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  //#endregion

  //#endregion

  //#region Cargos

  criarCargo(empresaId: number, cargo: CriarCargoRequest): Observable<CriarCargoResponse> {
    let url = `${this.api}empresas/${empresaId}/cargos`;

    return this.http.post<CriarCargoResponse>(url, cargo)
      .pipe(map(data => this.transformToCriarCargoResponse(data)));
  }

  obterCargos(empresaId: number): Observable<ObterCargosEmpresaResponse> {
    let url = `${this.api}empresas/${empresaId}/cargos`;

    return this.http.get<ObterCargosEmpresaResponse>(url)
      .pipe(map(data => this.transformToObterCargosEmpresa(data)));
  }

  //#endregion Cargos

  //#region Taxas

  obterQtdTaxasDisponivel(empresaId: number): Observable<ObterTaxaDudaResponse> {
    let url = `${this.api}taxas/duda/empresa/${empresaId}`;

    return this.http.get<ObterTaxaDudaResponse>(url)
      .pipe(map(data => this.transformToObterTaxaDuda(data)));
  }

  //#region Privates

  private transformToObterTaxaDuda(data: any): ObterTaxaDudaResponse {
    let response: ObterTaxaDudaResponse = new ObterTaxaDudaResponse;

    if (data.isSuccessful) {
      response.id = data.result.id;
      response.qtdGuiaDisponivel = data.result.qtdGuiaDisponivel;
      response.ativo = data.result.ativo;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  //#endregion

  //#endregion Taxas

  //#region Privates

  private transformToObterDetransResponse(data: any): ObterDetransResponse {
    let response: ObterDetransResponse = new ObterDetransResponse;

    if (data.isSuccessful) {
      response.detrans = data.result.detrans;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterMarcasVeiculoResponse(data: any): ObterMarcasResponse {
    let response: ObterMarcasResponse = new ObterMarcasResponse;

    if (data.isSuccessful) {
      response.marcas = data.result.marcas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterModelosVeiculoResponse(data: any): ObterModelosResponse {
    let response: ObterModelosResponse = new ObterModelosResponse;

    if (data.isSuccessful) {
      response.modelos = data.result.modelos;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterEspeciesVeiculoResponse(data: any): ObterEspeciesResponse {
    let response: ObterEspeciesResponse = new ObterEspeciesResponse;

    if (data.isSuccessful) {
      response.especies = data.result.especies;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterCoresVeiculoResponse(data: any): ObterCoresResponse {
    let response: ObterCoresResponse = new ObterCoresResponse;

    if (data.isSuccessful) {
      response.cores = data.result.cores;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterEmpresasUsuarioResponse(data: any): ObterEmpresasUsuarioResponse {
    let response: ObterEmpresasUsuarioResponse = new ObterEmpresasUsuarioResponse;

    if (data.isSuccessful) {
      response.empresas = data.result.empresas;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message); });
    return response;
  }

  private transformToObterEmpresasResponse(data: any): ObterEmpresasPaginationResponse {
    let response: ObterEmpresasPaginationResponse = new ObterEmpresasPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.empresas = data.result.empresas;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName)
    })
  }

  private transformToObterPerfisResponse(data: any): ObterPerfisResponse {
    let response: ObterPerfisResponse = new ObterPerfisResponse();

    if (data.isSuccessful) {
      response = <ObterPerfisResponse>{
        pageIndex: data.result.pageIndex,
        totalItems: data.result.totalItems,
        perfis: data.result.perfis,
      };
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName); });
    return response;
  }

  private transformToCriarDepartamentoResponse(data: any): CriarDepartamentoResponse {
    let response: CriarDepartamentoResponse = new CriarDepartamentoResponse();

    if (data.isSuccessful) {
      response = <CriarDepartamentoResponse>{
        departamentoId: data.result.departamentoId,
        nome: data.result.nome
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterDepartamentosEmpresa(data: any): ObterDepartamentosEmpresaResponse {
    let response: ObterDepartamentosEmpresaResponse = new ObterDepartamentosEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterDepartamentosEmpresaResponse>{ departamentos: data.result.departamentos }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }


  //#region Privates

  private transformToCriarCargoResponse(data: any): CriarCargoResponse {
    let response: CriarCargoResponse = new CriarCargoResponse();

    if (data.isSuccessful) {
      response = <CriarCargoResponse>{
        cargoId: data.result.cargoId,
        nome: data.result.nome
      }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterCargosEmpresa(data: any): ObterCargosEmpresaResponse {
    let response: ObterCargosEmpresaResponse = new ObterCargosEmpresaResponse();

    if (data.isSuccessful) {
      response = <ObterCargosEmpresaResponse>{ cargos: data.result.cargos }

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  //#endregion

  private transformToObterUsuarioInfo(data: any): ObterUsuarioInfoResponse {
    let response: ObterUsuarioInfoResponse = new ObterUsuarioInfoResponse();

    if (data.isSuccessful) {
      response.nomeUsuario = data.result.nomeUsuario;
      response.email = data.result.email;
      response.telefone = data.result.telefone;
      response.nomeEmpresa = data.result.nomeEmpresa;
      response.empresaId = data.result.empresaId;
      response.cnpjEmpresa = data.result.cnpjEmpresa;

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }
  //#endregion
}
