import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  BillingDraft,
  BillingDraftForm,
  CreateBillingDraftRequest
} from '../billing.model';
import { BillingService } from '../billing.service';

@Component({
  selector: 'sm-billing-drafts',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule],
  templateUrl: './billing-drafts.component.html',
  styleUrl: './billing-drafts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingDraftsComponent implements OnInit {
  private readonly service = inject(BillingService);
  private readonly destroyRef = inject(DestroyRef);
  private loadSequence = 0;

  readonly drafts = signal<BillingDraft[]>([]);
  readonly searchTerm = signal('');
  readonly appliedSearch = signal('');
  readonly pageNumber = signal(1);
  readonly pageSize = 20;
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  readonly form = signal<BillingDraftForm>(this.emptyForm());
  readonly editingDraftId = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly total = computed(() =>
    this.form().lines.reduce((sum, line) => sum + this.lineAmount(line.quantity, line.unitPrice), 0)
  );
  readonly canSubmit = computed(() => {
    const form = this.form();
    return !this.isSaving() &&
      form.customerName.trim().length > 0 &&
      form.lines.length > 0 &&
      form.lines.length <= 100 &&
      form.lines.every((line) =>
        line.description.trim().length > 0 &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0 &&
        line.quantity <= 100_000 &&
        Math.round(line.quantity * 1000) === line.quantity * 1000 &&
        Number.isFinite(line.unitPrice) &&
        line.unitPrice >= 0 &&
        line.unitPrice <= 100_000 &&
        Math.round(line.unitPrice * 100) === line.unitPrice * 100
      );
  });

  ngOnInit(): void {
    this.loadDrafts();
  }

  updateCustomerName(value: string): void {
    this.form.update((current) => ({ ...current, customerName: value }));
  }

  updateCustomerNit(value: string): void {
    this.form.update((current) => ({ ...current, customerNit: value }));
  }

  updateCustomerAddress(value: string): void {
    this.form.update((current) => ({ ...current, customerAddress: value }));
  }

  updateNotes(value: string): void {
    this.form.update((current) => ({ ...current, notes: value }));
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  searchDrafts(): void {
    this.appliedSearch.set(this.searchTerm().trim());
    this.pageNumber.set(1);
    this.loadDrafts();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.appliedSearch.set('');
    this.pageNumber.set(1);
    this.loadDrafts();
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages() || pageNumber === this.pageNumber()) {
      return;
    }

    this.pageNumber.set(pageNumber);
    this.loadDrafts();
  }

  updateDescription(index: number, value: string): void {
    this.updateLine(index, (line) => ({ ...line, description: value }));
  }

  updateQuantity(index: number, value: number | null): void {
    this.updateLine(index, (line) => ({ ...line, quantity: value ?? Number.NaN }));
  }

  updateUnitPrice(index: number, value: number | null): void {
    this.updateLine(index, (line) => ({ ...line, unitPrice: value ?? Number.NaN }));
  }

  addLine(): void {
    if (this.form().lines.length >= 100) {
      return;
    }

    this.form.update((current) => ({
      ...current,
      lines: [...current.lines, this.emptyLine()]
    }));
  }

  removeLine(index: number): void {
    if (this.form().lines.length <= 1) {
      return;
    }

    this.form.update((current) => ({
      ...current,
      lines: current.lines.filter((_, lineIndex) => lineIndex !== index)
    }));
  }

  startEditing(draft: BillingDraft): void {
    this.editingDraftId.set(draft.id);
    this.formError.set(null);
    this.notice.set(null);
    this.form.set({
      customerName: draft.customerName,
      customerNit: draft.customerNit ?? '',
      customerAddress: draft.customerAddress ?? '',
      notes: draft.notes ?? '',
      lines: draft.lines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice
      }))
    });
  }

  cancelEditing(): void {
    if (this.isSaving()) {
      return;
    }

    this.editingDraftId.set(null);
    this.formError.set(null);
    this.form.set(this.emptyForm());
  }

  saveDraft(): void {
    if (!this.canSubmit()) {
      this.formError.set('Completa el cliente y todos los conceptos con valores válidos.');
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);
    this.notice.set(null);
    const current = this.form();
    const request: CreateBillingDraftRequest = {
      customerName: current.customerName.trim(),
      customerNit: current.customerNit.trim() || null,
      customerAddress: current.customerAddress.trim() || null,
      notes: current.notes.trim() || null,
      lines: current.lines.map((line) => ({
        ...line,
        description: line.description.trim()
      }))
    };

    const editingDraftId = this.editingDraftId();
    const saveRequest = editingDraftId === null
      ? this.service.createDraft(request)
      : this.service.updateDraft(editingDraftId, request);
    saveRequest
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (draft) => {
          this.pageNumber.set(1);
          this.form.set(this.emptyForm());
          this.editingDraftId.set(null);
          this.isSaving.set(false);
          this.notice.set(editingDraftId === null
            ? `Borrador interno #${draft.id} guardado.`
            : `Borrador interno #${draft.id} actualizado.`);
          this.loadDrafts();
        },
        error: (error: unknown) => {
          this.formError.set(this.errorMessage(error, 'No se pudo guardar el borrador.'));
          this.isSaving.set(false);
        }
      });
  }

  private loadDrafts(): void {
    const sequence = ++this.loadSequence;
    this.isLoading.set(true);
    this.error.set(null);
    this.service.getDrafts(this.appliedSearch(), this.pageNumber(), this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          if (sequence !== this.loadSequence) {
            return;
          }

          this.drafts.set(page.items);
          this.totalCount.set(page.totalCount);
          this.totalPages.set(page.totalPages);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          if (sequence !== this.loadSequence) {
            return;
          }

          this.drafts.set([]);
          this.totalCount.set(0);
          this.totalPages.set(0);
          this.error.set(this.errorMessage(error, 'No se pudieron cargar los borradores.'));
          this.isLoading.set(false);
        }
      });
  }

  private updateLine(
    index: number,
    update: (line: BillingDraftForm['lines'][number]) => BillingDraftForm['lines'][number]
  ): void {
    this.form.update((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) =>
        lineIndex === index ? update(line) : line)
    }));
  }

  lineAmount(quantity: number, unitPrice: number): number {
    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
      return 0;
    }

    const quantityThousandths = Math.round(quantity * 1000);
    const unitPriceHundredths = Math.round(unitPrice * 100);
    const totalCents = Math.floor((quantityThousandths * unitPriceHundredths) / 1000 + 0.5);
    return totalCents / 100;
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }

  private emptyForm(): BillingDraftForm {
    return {
      customerName: '',
      customerNit: '',
      customerAddress: '',
      notes: '',
      lines: [this.emptyLine()]
    };
  }

  private emptyLine(): BillingDraftForm['lines'][number] {
    return { description: '', quantity: 1, unitPrice: 0 };
  }
}
