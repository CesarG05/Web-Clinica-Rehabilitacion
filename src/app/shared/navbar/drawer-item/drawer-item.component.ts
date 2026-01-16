import { Component, Input, Output, EventEmitter  } from '@angular/core';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-drawer-item',
  standalone: true, 
  imports: [RouterModule], 
  templateUrl: './drawer-item.component.html',
  styleUrls: ['./drawer-item.component.scss']
})
export class DrawerItemComponent {
  @Input() routerLink!: string;
  @Input() active: boolean = false;
  @Input() icon!: string;
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() color: string = '#000';

  // evento para notificar al padre
  @Output() itemClick = new EventEmitter<void>();

  onClick() {
    this.itemClick.emit();
  }
}
