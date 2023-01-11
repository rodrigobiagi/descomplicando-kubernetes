import { Component, Input, OnInit } from '@angular/core';
import { Atalho } from '../../core/models/btn-atalho.model';

@Component({
  selector: 'app-atalhos',
  templateUrl: './atalhos.component.html',
  styleUrls: ['./atalhos.component.scss']
})
export class AtalhosComponent implements OnInit {

  constructor() { }

  @Input() icon: string;
  @Input() title: string;

  ngOnInit(): void {
  }

}
