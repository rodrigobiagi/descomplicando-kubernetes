import { createReducer, on } from "@ngrx/store"
import { NotificacaoInconsistenciaValidadorActions } from "./actions"

export interface INotificacaoInconsistenciaValidadorState {
    usuarioGuid: string;
    message: string
}

const initializeState: INotificacaoInconsistenciaValidadorState = {
    usuarioGuid: '',
    message: ''
}

export const notificacaoInconsistenciaValidadorReducer = createReducer<INotificacaoInconsistenciaValidadorState>(
    initializeState,
    on(NotificacaoInconsistenciaValidadorActions.notificarInconsistenciaValidador, (state, action): INotificacaoInconsistenciaValidadorState => {
        return {
            ...state,
            usuarioGuid: action.payload.usuarioGuid,
            message: action.payload.message
        }
    })
)
