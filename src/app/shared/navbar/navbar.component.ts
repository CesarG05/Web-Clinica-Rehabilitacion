import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';
import { InfoUserResponse } from '../../modules/auth/models/login-response.model';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { DrawerItemComponent } from './drawer-item/drawer-item.component';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, DrawerItemComponent, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  user: InfoUserResponse | null = this.authService.getUser();

  showModal = signal(false);
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() {
    this.showModal.set(true);
  }

  confirmLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showModal.set(false);
    this.closeMenu();
  }

  cancelLogout() {
    this.showModal.set(false);
  }

  isActive(route: string) {
    return this.router.url === route;
  }
}
