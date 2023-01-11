import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppSettings } from "src/app/configs/app-settings.config";
import { ErrorMessage } from "src/app/core/responses/error-message";
import { Municipio } from "../core/models/geograficos/municipio.model";
import { EnderecoResponse } from "../core/responses/geograficos/endereco.response";
import { MunicipioResponse } from "../core/responses/geograficos/municipio.response";
import { UfsLicenciamentoResponse } from "../core/responses/geograficos/ufs-licenciamento.response";
import { IGeograficoService } from "./interfaces/geografico.service";

@Injectable()
export class GeograficoService implements IGeograficoService {

    constructor(private appSettings: AppSettings, private http: HttpClient) { }

    obterMunicipiosPorUf(uf: string): Observable<MunicipioResponse> {
        let url = this.appSettings.baseUrlApi + `geografico/${uf}/municipios`;

        return this.http.get<MunicipioResponse>(url)
            .pipe(map(data => this.transformToMunicipiosResponse(data)))
    }

    obterEnderecoPorCep(cep: string): Observable<EnderecoResponse> {
        let url = this.appSettings.baseUrlApi + `geografico/${cep}/endereco`;

        return this.http.get<EnderecoResponse>(url)
            .pipe(map(data => this.transformToEnderecoResponse(data)));
    }

    obterUfsLicenciamento(): Observable<UfsLicenciamentoResponse> {
        let url = this.appSettings.baseUrlApi + `geografico/ufs/licenciamento`;

        return this.http.get<UfsLicenciamentoResponse>(url)
            .pipe(map(data => this.transformToUfsLicenciamentoResponse(data)));
    }

    private transformToMunicipiosResponse(data: any): MunicipioResponse {
        let response: MunicipioResponse = new MunicipioResponse();

        if (data.isSuccessful) {

            data.result.forEach((municipio: Municipio) => {
                response.municipios.push(municipio);
            });

            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message);
        })

        return response;
    }

    private transformToEnderecoResponse(data: any): EnderecoResponse {
        let response: EnderecoResponse = new EnderecoResponse();

        if (data.isSuccessful) {

            response.endereco.logradouro = data.result.logradouro;
            response.endereco.bairro = data.result.bairro;
            response.endereco.municipio = data.result.localidade;
            response.endereco.uf = data.result.uf;

            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message);
        })

        return response;
    }

    private transformToUfsLicenciamentoResponse(data: any): UfsLicenciamentoResponse {
        let response: UfsLicenciamentoResponse = new UfsLicenciamentoResponse;

        if (data.isSuccessful) {
            response.sigla = data.result.sigla;
            return response;
        }

        data.errors.forEach((error: ErrorMessage) => {
            response.addError(error.code, error.message)
        });

        return response;
    }
}