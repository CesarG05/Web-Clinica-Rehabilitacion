import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-modal.component.html',
  styleUrls: ['./select-modal.component.scss']
})
export class SelectModalComponent {
  @Input() title = 'Seleccionar opción';
  @Input() options: SelectOption[] = [];
  @Input() selectedValue: any = null;
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.cancel.emit();
    }
  }

  onConfirm() {
    if (this.selectedValue !== null) {
      this.confirm.emit(this.selectedValue);
    }
  }
}
