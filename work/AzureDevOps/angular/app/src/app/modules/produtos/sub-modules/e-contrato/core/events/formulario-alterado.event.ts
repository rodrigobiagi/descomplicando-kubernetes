import { NomeFormularioRegistro } from "../enums/tipo-formulario-registro.enum";

export interface FormularioAlteradoEvent {
    isValid: boolean;
    nomeFormularioRegitro: NomeFormularioRegistro;
}