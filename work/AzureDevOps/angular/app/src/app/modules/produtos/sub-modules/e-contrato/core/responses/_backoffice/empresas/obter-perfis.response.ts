import { BaseResponse } from 'src/app/core/responses/base.response';
import { Perfis } from '../../../models/empresas/perfis.model';

export class ObterPerfisResponse extends BaseResponse {
  pageIndex: number;
  totalItems: number;
  perfis: Perfis[];
}
