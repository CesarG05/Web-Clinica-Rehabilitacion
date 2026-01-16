import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteCreate } from '../../models/paciente-create.model';
import { PacienteService } from '../../services/paciente.service';
import { Router } from '@angular/router';
import { InputFieldFormComponent } from '../../../../shared/input-field-form/input-field-form.component';
import { AlertService } from '../../../../shared/alert/alert.service';
import { SelectFieldFormComponent } from '../../../../shared/select-field-form/select-field-form.component';
import { DateFieldFormComponent } from '../../../../shared/date-field-form/date-field-form.component';
import { BackHeaderComponent } from '../../../../shared/back-header/back-header.component';

@Component({
  selector: 'app-nuevo-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldFormComponent, SelectFieldFormComponent, DateFieldFormComponent, BackHeaderComponent],
  templateUrl: './nuevo-paciente.component.html',
  styleUrls: ['./nuevo-paciente.component.scss']
})
export class NuevoPacienteComponent {
  private alertService = inject(AlertService);
  private pacienteService = inject(PacienteService);
  private router = inject(Router);

  paciente: PacienteCreate = {
    primerNombre: '',
    segundoNombre: null,
    primerApellido: '',
    segundoApellido: null,
    fechaNacimiento: '',
    sexoId: 1,
    direccion: '',
    telefono: '',
    correoElectronico: null
  };

  sexos = [
    { id: 1, nombre: 'Masculino' },
    { id: 2, nombre: 'Femenino' }
  ];

  cargando = false;
  submitted = false;

  guardarPaciente(): void {
    this.submitted = true;

    if (!this.paciente.primerNombre || !this.paciente.primerApellido || !this.paciente.fechaNacimiento) {
      this.alertService.warning('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.cargando = true;

    this.pacienteService.createPaciente(this.paciente).subscribe({
      next: () => {
        this.cargando = false;
        this.alertService.success('Paciente registrado exitosamente.');
        this.router.navigate(['/pacientes']);
      },
      error: (err) => {
        this.cargando = false;
        this.alertService.error(err?.message || 'Ocurrió un error al registrar el paciente.');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }
}
