import { Observable } from "rxjs";
import { EnderecoResponse } from "../../core/responses/geograficos/endereco.response";
import { MunicipioResponse } from "../../core/responses/geograficos/municipio.response";

export interface IGeograficoService {
    obterMunicipiosPorUf(uf: string): Observable<MunicipioResponse>;
    obterEnderecoPorCep(cep: string): Observable<EnderecoResponse>;
}