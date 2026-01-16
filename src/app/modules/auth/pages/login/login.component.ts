import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../../shared/alert/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  usuario = '';
  password = '';
  showPassword = false;
  loading = signal(false);

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  onLogin() {
    this.loading.set(true);

    this.authService.login({ usuario: this.usuario, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/inicio']);
          this.alertService.success('Inicio de sesión exitoso');
        },
        error: (err) => {
          this.loading.set(false);
          this.alertService.error(err?.message || 'Credenciales incorrectas. Intenta nuevamente.');
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
