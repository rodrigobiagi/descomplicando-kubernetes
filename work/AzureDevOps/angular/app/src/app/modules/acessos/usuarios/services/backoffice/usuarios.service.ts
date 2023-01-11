import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { IUsuariosService } from "../interfaces/usuarios.interface.service";
import { ObterUsuariosPaginationResponse } from "../../core/responses/usuarios/obter-usuarios-pagination.response";
import { ObterUsuarioPorIdResponse } from "../../core/responses/usuarios/obter-usuario-por-id.response";
import { CriarUsuarioEmpresaResponse } from "../../core/responses/usuarios/criar-usuario-empresa.response";
import { CriarUsuarioEmpresaRequest } from "../../core/requests/usuarios/criar-usuario-empresa.request";
import { AtualizarUsuarioEmpresaResponse } from "../../core/responses/usuarios/atualizar-usuario-empresa.response";
import { ObterUsuarioPorGuidResponse } from "../../core/responses/usuarios/obter-usuario-por-guid.response";
import { AtivarInativarUsuarioResponse } from "../../core/responses/usuarios/ativar-inativar-usuario.response";
import { ObterUsuariosConvidadosPaginationResponse } from "../../core/responses/usuarios/obter-usuarios-convidados-pagination.response";
import { ObterEmpresasGrupoEconomicoResponse } from "../../core/responses/usuarios/obter-empresas-grupo-economico.response";
import { ObterUsuariosEmpresaResponse } from "../../core/responses/usuarios/obter-usuarios-empresa.response";
import { ObterPerfisConvidadosResponse } from "../../core/responses/usuarios/obter-perfis-convidados.response";
import { ExcluirUsuarioConvidadoResponse } from "../../core/responses/usuarios/excluir-usuario-convidado.response";
import { ObterUsuarioConvidadoResponse } from "../../core/responses/usuarios/obter-usuario-convidado.response";
import { ConvidarUsuarioRequest } from "../../core/requests/usuarios/convidar-usuario.request";
import { CriarUsuarioConvidadoResponse } from "../../core/responses/usuarios/criar-usuario-convidado.response";

@Injectable()
export class UsuariosService implements IUsuariosService {
  constructor(private appSettings: AppSettings, private http: HttpClient) { }

  api: string = `${this.appSettings.baseUrlBackofficeApi}usuarios`;

  obterUsuarios(pageIndex: number, pageSize: number, filtro: any, sort: string = ''): Observable<ObterUsuariosPaginationResponse> {
    let url = `${this.api}/empresas`;
    let params = new HttpParams()
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize)
      .set('sort', sort);

    return this.http
      .post<ObterUsuariosPaginationResponse>(url, filtro, { params: params })
      .pipe(map((data) => this.transformToObterUsuariosResponse(data)));
  }

  obterUsuarioPorGuid(usuarioGuid: string, empresaId: number) {
    let url = `${this.api}/${usuarioGuid}`;

    const params = new HttpParams().set('empresaId', empresaId)

    return this.http.get<ObterUsuarioPorGuidResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterUsuarioPorGuid(data)));
  }

  criarUsuarioEmpresa(usuario: CriarUsuarioEmpresaRequest) {
    return this.http
      .post<CriarUsuarioEmpresaResponse>(this.api, usuario)
      .pipe(map((data) => this.transformToCriarUsuarioEmpresaResponse(data)));
  }

  atualizarUsuario(usuarioGuid: string, usuario: CriarUsuarioEmpresaRequest) {
    let url = `${this.api}/${usuarioGuid}`;

    return this.http
      .put<AtualizarUsuarioEmpresaResponse>(url, usuario)
      .pipe(
        map((data) => this.transformToAtualizarUsuarioEmpresaResponse(data))
      );
  }

  ativarUsuario(usuarioGuid: string): Observable<AtivarInativarUsuarioResponse> {
    let url = `${this.api}/${usuarioGuid}/ativar`;

    return this.http.put<AtivarInativarUsuarioResponse>(url, null)
      .pipe(map(data => this.transformToAtivarInativarUsuario(data)));
  }

  inativarUsuario(usuarioGuid: string) {
    let url = `${this.api}/${usuarioGuid}/inativar`;

    return this.http.delete<AtivarInativarUsuarioResponse>(url)
      .pipe(map(data => this.transformToAtivarInativarUsuario(data)));
  }

  //#region Convidados

  obterUsuariosConvidados(empresaId: number, filtro: any) {
    let url = `${this.api}/convidados/empresa/${empresaId}`;

    let params = new HttpParams();
    Object.keys(filtro).forEach((key) => {
      if (filtro[key] && (key == "empresaIdConvidado" || key == "perfilId")) {
        filtro[key].forEach(value => { params = params.append(key, value) });
      }
      else if (filtro[key] !== '' || filtro[key].length !== 0) params = params.append(key, filtro[key])
    });

    return this.http.get<ObterUsuariosConvidadosPaginationResponse>(url, { params: params })
      .pipe(map(data => this.transformToObterUsuarioConvidadosResponse(data)));
  }

  obterEmpresasGrupoEconomico(empresaId: number) {
    let url = `${this.appSettings.baseUrlBackofficeApi}empresas/${empresaId}/grupo-economico`;

    return this.http.get<ObterEmpresasGrupoEconomicoResponse>(url)
      .pipe(map(data => this.transformToObterEmpresasGrupoEconomicoResponse(data)));
  }

  obterUsuariosEmpresa(empresaIdConvidado: number) {
    let url = `${this.api}/convidados/empresa-convidado/${empresaIdConvidado}`;

    return this.http.get<ObterUsuariosEmpresaResponse>(url)
      .pipe(map(data => this.transformToObterUsuariosEmpresaResponse(data)));
  }

  obterPerfisConvidados(empresaId: number) {
    let url = `${this.api}/convidados/empresa/${empresaId}/perfis`;

    return this.http.get<ObterPerfisConvidadosResponse>(url)
      .pipe(map(data => this.transformToObterPerfisConvidadosResponse(data)));
  }

  criarUsuarioConvidado(convidarUsuarioRequest: ConvidarUsuarioRequest) {
    let url = `${this.api}/convidados`;

    return this.http.post<CriarUsuarioConvidadoResponse>(url, convidarUsuarioRequest)
      .pipe(map(data => this.transformToCriarUsuarioConvidadoResponse(data)));
  }

  atualizarUsuarioConvidado(convidarUsuarioRequest: ConvidarUsuarioRequest) {
    let url = `${this.api}/convidados`;

    return this.http.put<CriarUsuarioConvidadoResponse>(url, convidarUsuarioRequest)
      .pipe(map(data => this.transformToCriarUsuarioConvidadoResponse(data)));
  }

  excluirUsuarioConvidado(usuarioConvidadoId: number) {
    let url = `${this.api}/convidados/${usuarioConvidadoId}`;

    return this.http.delete<ExcluirUsuarioConvidadoResponse>(url)
      .pipe(map(data => this.transformToExcluirUsuarioConvidadoResponse(data)));
  }

  obterUsuarioConvidado(usuarioConvidadoId: number) {
    let url = `${this.api}/convidados/${usuarioConvidadoId}`;

    return this.http.get<ObterUsuarioConvidadoResponse>(url)
      .pipe(map(data => this.transformToObterUsuarioConvidadoResponse(data)));
  }

  //#region Private

  private transformToObterUsuarioConvidadosResponse(data: any): ObterUsuariosConvidadosPaginationResponse {
    let response: ObterUsuariosConvidadosPaginationResponse = new ObterUsuariosConvidadosPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.usuarios = data.result.usuarios;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterEmpresasGrupoEconomicoResponse(data: any): ObterEmpresasGrupoEconomicoResponse {
    let response: ObterEmpresasGrupoEconomicoResponse = new ObterEmpresasGrupoEconomicoResponse()

    if (data.isSuccessful) {
      response.empresas = data.result.empresas;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterUsuariosEmpresaResponse(data: any): ObterUsuariosEmpresaResponse {
    let response: ObterUsuariosEmpresaResponse = new ObterUsuariosEmpresaResponse()

    if (data.isSuccessful) {
      response.usuariosConvidados = data.result.usuariosConvidados;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterPerfisConvidadosResponse(data: any): ObterPerfisConvidadosResponse {
    let response: ObterPerfisConvidadosResponse = new ObterPerfisConvidadosResponse()

    if (data.isSuccessful) {
      response.perfis = data.result.perfis;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarUsuarioConvidadoResponse(data: any): CriarUsuarioConvidadoResponse {
    let response: CriarUsuarioConvidadoResponse = new CriarUsuarioConvidadoResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToExcluirUsuarioConvidadoResponse(data: any): ExcluirUsuarioConvidadoResponse {
    let response: ExcluirUsuarioConvidadoResponse = new ExcluirUsuarioConvidadoResponse()

    if (data.isSuccessful) {
      response = data.result;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterUsuarioConvidadoResponse(data: any): ObterUsuarioConvidadoResponse {
    let response: ObterUsuarioConvidadoResponse = new ObterUsuarioConvidadoResponse()

    if (data.isSuccessful) {
      response = data.result;
      response.empresaId = data.result.empresaId;
      response.empresaIdConvidado = data.result.empresaIdConvidado;
      response.perfilId = data.result.perfilId;
      response.usuarioId = data.result.usuarioId;
      response.nomeUsuario = data.result.nomeUsuario;
      response.email = data.result.email;
      response.ativo = data.result.ativo;
      response.cnpj = data.result.cnpj;
      response.nomeEmpresa = data.result.nomeEmpresa;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  //#endregion

  //#endregion

  //#region Private
  private transformToObterUsuariosResponse(data: any): ObterUsuariosPaginationResponse {
    let response: ObterUsuariosPaginationResponse = new ObterUsuariosPaginationResponse()

    if (data.isSuccessful) {
      response.totalItems = data.result.totalItems;
      response.usuarios = data.result.usuarios;
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToObterUsuarioPorIdResponse(data: any): ObterUsuarioPorIdResponse {
    let response: ObterUsuarioPorIdResponse = new ObterUsuarioPorIdResponse()

    if (data.isSuccessful) {
      response = data.result.usuarios[0];
      return response
    }

    data.errors.forEach((error: ErrorMessage) => { response.addError(error.code, error.message, error.propertyName) });
    return response;
  }

  private transformToCriarUsuarioEmpresaResponse(
    data: any
  ): CriarUsuarioEmpresaResponse {
    let response: CriarUsuarioEmpresaResponse =
      new CriarUsuarioEmpresaResponse();

    if (data.isSuccessful) {
      response = <CriarUsuarioEmpresaResponse>{
        nome: data.result.nome,
        usuarioGuid: data.result.usuarioGuid,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToAtualizarUsuarioEmpresaResponse(
    data: any
  ): AtualizarUsuarioEmpresaResponse {
    let response: AtualizarUsuarioEmpresaResponse =
      new AtualizarUsuarioEmpresaResponse();

    if (data.isSuccessful) {
      response = <AtualizarUsuarioEmpresaResponse>{
        usuarioId: data.result.usuarioId,
        primeiroNome: data.result.primeiroNome,
        sobrenome: data.result.sobrenome,
        email: data.result.email,
        perfilId: data.result.perfilId,
        departamentoId: data.result.departamentoId,
        cargoId: data.result.cargoId,
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToObterUsuarioPorGuid(data: any): ObterUsuarioPorGuidResponse {
    let response: ObterUsuarioPorGuidResponse = new ObterUsuarioPorGuidResponse();

    if (data.isSuccessful) {
      response = <ObterUsuarioPorGuidResponse>{
        id: data.result.id,
        empresaId: data.result.empresaId,
        perfil: data.result.perfil,
        usuarioGuid: data.result.usuarioGuid,
        primeiroNome: data.result.primeiroNome,
        sobrenome: data.result.sobrenome,
        nomeCompleto: data.result.nomeCompleto,
        documento: data.result.documento,
        email: data.result.email,
        ativo: data.result.ativo,
        telefone: data.result.telefone,
        ramal: data.result.ramal,
        departamentoId: data.result.departamentoId,
        cargoId: data.result.cargoId,
        criadoEm: data.result.criadoEm,
        modificadoEm: data.result.modificadoEm
      };

      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  private transformToAtivarInativarUsuario(data: any): AtivarInativarUsuarioResponse {
    let response: AtivarInativarUsuarioResponse = new AtivarInativarUsuarioResponse();

    if (data.isSuccessful) {
      response.usuarioGuid = data.result.usuarioGuid;
      return response;
    }

    data.errors.forEach((error: ErrorMessage) => {
      response.addError(error.code, error.message, error.propertyName);
    });

    return response;
  }

  //#endregion
}
