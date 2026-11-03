import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild
} from '@angular/core';

@Component({
  selector: 'sm-modal',
  standalone: true,
  imports: [],
  templateUrl: './sm-modal.component.html',
  styleUrl: './sm-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmModalComponent {
  readonly open = input.required<boolean>();
  readonly labelledBy = input.required<string>();
  readonly describedBy = input('');
  readonly size = input<'small' | 'medium' | 'large'>('medium');
  readonly closeOnBackdrop = input(true);
  readonly dismissed = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (!dialog) {
        return;
      }

      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();
    this.dismissed.emit();
  }

  protected handleClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.closeOnBackdrop()) {
      this.dismissed.emit();
    }
  }
}
