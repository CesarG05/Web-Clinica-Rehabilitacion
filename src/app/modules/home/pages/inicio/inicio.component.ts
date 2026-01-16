import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { InfoUserResponse } from '../../../auth/models/login-response.model';
import { CommonModule } from '@angular/common'; 

interface Module {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}


@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: InfoUserResponse | null = this.authService.getUser();
  currentDate = new Date();

  allModulesOperativos: Module[] = [
    { title: 'Pacientes', subtitle: 'Gestión de pacientes', icon: 'assets/icons/pacientes-color.png', route: '/pacientes' },
    { title: 'Sesiones', subtitle: 'Administrar sesiones', icon: 'assets/icons/sesiones-color.png', route: '/sesiones' },
    { title: 'Transacciones', subtitle: 'Gestión de pagos', icon: 'assets/icons/transacciones-color.png', route: '/pagos' }
  ];

  allModulesAdministrativos: Module[] = [
    { title: 'Servicios', subtitle: 'Administrar servicios', icon: 'assets/icons/servicios-color.png', route: '/servicios' },
    { title: 'Reportes', subtitle: 'Generar reportes', icon: 'assets/icons/reportes-color.png', route: '/reportes' },
    { title: 'Usuarios', subtitle: 'Gestión de usuarios', icon: 'assets/icons/usuarios-color.png', route: '/usuarios' },
  ];

  // Estas se llenan según el rol
  modulesOperativos: Module[] = [];
  modulesAdministrativos: Module[] = [];

  ngOnInit() {
    const rol = this.user?.rol ?? '';

    // Configuración de permisos por rol
    const permisosPorRol: Record<string, { operativos: string[]; administrativos: string[] }> = {
      'administrador': {
        operativos: ['Pacientes', 'Sesiones', 'Transacciones'],
        administrativos: ['Servicios', 'Reportes', 'Usuarios']
      },
      'recepcionista': {
        operativos: ['Pacientes', 'Sesiones', 'Transacciones'],
        administrativos: ['Servicios']
      },
      'fisioterapeuta': {
        operativos: ['Pacientes','Sesiones'],
        administrativos: ['Servicios']
      }
    };

    const permisos = permisosPorRol[rol] || { operativos: [], administrativos: [] };

    // Filtramos según los permisos
    this.modulesOperativos = this.allModulesOperativos.filter(m => permisos.operativos.includes(m.title));
    this.modulesAdministrativos = this.allModulesAdministrativos.filter(m => permisos.administrativos.includes(m.title));
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get formattedDate(): string {
    if (!this.currentDate) return '';
    const dateStr = this.currentDate.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }
}
