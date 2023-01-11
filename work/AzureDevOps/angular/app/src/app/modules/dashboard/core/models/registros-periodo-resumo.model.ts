import { ResumoEvolucaoDiaria } from "./resumo-evolucao-diaria.model";

export class RegistrosPeriodoResumo {
  periodoAtual: number;
  periodoAnterior: number;
  variacao: string;
  evolucaoDiaria: ResumoEvolucaoDiaria[];
}