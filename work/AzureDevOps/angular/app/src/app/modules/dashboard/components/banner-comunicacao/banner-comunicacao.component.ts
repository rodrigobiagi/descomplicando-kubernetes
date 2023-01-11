import { Component, Input, OnInit } from '@angular/core';
import { BannerComunicacaoMKT } from '../../core/models/banner-comunicacao-mkt.model';

@Component({
  selector: 'app-banner-comunicacao',
  templateUrl: './banner-comunicacao.component.html',
  styleUrls: ['./banner-comunicacao.component.scss']
})
export class BannerComunicacaoComponent implements OnInit {

  constructor() { }

  @Input() slides: BannerComunicacaoMKT[];

  ngOnInit(): void {
  }

}
