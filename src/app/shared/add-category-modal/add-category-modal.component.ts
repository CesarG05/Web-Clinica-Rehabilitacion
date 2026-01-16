import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.scss']
})
export class AddCategoryModalComponent {

  @Input() title: string = 'Agregar categoría';
  @Input() confirmText: string = 'Guardar';
  @Input() cancelText: string = 'Cancelar';

  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  nombreCategoria: string = '';

  // Cerrar si hace click fuera
  onBackdropClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.cancel.emit();
    }
  }

  guardar() {
    if (!this.nombreCategoria.trim()) return;
    this.save.emit(this.nombreCategoria.trim());
  }
}
