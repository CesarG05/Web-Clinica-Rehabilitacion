import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-field-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-field-form.component.html',
  styleUrls: ['./date-field-form.component.scss']
})
export class DateFieldFormComponent {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() icon: string = '';

  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>(); 

  onChange(value: any) {
    this.modelChange.emit(value);
  }
}
