import { Component, OnInit, inject } from "@angular/core";
import { BackHeaderComponent } from "../../../../shared/back-header/back-header.component";
import { CommonModule } from "@angular/common";
import { InfoClinica } from "../../models/info-clinica.model";
import { InfoClinicaUpdate } from "../../models/info-clinica-update.model";
import { InfoClinicaService } from "../../service/info-clinica.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-info-clinica',
  standalone: true,
  imports: [CommonModule, BackHeaderComponent, FormsModule],
  templateUrl: './info-clinica.component.html',
  styleUrls: ['./info-clinica.component.scss']
})
export class InfoClinicaComponent implements OnInit {

  private infoService = inject(InfoClinicaService);

  info?: InfoClinica;

  campoEditando: keyof InfoClinicaUpdate | null = null;
  valorTemporal = '';
  imagenPreview?: string;
  imagenFile?: File;

  ngOnInit(): void {
    this.cargarInfo();
  }

  cargarInfo() {
    this.infoService.getInfoClinica().subscribe(res => {
      this.info = res;
      this.imagenPreview = res.logoUrl;
    });
  }

  editarCampo(campo: keyof InfoClinicaUpdate, valorActual: string) {
    this.campoEditando = campo;
    this.valorTemporal = valorActual;
  }

  cancelar() {
    this.campoEditando = null;
    this.valorTemporal = '';
  }

  guardar() {
    if (!this.campoEditando) return;

    const payload: InfoClinicaUpdate = {
      [this.campoEditando]: this.valorTemporal
    };

    this.infoService.updateInfoClinica(payload).subscribe(() => {
      this.campoEditando = null;
      this.cargarInfo();
    });
  }

  seleccionarImagen(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.imagenFile = file;
    this.imagenPreview = URL.createObjectURL(file);

    const payload: InfoClinicaUpdate = {
      logo: file
    };

    this.infoService.updateInfoClinica(payload).subscribe(() => {
      this.cargarInfo();
    });
  }
}
