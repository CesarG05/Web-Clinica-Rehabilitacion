import { Injectable, signal } from '@angular/core';

export interface Alert {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timeout?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private _alerts = signal<Alert[]>([]);
  alerts = this._alerts.asReadonly();

  show(message: string, type: Alert['type'] = 'info', duration = 3000) {
    const alert: Alert = { message, type };
    this._alerts.update(list => [...list, alert]);

    alert.timeout = setTimeout(() => this.remove(alert), duration);
  }

  remove(alert: Alert) {
    clearTimeout(alert.timeout);
    this._alerts.update(list => list.filter(a => a !== alert));
  }

  success(message: string, duration = 3000) { this.show(message, 'success', duration); }
  error(message: string, duration = 3000) { this.show(message, 'error', duration); }
  info(message: string, duration = 3000) { this.show(message, 'info', duration); }
  warning(message: string, duration = 3000) { this.show(message, 'warning', duration); }
}

