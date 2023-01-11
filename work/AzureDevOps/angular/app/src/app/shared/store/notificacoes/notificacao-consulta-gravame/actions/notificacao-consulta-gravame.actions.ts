import { createAction, props } from "@ngrx/store";
import { INotificacaoConsultaGravame } from "../notificacao-consulta-gravame.model";

export const notificarConsultaGravame = createAction('[Notificacao] notificar consulta gravame', props<{ payload: INotificacaoConsultaGravame }>());