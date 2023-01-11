import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[type=number], input[numbers-only]'
})
export class NumbersOnlyDirective {

  constructor(private elRef: ElementRef, private control: NgControl) { }

  @Input('numbers-only') maxLength: number = null;

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this.elRef.nativeElement.value;
    this.elRef.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');

    if (this.maxLength !== null) { if (this.elRef.nativeElement.value > this.maxLength) { this.elRef.nativeElement.value.slice(0, this.maxLength); } }
    this.control.control.setValue(this.elRef.nativeElement.value);

    if (initalValue !== this.elRef.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
