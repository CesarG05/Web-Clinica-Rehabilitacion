import { Component, signal, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { AlertService, Alert } from './alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  private alertService = inject(AlertService);
  alerts = this.alertService.alerts;

  dismiss(alert: Alert) {
    this.alertService.remove(alert);
  }
}
