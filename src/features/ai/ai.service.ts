
import { apiRequest } from "../../services/api/apiClient";

import type {
  AISuggestion,
  AISuggestionCreateRequest,
  AIApproveRequest,
  AIRejectRequest,
  AIDocumentReadRequest,
  AIDocumentReadResult,
  SuggestionStatus,
  BackendAIKind,
  CaseSummaryPayload,
  AIMessageDraftRequest,
AIMessageDraftResult,
} from "./ai.types";

const AI_BASE = "/api/v1/ai";

export interface AIListFilters {
  page?: number;
  pageSize?: number;
  kind?: BackendAIKind;
  status?: SuggestionStatus;
  caseId?: string;
}

export const aiService = {
  // List AI suggestions for the signed-in staff member.
  async listSuggestions(
    filters: AIListFilters = {}
  ): Promise<AISuggestion[]> {
    const params = new URLSearchParams();

    if (filters.page !== undefined) {
      params.set("page", String(filters.page));
    }
    if (filters.pageSize !== undefined) {
      params.set("pageSize", String(filters.pageSize));
    }
    if (filters.kind) params.set("kind", filters.kind);
    if (filters.status) params.set("status", filters.status);
    if (filters.caseId) params.set("caseId", filters.caseId);

    const query = params.toString();

    return apiRequest<AISuggestion[]>(
      `${AI_BASE}/suggestions${query ? `?${query}` : ""}`
    );
  },

  // Create a suggestion. The backend only permits the AI service account.
  async createSuggestion(
    request: AISuggestionCreateRequest
  ): Promise<AISuggestion> {
    return apiRequest<AISuggestion>(`${AI_BASE}/suggestions`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Retrieve one suggestion.
  async getSuggestion(id: string): Promise<AISuggestion> {
    return apiRequest<AISuggestion>(
      `${AI_BASE}/suggestions/${encodeURIComponent(id)}`
    );
  },

  // Approve a suggestion, optionally editing a message draft.
  async approveSuggestion(
    id: string,
    request: AIApproveRequest = {}
  ): Promise<AISuggestion> {
    return apiRequest<AISuggestion>(
      `${AI_BASE}/suggestions/${encodeURIComponent(id)}/approve`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  // Rejecting requires a reason.
  async rejectSuggestion(
    id: string,
    request: AIRejectRequest
  ): Promise<AISuggestion> {
    return apiRequest<AISuggestion>(
      `${AI_BASE}/suggestions/${encodeURIComponent(id)}/reject`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

  // Retrieve an approved case summary.
  async getCaseSummary(
    caseId: string
  ): Promise<CaseSummaryPayload> {
    return apiRequest<CaseSummaryPayload>(
      `${AI_BASE}/suggestions/cases/${encodeURIComponent(caseId)}/summary`
    );
  },

  // Document reading: frontend method is ready.
  // The matching backend endpoint still needs to be implemented.
  async readDocument(
    request: AIDocumentReadRequest
  ): Promise<AIDocumentReadResult> {
    return apiRequest<AIDocumentReadResult>(
      `${AI_BASE}/suggestions/document-read`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },

    // Generate a simulated message draft for coordinator approval.
    async createMessageDraft(
    request: AIMessageDraftRequest
  ): Promise<AIMessageDraftResult> {
    return apiRequest<AIMessageDraftResult>(
      `${AI_BASE}/suggestions/message-draft`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  },
};
