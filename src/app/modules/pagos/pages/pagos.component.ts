import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetallePagoCreate } from '../models/detalle-pago-create.model';
import { PagoService } from '../service/pago.service';
import { PagoCreate } from '../models/pago-create.model';
import { BackHeaderComponent } from '../../../shared/back-header/back-header.component';
import { ServicioGrupo } from '../../servicios/models/servicio-grupo.model';
import { ServicioService } from '../../servicios/services/servicio.service';
import { AlertService } from '../../../shared/alert/alert.service';
import { Servicio } from '../../servicios/models/servicio.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, BackHeaderComponent],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
})
export class PagosComponent {

  private pagoService = inject(PagoService);
  private serviciosService = inject(ServicioService);
  private alertService = inject(AlertService);

  // Buscador
  busquedaServicio: string = '';
  servicios: ServicioGrupo[] = [];
  serviciosFiltrados: ServicioGrupo[] = [];
  disponibilidadServicio: boolean = true;
  
  // Detalles
  detalles: DetallePagoCreate[] = [];

  // Pago
  metodoPagoId = 1; // 1 efectivo, 2 tarjeta
  valorDescuento = 0;
  usuarioId = 1;

  aplicarDescuento = false;
  montoRecibido = 0;

  // Modal de confirmación de pago
  mostrarModalPago = false;

  mostrarModalExito = false;
  mostrarModalTicket = false;
  pagoIdGenerado?: number;


  @ViewChild('buscador') buscadorRef!: ElementRef;
  mostrarResultados = false;

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios() {
     this.serviciosService.getServicios(this.disponibilidadServicio)
    .subscribe({
      next: (res: ServicioGrupo[]) => {
        this.servicios = res;
        this.serviciosFiltrados = this.servicios;
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al cargar servicios.')
      },
    });  
  }

  filtrarServicios(): void {

    if (!this.busquedaServicio.trim()) {
      this.serviciosFiltrados = this.servicios;
      this.mostrarResultados = true;
      return;
    }

    const term = this.busquedaServicio.toLowerCase();

    this.serviciosFiltrados = this.servicios
      .map(g => ({
        ...g,
        servicios: g.servicios.filter(s =>
          s.nombre?.toLowerCase().includes(term) ||
          s.descripcion?.toLowerCase().includes(term) ||
          s.id.toString().includes(term) ||
          s.costo.toString().includes(term)
        )
      }))
      .filter(g => g.servicios.length > 0);

    this.mostrarResultados = this.serviciosFiltrados.length > 0;
  }

  agregarServicio(servicio: Servicio) {
    const existente = this.detalles.find(d => d.servicioId === servicio.id);

    if (existente) {
      existente.cantidad++;
    } else {
      this.detalles.push({
        servicioId: servicio.id,
        servicioNombre: servicio.nombre,
        cantidad: 1,
        montoUnidad: servicio.costo
      });
    }

    this.busquedaServicio = '';
    this.serviciosFiltrados = this.servicios;
    this.mostrarResultados = false;
  }

  eliminarDetalle(index: number) {
    this.detalles.splice(index, 1);
  }

  get totalBruto(): number {
    return this.detalles.reduce(
      (sum, d) => sum + d.cantidad * d.montoUnidad, 0
    );
  }

  get totalNeto(): number {
    return this.totalBruto - this.valorDescuento;
  }

  get pagoValido(): boolean {
    if (this.detalles.length === 0) return false;

    if (this.totalNeto <= 0) return false;

    if (this.aplicarDescuento) {
      if (this.valorDescuento <= 0) return false;
      if (this.valorDescuento > this.totalBruto) return false;
    }

    if (!this.metodoPagoId) return false;

    if (this.metodoPagoId === 1) {
      if (this.montoRecibido <= 0) return false;
      if (this.montoRecibido < this.totalNeto) return false;
    }

    return true;
  }

  realizarPago() {
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;

    const detallesPayload = this.detalles.map(d => ({
      servicioId: d.servicioId,
      cantidad: d.cantidad,
      montoUnidad: d.montoUnidad
    }));

    const now = new Date();
    const fechaPagoLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const payload: PagoCreate = {
      fechaPago: fechaPagoLocal,
      metodoPagoId: this.metodoPagoId,
      totalBruto: this.totalBruto,
      valorDescuento: this.valorDescuento,
      totalNeto: this.totalNeto,
      usuarioId: user ? user.id : this.usuarioId,
      detalles: detallesPayload
    };

    this.pagoService.createPago(payload).subscribe({
      next: (res) => {
        this.pagoIdGenerado = res.id;
        this.mostrarModalExito = true;

        this.detalles = [];
        this.valorDescuento = 0;
        this.metodoPagoId = 1;
        this.montoRecibido = 0;
      },
      error: (err) => {
        this.alertService.error(err?.message || 'Error al realizar el pago.');
      }
    })
  }

  incrementarCantidad(detalle: DetallePagoCreate) {
    detalle.cantidad++;
  }

  decrementarCantidad(detalle: DetallePagoCreate) {
    if (detalle.cantidad > 1) {
      detalle.cantidad--;
    }
  }

  onCambioDescuento(aplica: boolean) {
    if (!aplica) {
      this.valorDescuento = 0;
    }
  }

  onDescuentoInput() {
    if (this.valorDescuento == null || this.valorDescuento < 0) {
      this.valorDescuento = 0;
    }
  }

  // Funciones para el modal de confirmación de pago
  abrirModalPago() {
    this.mostrarModalPago = true;
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
  }

  confirmarPago() {
    this.mostrarModalPago = false;
    this.realizarPago(); 
  }

  // Función para abrir el modal del ticket
  abrirModalTicket() {
    this.mostrarModalExito = false;
    this.mostrarModalTicket = true;
  }

  cerrarTodo() {
    this.mostrarModalExito = false;
    this.mostrarModalTicket = false;

    this.pagoIdGenerado = undefined;
  }

  imprimirTicket() {
    this.mostrarModalTicket = false;

    this.pagoService.getTicketPago(this.pagoIdGenerado!).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(
          new Blob([pdf], { type: 'application/pdf' })
        );

        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        this.pagoIdGenerado = undefined;
      },
      error: (err) => {
        this.alertService.error( err?.message || 'Error al abrir el ticket.');
      }
    });
  }

  // imprimirTicket() {
  //   this.mostrarModalTicket = false;

  //   this.pagoService.getTicketPago(this.pagoIdGenerado!).subscribe({
  //     next: (pdf) => {
  //       const url = URL.createObjectURL( new Blob([pdf], { type: 'application/pdf' }));
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = `ticket_pago_${this.pagoIdGenerado}.pdf`;
  //       a.click();
  //       URL.revokeObjectURL(url);
  //       this.pagoIdGenerado = undefined;
  //     },
  //     error: (err) => {
  //       this.alertService.error( err?.message || 'Error al imprimir el ticket.');
  //     }
  //   });
  // }

  // Detecta click fuera del buscador para ocultar resultados
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.buscadorRef?.nativeElement.contains(event.target)) {
      this.mostrarResultados = false;
    }
  }
}
