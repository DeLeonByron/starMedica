import { AfterViewInit, Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly googleButton = viewChild<ElementRef<HTMLDivElement>>('googleButton');
  protected readonly auth = inject(AuthService);

  ngAfterViewInit(): void {
    const element = this.googleButton()?.nativeElement;
    if (element) {
      const cleanup = this.auth.renderGoogleButton(element);
      this.destroyRef.onDestroy(cleanup);
    }
  }
}