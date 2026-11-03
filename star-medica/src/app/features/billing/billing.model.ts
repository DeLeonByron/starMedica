export interface BillingDraftLine {
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BillingDraft {
  id: number;
  customerName: string;
  customerNit: string | null;
  customerAddress: string | null;
  notes: string | null;
  total: number;
  createdAt: string;
  lines: BillingDraftLine[];
}

export interface BillingDraftPage {
  items: BillingDraft[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateBillingDraftLineRequest {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateBillingDraftRequest {
  customerName: string;
  customerNit: string | null;
  customerAddress: string | null;
  notes: string | null;
  lines: CreateBillingDraftLineRequest[];
}

export interface BillingDraftForm {
  customerName: string;
  customerNit: string;
  customerAddress: string;
  notes: string;
  lines: CreateBillingDraftLineRequest[];
}
