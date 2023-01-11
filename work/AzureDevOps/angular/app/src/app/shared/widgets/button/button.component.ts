import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {

  @Input() route?: string;
  @Input() labelText?: string;
  @Input() icon?: string;
  @Input() disable?: boolean;

  constructor() { }

  ngOnInit(): void {
  }
}
