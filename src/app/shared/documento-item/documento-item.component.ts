import { CommonModule, DatePipe } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DocumentoTratamiento } from "../../modules/historiales-clinicos/models/documento-tratamiento.model";

@Component({
  selector: 'app-documento-item',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './documento-item.component.html',
  styleUrls: ['./documento-item.component.scss']
})
export class DocumentoItemComponent {
    
    @Input({ required: true }) documento!: DocumentoTratamiento;

    @Output() verDocumento = new EventEmitter<DocumentoTratamiento>();
    @Output() descargarDocumento = new EventEmitter<DocumentoTratamiento>();
    @Output() eliminar = new EventEmitter<DocumentoTratamiento>();

    menuAbierto = false;

    toggleMenu(event: Event) {
        event.stopPropagation();
        this.menuAbierto = !this.menuAbierto;
    }

    cerrarMenu() {
      this.menuAbierto = false;
    }

    onVerDocumento(event: MouseEvent) {
        event.stopPropagation();
        this.verDocumento.emit(this.documento);
        this.menuAbierto = false;
    }

    onDescargarDocumento(event: MouseEvent) {
        event.stopPropagation();
        this.descargarDocumento.emit(this.documento);
        this.menuAbierto = false;
    }

    onEliminar(event: MouseEvent) {
        event.stopPropagation();
        this.eliminar.emit(this.documento);
        this.menuAbierto = false;
    }

    @HostListener('document:click')
      ClickOutside() {
        this.menuAbierto = false;
    }

     getIconoDocumento(): string {
        if (!this.documento?.rutaDocumento) {
            return 'assets/icons/img.png';
        }

        const cleanUrl = this.documento.rutaDocumento.split('?')[0];
        const ext = cleanUrl.split('.').pop()?.toLowerCase();

        if (ext === 'pdf') {
            return 'assets/icons/pdf.png';
        }

        return 'assets/icons/img.png';
    }

    formatearNombreDocumento(nombre: string): string {
    if (!nombre) return '';

    return nombre
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, c => c.toUpperCase());
    }
}