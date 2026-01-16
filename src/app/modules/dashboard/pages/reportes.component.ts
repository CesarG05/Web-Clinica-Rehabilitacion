import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { BackHeaderComponent } from "../../../shared/back-header/back-header.component";
import { ReportesService } from "../services/reportes.service";
import { ReporteIngresos } from "../models/reporte-ingresos.model";
import { DashboardClinica } from "../models/dashboard-clinica.model";
import { AlertService } from "../../../shared/alert/alert.service";
import { Chart } from 'chart.js/auto';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, BackHeaderComponent, DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit, AfterViewInit {

  private alertService = inject(AlertService);
  private reportesService = inject(ReportesService);

  reporteIngresos?: ReporteIngresos;
  dashboardClinica?: DashboardClinica;
  
  cargandoDashboard = false;
  cargandoIngresos = false;

  // rango fechas
  fechaInicio = '2025-12-01';
  fechaFin = '2026-01-07';

  totalEfectivo = 0;
  totalTarjeta = 0;

  @ViewChild('chartPacientes') chartPacientesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartServicios') chartServiciosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSesiones') chartSesionesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartIngresos') chartIngresosRef!: ElementRef<HTMLCanvasElement>;

  chartIngresos?: Chart;
  chartPacientes?: Chart;
  chartServicios?: Chart;
  chartSesiones?: Chart;

  private viewInitialized = false;

  presetActivo: '7dias' | 'mes' | 'anio' | null = '7dias';

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    // Intentar crear las gráficas si ya tenemos datos
    this.tryCreateCharts();
  }

  ngOnInit(): void {
    this.setDefaultUltimos7Dias();
    this.cargarReporte();
  }

  private setDefaultUltimos7Dias() {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - 6);

    this.fechaInicio = inicio.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  cargarReporte() {
    this.cargandoDashboard = true;
    this.reportesService.getDashboard().subscribe({
      next: res => {
        this.dashboardClinica = res;
        this.cargandoDashboard = false;
        // Intentar crear las gráficas después de recibir datos
        this.tryCreateCharts();
      },
      error: err => {
        this.alertService.error(err?.message || 'Error al cargar el dashboard.');
        this.cargandoDashboard = false;
      }
    });

    this.cargandoIngresos = true;
    this.reportesService
      .getReporteIngresos(this.fechaInicio, this.fechaFin)
      .subscribe({
        next: res => {
          this.reporteIngresos = res;
          this.cargandoIngresos = false;
          // Intentar crear la gráfica de ingresos
          this.tryCreateCharts();
        },
        error: err => {
          this.alertService.error(err?.message || 'Error al cargar el reporte de ingresos.');
          this.cargandoIngresos = false;
        }
      });
  }

  private tryCreateCharts() {
    // Esperar a que la vista esté inicializada
    if (!this.viewInitialized) return;

    // Crear gráficas del dashboard si tenemos los datos
    // Usar setTimeout más largo para dar tiempo a que Angular renderice el @if
    if (this.dashboardClinica) {
      setTimeout(() => {
        if (this.chartPacientesRef && 
            this.chartServiciosRef && 
            this.chartSesionesRef) {
          this.crearGraficasDashboard();
        }
      }, 100);
    }

    // Crear gráfica de ingresos si tenemos los datos
    if (this.reporteIngresos) {
      setTimeout(() => {
        if (this.chartIngresosRef) {
          this.prepararGrafica();
        }
      }, 100);
    }
  }

  crearGraficasDashboard() {
    if (!this.dashboardClinica || 
        !this.chartPacientesRef || 
        !this.chartServiciosRef || 
        !this.chartSesionesRef) {
      return;
    }

    // Destruir gráficas existentes
    this.chartPacientes?.destroy();
    this.chartServicios?.destroy();
    this.chartSesiones?.destroy();

    const ctxPacientes = this.chartPacientesRef.nativeElement.getContext('2d');
    const ctxServicios = this.chartServiciosRef.nativeElement.getContext('2d');
    const ctxSesiones = this.chartSesionesRef.nativeElement.getContext('2d');

    if (!ctxPacientes || !ctxServicios || !ctxSesiones) return;

    // Pacientes
    // Pacientes
    this.chartPacientes = new Chart(ctxPacientes, {
      type: 'doughnut',
      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [{
          data: [
            this.dashboardClinica.pacientesActivos,
            this.dashboardClinica.pacientesInactivos
          ],
          backgroundColor: [
            '#009688', '#757575ff'
          ],
          borderColor: [
             '#ffffff', '#ffffff'
          ],
          borderWidth: 1,
          hoverOffset: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: {
                size: 14,
                family: "'Urbanist', sans-serif"
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });


    // Servicios
    this.chartServicios = new Chart(ctxServicios, {
      type: 'doughnut',
      data: {
        labels: ['Disponibles', 'No disponibles'],
        datasets: [{
          data: [
            this.dashboardClinica.serviciosDisponibles,
            this.dashboardClinica.serviciosNoDisponibles
          ],
          backgroundColor: ['#009688', '#757575ff'],
          borderColor: ['#ffffff', '#ffffff', '#ffffff'],
          borderWidth: 1,
          hoverOffset: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: {
                size: 14,
                family: "'Urbanist', sans-serif"
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Sesiones
    this.chartSesiones = new Chart(ctxSesiones, {
      type: 'doughnut',
      data: {
        labels: ['Pendientes', 'Completadas', 'Canceladas'],
        datasets: [{
          data: [
            this.dashboardClinica.sesionesPendientes,
            this.dashboardClinica.sesionesCompletadas,
            this.dashboardClinica.sesionesCanceladas
          ],
          backgroundColor: ['#f99a0cff', '#009688', '#a41a10ff'],
          borderColor: ['#ffffff', '#ffffff', '#ffffff'],
          borderWidth: 1,
          hoverOffset: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: {
                size: 14,
                family: "'Urbanist', sans-serif"
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  prepararGrafica() {
    if (!this.reporteIngresos || !this.chartIngresosRef) return;

    this.chartIngresos?.destroy();

    const dias = this.diffDays(this.fechaInicio, this.fechaFin);

    let modo: 'dia' | 'semana' | 'mes' = 'dia';
    if (dias > 120) modo = 'mes';
    else if (dias > 31) modo = 'semana';

    const agrupado = new Map<string, { efectivo: number; tarjeta: number }>();
    let totalEfectivo = 0;
    let totalTarjeta = 0;

    this.reporteIngresos.pagos.forEach(p => {
      const fecha = new Date(p.fechaPago);

      let key = '';
      if (modo === 'dia') key = p.fechaPago.split('T')[0];
      if (modo === 'semana') key = this.getWeekLabel(fecha);
      if (modo === 'mes') key = this.getMonthLabel(fecha);

      if (!agrupado.has(key)) {
        agrupado.set(key, { efectivo: 0, tarjeta: 0 });
      }

      const registro = agrupado.get(key)!;

      if (p.metodoPago === 'Efectivo') {
        registro.efectivo += p.totalNeto;
        totalEfectivo += p.totalNeto;
      } else {
        registro.tarjeta += p.totalNeto;
        totalTarjeta += p.totalNeto;
      }
    });

    const labels = Array.from(agrupado.keys());
    const dataEfectivo = labels.map(l => agrupado.get(l)!.efectivo);
    const dataTarjeta = labels.map(l => agrupado.get(l)!.tarjeta);

    const ctx = this.chartIngresosRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartIngresos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Efectivo',
            data: dataEfectivo,
            backgroundColor: '#009688',
            borderRadius: 6
          },
          {
            label: 'Tarjeta',
            data: dataTarjeta,
            backgroundColor: '#3f51b5',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: v => '$' + Number(v).toLocaleString()
            }
          }
        }
      }
    });

    this.totalEfectivo = totalEfectivo;
    this.totalTarjeta = totalTarjeta;
  }

  aplicarFiltro() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.alertService.warning('Selecciona un rango de fechas válido');
      return;
    }

    this.cargandoIngresos = true;

    this.reportesService
      .getReporteIngresos(this.fechaInicio, this.fechaFin)
      .subscribe({
        next: res => {
          this.reporteIngresos = res;
          this.cargandoIngresos = false;
          this.tryCreateCharts();
        },
        error: err => {
          this.alertService.error('Error al aplicar el filtro');
          this.cargandoIngresos = false;
        }
      });
  }

  presetUltimos7() {
    this.presetActivo = '7dias';
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - 6);

    this.fechaInicio = inicio.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];

    this.aplicarFiltro();
  }

  presetMesActual() {
    this.presetActivo = 'mes';
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.fechaInicio = inicio.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];

    this.aplicarFiltro();
  }

  presetAnioActual() {
    this.presetActivo = 'anio';
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), 0, 1);

    this.fechaInicio = inicio.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];

    this.aplicarFiltro();
  }

  descargarPdfIngresos() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.alertService.warning('Selecciona un rango de fechas');
      return;
    }

    this.reportesService
      .getReporteIngresosPdf(this.fechaInicio, this.fechaFin)
      .subscribe({
        next: blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-ingresos_${this.fechaInicio}_${this.fechaFin}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.alertService.error('No se pudo descargar el PDF');
        }
      });
  }

  //Hepers
  private diffDays(inicio: string, fin: string): number {
    const start = new Date(inicio);
    const end = new Date(fin);
    return Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  private getWeekLabel(date: Date): string {
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - date.getDay());
    return `Semana ${firstDayOfWeek.toISOString().split('T')[0]}`;
  }

  private getMonthLabel(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}