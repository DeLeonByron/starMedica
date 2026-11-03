import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmEmptyStateComponent } from './sm-empty-state.component';

@Component({
  standalone: true,
  imports: [SmEmptyStateComponent],
  template: `
    <sm-empty-state
      title="Sin resultados"
      message="Ajusta los criterios o registra un elemento."
      [actionLabel]="actionLabel()"
      (actionRequested)="onActionRequested()"
    />
  `
})
class SmEmptyStateHostComponent {
  readonly actionLabel = signal('Crear registro');
  readonly actionCount = signal(0);

  onActionRequested(): void {
    this.actionCount.update((count) => count + 1);
  }
}

describe('SmEmptyStateComponent', () => {
  let fixture: ComponentFixture<SmEmptyStateHostComponent>;
  let host: SmEmptyStateHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmEmptyStateHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmEmptyStateHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('announces the empty state and renders its title, message and action', () => {
    const state: HTMLElement = fixture.nativeElement.querySelector('section');
    const action: HTMLButtonElement = state.querySelector('button')!;

    expect(state.getAttribute('role')).toBe('status');
    expect(state.getAttribute('aria-live')).toBe('polite');
    expect(state.querySelector('h2')?.textContent?.trim()).toBe('Sin resultados');
    expect(state.textContent).toContain('Ajusta los criterios o registra un elemento.');
    expect(action.textContent?.trim()).toBe('Crear registro');

    action.click();
    expect(host.actionCount()).toBe(1);
  });

  it('omits the action when no action label is provided', () => {
    host.actionLabel.set('');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
