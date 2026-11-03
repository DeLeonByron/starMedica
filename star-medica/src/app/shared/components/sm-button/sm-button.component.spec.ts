import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmButtonComponent } from './sm-button.component';

describe('SmButtonComponent', () => {
  let fixture: ComponentFixture<SmButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SmButtonComponent);
    fixture.detectChanges();
  });

  it('defaults to an enabled primary button with a safe button type', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button.type).toBe('button');
    expect(button.classList).toContain('sm-button--primary');
    expect(button.disabled).toBeFalse();
  });

  it('supports alternate variants, sizes and submit buttons', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.componentRef.setInput('size', 'small');
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    expect(button.type).toBe('submit');
    expect(button.classList).toContain('sm-button--secondary');
    expect(button.classList).toContain('sm-button--small');
  });

  it('disables the button and announces its loading state', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const spinner: HTMLSpanElement | null = button.querySelector('.sm-button__spinner');

    expect(button.disabled).toBeTrue();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(spinner?.getAttribute('aria-hidden')).toBe('true');
  });
});
