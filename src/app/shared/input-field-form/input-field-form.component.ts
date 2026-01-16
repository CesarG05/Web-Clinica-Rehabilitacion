import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-field-form.component.html',
  styleUrls: ['./input-field-form.component.scss']
})
export class InputFieldFormComponent {
  @Input() label: string = '';
  @Input() type: 'text' | 'number' | 'textarea' | 'email' | 'time' | 'password' | 'currency' = 'text';
  @Input() iconPath?: string;
  @Input() placeholder: string = '';
  @Input() model: any;            
  @Input() required: boolean = false;
  @Input() errorMessage: string = 'Este campo es obligatorio';
  @Input() submitted: boolean = false;
  @Input() step: string | number = '';

  @Output() modelChange = new EventEmitter<any>(); 
  @Output() numericValue = new EventEmitter<number>(); 

  // Formatear con comas, sin decimales obligatorios
  formatCurrencyDisplay(value: string): string {
    if (!value) return '';

    const clean = value.replace(/,/g, ''); 

    const number = Number(clean);
    if (isNaN(number)) return value;

    return number.toLocaleString('en-US'); 
  }

  // Cuando el usuario escribe
  onCurrencyInput(event: any) {
    let raw = event.target.value;

    // Quitar comas anteriores
    raw = raw.replace(/,/g, '');

    // Convertir a número real
    const numberValue = Number(raw);

    // Formatear para mostrar
    const formattedDisplay = this.formatCurrencyDisplay(raw);

    this.model = formattedDisplay;       
    // this.modelChange.emit(formattedDisplay);
    this.modelChange.emit(numberValue);


    this.numericValue.emit(numberValue);  
  }

  // Cuando el input pierde el foco
  onCurrencyBlur() {
    if (!this.model) return;

    const clean = this.model.replace(/,/g, '');
    const numberValue = Number(clean);

    this.model = this.formatCurrencyDisplay(clean);

    this.modelChange.emit(numberValue); 
    this.numericValue.emit(numberValue);
  }
}
