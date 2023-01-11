import { createReducer, on } from "@ngrx/store";
import { NotificacaoConsultaGravameActions } from "./actions";

export interface INotificacaoConsultaGravameState {
  usuarioGuid: string;
  codigo: number;
  descricao: string;
  anoModelo: number;
  anoFabricacao: number;
  remarcado: number;
  dataVigenciaContrato: string;
  cnpjAgente: string;
}

const initializeState: INotificacaoConsultaGravameState = {
  usuarioGuid: '',
  codigo: null,
  descricao: '',
  anoModelo: null,
  anoFabricacao: null,
  remarcado: null,
  dataVigenciaContrato: '',
  cnpjAgente: ''
}

export const notificacaoConsultaGravameReducer = createReducer<INotificacaoConsultaGravameState>(
  initializeState,
  on(NotificacaoConsultaGravameActions.notificarConsultaGravame, (state, action): INotificacaoConsultaGravameState => {
    return {
      ...state,
      usuarioGuid: action.payload.usuarioGuid,
      codigo: action.payload.codigo,
      descricao: action.payload.descricao,
      anoModelo: action.payload.anoModelo,
      anoFabricacao: action.payload.anoFabricacao,
      remarcado: action.payload.remarcado,
      dataVigenciaContrato: action.payload.dataVigenciaContrato,
      cnpjAgente: action.payload.cnpjAgente
    }
  }));
