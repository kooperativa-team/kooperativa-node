/**
 * Shared request/response types for the Kooperativa API client.
 *
 * These mirror the OpenAPI spec's schema names (PersonResult, CompanyResult,
 * etc.) but only type the fields the SDK itself needs to construct requests
 * and expose typed responses. Response bodies are passed through as-is from
 * the API, so a field added server-side shows up on the returned object even
 * if not declared here (typed as `unknown` extras via index signature).
 */

export interface KooperativaClientOptions {
  /** API key from https://kooperativa.io/api-keys. Starts with kk_live_. */
  apiKey: string;
  /** Override the base URL, e.g. for testing against a different environment. */
  baseUrl?: string;
  /** Custom fetch implementation. Defaults to the global fetch. */
  fetch?: typeof fetch;
}

export interface Quotas {
  rate_limit?: {
    workspace?: { limit: number; remaining: number; reset_at: string };
  };
}

export interface Metadata {
  request_id: string;
  execution_ms: number;
}

export interface ApiEnvelope {
  quotas?: Quotas;
  metadata?: Metadata;
}

export interface PersonResult extends Record<string, unknown> {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  current_title?: string;
  current_company?: string;
  current_company_id?: string;
  headline?: string;
  geo_city?: string;
  geo_country?: string;
  geo_country_code?: string;
  linkedin_url?: string;
  seniority?: 'c-level' | 'vp' | 'director' | 'manager';
  fetched_at?: string;
}

export interface CompanyResult extends Record<string, unknown> {
  id: string;
  company_id?: string;
  name?: string;
  tagline?: string;
  website?: string;
  linkedin_url?: string;
  staff_count?: number;
  hq_city?: string;
  hq_country_code?: string;
  industries?: string[];
  fetched_at?: string;
}

export interface Pagination {
  total?: number;
  page?: number;
  per_page?: number;
  pages?: number;
  has_more?: boolean;
  next_page?: number | null;
}

export interface PersonEnrichParams {
  linkedin_url?: string;
  username?: string;
  id?: string;
}

export interface PersonCheckResult extends ApiEnvelope {
  exists: true;
  id: string;
  linkedin_url: string;
  full_name: string;
  fetched_at: string;
}

export interface CompanyEnrichParams {
  linkedin_url?: string;
  username?: string;
  company_id?: string;
  id?: string;
}

export interface CompanyCheckResult extends ApiEnvelope {
  exists: true;
  id: string;
  linkedin_url: string;
  name: string;
  fetched_at: string;
}

export interface PeopleSearchParams {
  query?: string;
  title?: string;
  company?: string;
  company_id?: string;
  location?: string | string[];
  city?: string;
  industry?: string | string[];
  seniority?: 'c-level' | 'vp' | 'director' | 'manager';
  headcount?: string;
  is_premium?: boolean;
  is_top_voice?: boolean;
  is_creator?: boolean;
  skills?: string[];
  tenure_min_months?: number;
  job_changed_after?: number;
  exclude_companies?: string[];
  exclude_industries?: string[];
  past_company?: string;
  education?: string;
  linkedin_url?: string;
  page?: number;
  per_page?: number;
}

export interface PeopleSearchResponse extends Pagination {
  results: PersonResult[];
}

export interface CompaniesSearchParams {
  query?: string;
  country?: string;
  city?: string;
  industry?: string;
  min_staff?: number;
  max_staff?: number;
  page?: number;
  per_page?: number;
}

export interface CompaniesSearchResponse extends Pagination {
  results: CompanyResult[];
}

export interface BulkEnrichProfileRef {
  id?: string;
  username?: string;
  linkedin_url?: string;
}

export interface BulkEnrichResponse {
  profiles: PersonResult[];
  matched: number;
  requested: number;
  not_found: number;
  failed?: number;
}

export interface CompanyEmployeesParams {
  company_id: string;
  page?: number;
  per_page?: number;
}

export interface CompanyCurrentEmployeesResponse extends Pagination {
  company_id: string;
  employees: PersonResult[];
}

export interface PastPosition {
  title: string;
  start_year: number | null;
  start_month: number | null;
  end_year: number | null;
  end_month: number | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
}

export interface CompanyPastEmployeesResponse extends Pagination {
  company_id: string;
  results: Array<PersonResult & { past_positions: PastPosition[] }>;
}

export interface PersonColleaguesParams {
  id: string;
  page?: number;
  per_page?: number;
}

export interface PersonColleaguesResponse extends Pagination {
  id: string;
  company_id: string;
  company_name: string;
  colleagues: PersonResult[];
}

export interface PersonSimilarParams {
  id: string;
  page?: number;
  per_page?: number;
}

export interface PersonSimilarResponse extends Pagination {
  id: string;
  matched_on?: { seniority?: string; industry?: string; country?: string };
  results: PersonResult[];
}

export interface PersonJobChangesParams {
  days?: number;
  company_id?: string;
  page?: number;
  per_page?: number;
}

export interface PersonJobChangesResponse extends Pagination {
  results: PersonResult[];
  window_days?: number;
  since_timestamp?: number;
}

export interface HeadcountBySeniorityResponse {
  company_id: string;
  total_indexed: number;
  breakdown: {
    'c-level': number;
    vp: number;
    director: number;
    manager: number;
    individual: number;
  };
}

export interface CompanyHiringSignalsParams {
  company_id: string;
  days?: number;
  page?: number;
  per_page?: number;
}

export interface CompanyHiringSignalsResponse extends Pagination {
  company_id: string;
  window_days?: number;
  since_timestamp?: number;
  results: PersonResult[];
}

export interface AccountInfo {
  email: string;
  usage: {
    this_month: number;
    today: number;
    by_endpoint: Record<string, number>;
  };
  license: {
    active: boolean;
    plan: 'monthly' | 'annual' | null;
    started_at: string | null;
    expires_at: string | null;
  };
}

export type MonitorType = 'person' | 'company';

export interface Monitor {
  id: string;
  type: MonitorType;
  subject_url: string;
  label: string | null;
  webhook_url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export interface CreateMonitorParams {
  type: MonitorType;
  subject_url: string;
  webhook_url: string;
  label?: string;
  events?: string[];
}
