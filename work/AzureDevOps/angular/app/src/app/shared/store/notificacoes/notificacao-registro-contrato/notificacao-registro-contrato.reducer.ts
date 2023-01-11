import { createReducer, on } from "@ngrx/store"
import { NotificacaoRegistroContratoActions } from "./actions"

export interface INotificacaoRegistroContratoState {
    usuarioGuid: string;
    codigo: number;
    mensagem: string;
}

const initializeState: INotificacaoRegistroContratoState = {
    usuarioGuid: '',
    codigo: 0,
    mensagem: ''
}

export const notificacaoRegistroContratoReducer = createReducer<INotificacaoRegistroContratoState>(
    initializeState,
    on(NotificacaoRegistroContratoActions.notificarRegistroContrato, (state, action): INotificacaoRegistroContratoState => {
        return {
            ...state,
            usuarioGuid: action.payload.usuarioGuid,
            codigo: action.payload.codigo,
            mensagem: action.payload.mensagem
        }
    })
)
