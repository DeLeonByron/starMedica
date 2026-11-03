import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sm-loader',
  standalone: true,
  imports: [],
  templateUrl: './sm-loader.component.html',
  styleUrl: './sm-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmLoaderComponent {
  readonly label = input('Cargando...');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly inline = input(false);
}
