import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SesionTratamiento } from '../../modules/historiales-clinicos/models/sesion-tratamiento.model';

@Component({
  selector: 'app-session-item',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './session-item.component.html',
  styleUrls: ['./session-item.component.scss']
})
export class SessionItemComponent {

  @Input({ required: true }) sesion!: SesionTratamiento;

  @Output() verNotas = new EventEmitter<SesionTratamiento>();
  @Output() cambiarEstado = new EventEmitter<SesionTratamiento>();
  @Output() eliminar = new EventEmitter<SesionTratamiento>();

  menuAbierto = false;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  onVerNotas(event: MouseEvent) {
    event.stopPropagation();
    this.verNotas.emit(this.sesion);
    this.menuAbierto = false;
  }

  onCambiarEstado(event: MouseEvent) {
    event.stopPropagation();
    this.cambiarEstado.emit(this.sesion);
    this.menuAbierto = false;
  }

  onEliminar(event: MouseEvent) {
    event.stopPropagation();
    this.eliminar.emit(this.sesion);
    this.menuAbierto = false;
  }

  @HostListener('document:click')
  onClickOutside() {
    this.menuAbierto = false;
  }

  toLocalDate(dateStr: string): Date {
    return new Date(dateStr + 'Z');
  }
}
