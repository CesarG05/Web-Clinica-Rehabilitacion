import { Component, Input, inject } from '@angular/core';
import { Location, NgClass } from '@angular/common';

@Component({
  selector: 'app-back-header',
  standalone: true,
  templateUrl: './back-header.component.html',
  styleUrls: ['./back-header.component.scss'],
  imports: [NgClass]
})
export class BackHeaderComponent {

  private location = inject(Location);

  @Input() titulo = '';
  @Input() variant: 'default' | 'spaced' = 'default';

  volverAtras() {
    this.location.back();
  }

//   private router = inject(Router);

//     volverAtras() {
//     if (window.history.length > 1) {
//         this.location.back();
//     } else {
//         this.router.navigate(['/pacientes']);
//     }
//     }
}