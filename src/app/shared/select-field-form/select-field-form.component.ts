import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-field-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-field-form.component.html',
  styleUrls: ['./select-field-form.component.scss']
})
export class SelectFieldFormComponent {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() icon: string = '';
  @Input() options: any[] = [];

  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>(); 

  onChange(value: any) {
    this.modelChange.emit(value);
  }

}