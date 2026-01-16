import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-field-search.component.html',
  styleUrls: ['./input-field-search.component.scss']
})
export class InputFieldSearchComponent {
   @Input() label: string = '';
   @Input() iconPath?: string;
   @Input() type: string = 'text';
   @Input() model: any;

   @Output() modelChange = new EventEmitter<string>();
   @Output() search = new EventEmitter<string>();

   private debounceTimer: any;


  onInputChange(event: any): void {
    let value = event.target.value;

    if (this.type === 'text') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    this.model = value;
    this.modelChange.emit(this.model);

    // Cancelar cualquier búsqueda pendiente
    clearTimeout(this.debounceTimer);

    const trimmed = this.model.trim();

    if (trimmed.length === 0) {
      this.search.emit('');
      return;
    }

    // Si hay al menos 3 caracteres, hacer búsqueda con debounce
    if (trimmed.length >= 3) {
      this.debounceTimer = setTimeout(() => {
        this.search.emit(trimmed);
      }, 500);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.type === 'text') {
      const allowedChars = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;

      // Permitir teclas especiales como borrar, tab, flechas, etc.
      const specialKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Shift'];

      if (!specialKeys.includes(event.key) && !allowedChars.test(event.key)) {
        event.preventDefault(); // Bloquea la tecla
      }
    }
  }
}
