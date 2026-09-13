import { HttpClient } from './http.js';
import type {
  AccountInfo,
  BulkEnrichProfileRef,
  BulkEnrichResponse,
  CompaniesSearchParams,
  CompaniesSearchResponse,
  CompanyCheckResult,
  CompanyCurrentEmployeesResponse,
  CompanyEmployeesParams,
  CompanyEnrichParams,
  CompanyHiringSignalsParams,
  CompanyHiringSignalsResponse,
  CompanyPastEmployeesResponse,
  CompanyRealtimeParams,
  CompanyResult,
  CreateMonitorParams,
  HeadcountBySeniorityResponse,
  KooperativaClientOptions,
  Monitor,
  PeopleSearchParams,
  PeopleSearchResponse,
  PersonCheckResult,
  PersonColleaguesParams,
  PersonColleaguesResponse,
  PersonEnrichParams,
  PersonJobChangesParams,
  PersonJobChangesResponse,
  PersonRealtimeParams,
  PersonResult,
  PersonSimilarParams,
  PersonSimilarResponse,
} from './types.js';

export * from './types.js';
export { KooperativaApiError } from './http.js';

const DEFAULT_BASE_URL = 'https://kooperativa.io/api/v1';

/**
 * Official Kooperativa API client.
 *
 * @example
 * ```ts
 * const kooperativa = new Kooperativa({ apiKey: process.env.KOOPERATIVA_API_KEY! });
 * const { data } = await kooperativa.person.enrich({ username: 'satyanadella' });
 * ```
 */
export class Kooperativa {
  private readonly http: HttpClient;

  constructor(options: KooperativaClientOptions) {
    if (!options.apiKey) {
      throw new Error('Kooperativa: apiKey is required');
    }
    this.http = new HttpClient({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
      fetchImpl: options.fetch ?? fetch,
    });
  }

  /** No-auth liveness probe. Use to verify connectivity before a batch job. */
  health(): Promise<{ ok: boolean }> {
    return this.http.get('/health');
  }

  /** Account info: license status and usage breakdown. */
  me(): Promise<AccountInfo> {
    return this.http.get('/me');
  }

  person = {
    /** Full profile lookup by URL, username, or ID (exactly one required). */
    enrich: (params: PersonEnrichParams): Promise<{ data: PersonResult }> =>
      this.http.get('/person', params as Record<string, unknown>),

    /**
     * Same shape as `enrich`, but read from the live source instead of our data
     * lake, and written back to it, so a following `enrich` returns this result.
     * Accepts a URL or username only, never an id.
     *
     * Metered: $0.001 per call on top of the flat license, the only endpoint
     * pair that is. A call is billed whenever the live source answered, so a
     * 404 costs the same as a hit, and note that a 404 throws
     * `KooperativaApiError` here, meaning a call that lands in your catch
     * branch has still been billed. A 503 is never billed.
     */
    enrichRealtime: (params: PersonRealtimeParams): Promise<{ data: PersonResult }> =>
      this.http.get('/person/realtime', params as Record<string, unknown>),

    /** Cheap existence check before a full lookup. Throws KooperativaApiError (404) if not held. */
    check: (params: PersonEnrichParams): Promise<PersonCheckResult> =>
      this.http.get('/person/check', params as Record<string, unknown>),

    /** Filtered search across the people data lake. */
    search: (params: PeopleSearchParams = {}): Promise<PeopleSearchResponse> =>
      this.http.post('/people/search', params),

    /** Enrich up to 100 profiles in a single call. */
    bulkEnrich: (profiles: BulkEnrichProfileRef[]): Promise<BulkEnrichResponse> =>
      this.http.post('/people/bulk-enrich', { profiles }),

    /** Current coworkers of a person (everyone at their current company right now). */
    colleagues: (params: PersonColleaguesParams): Promise<PersonColleaguesResponse> =>
      this.http.get('/person/colleagues', params as unknown as Record<string, unknown>),

    /** Lookalike profiles: same seniority, industry, and country. */
    similar: (params: PersonSimilarParams): Promise<PersonSimilarResponse> =>
      this.http.get('/person/similar', params as unknown as Record<string, unknown>),

    /** People who recently started a new job. */
    jobChanges: (params: PersonJobChangesParams = {}): Promise<PersonJobChangesResponse> =>
      this.http.get('/person/job-changes', params as Record<string, unknown>),
  };

  company = {
    /** Full company profile lookup by URL, username, company ID, or ID. */
    enrich: (params: CompanyEnrichParams): Promise<{ data: CompanyResult }> =>
      this.http.get('/company', params as Record<string, unknown>),

    /**
     * Same shape as `enrich`, but read from the live source instead of our data
     * lake, and written back to it, so a following `enrich` returns this result.
     * Accepts a URL or username only, never a company ID or id.
     *
     * Metered: $0.001 per call on top of the flat license, the only endpoint
     * pair that is. A call is billed whenever the live source answered, so a
     * 404 costs the same as a hit, and note that a 404 throws
     * `KooperativaApiError` here, meaning a call that lands in your catch
     * branch has still been billed. A 503 is never billed.
     */
    enrichRealtime: (params: CompanyRealtimeParams): Promise<{ data: CompanyResult }> =>
      this.http.get('/company/realtime', params as Record<string, unknown>),

    /** Cheap existence check before a full lookup. Throws KooperativaApiError (404) if not held. */
    check: (params: CompanyEnrichParams): Promise<CompanyCheckResult> =>
      this.http.get('/company/check', params as Record<string, unknown>),

    /** Filtered search across the company data lake. At least one filter is required. */
    search: (params: CompaniesSearchParams): Promise<CompaniesSearchResponse> =>
      this.http.post('/companies/search', params),

    /** People currently working at a company. */
    currentEmployees: (params: CompanyEmployeesParams): Promise<CompanyCurrentEmployeesResponse> =>
      this.http.get('/company/current-employees', params as unknown as Record<string, unknown>),

    /** People who previously worked at a company, with their past role there. */
    pastEmployees: (params: CompanyEmployeesParams): Promise<CompanyPastEmployeesResponse> =>
      this.http.get('/company/past-employees', params as unknown as Record<string, unknown>),

    /** Breakdown of a company's indexed profiles by seniority level. */
    headcountBySeniority: (params: { company_id: string }): Promise<HeadcountBySeniorityResponse> =>
      this.http.get('/company/headcount-by-seniority', params),

    /** People who recently joined this company, a growth/expansion signal. */
    hiringSignals: (params: CompanyHiringSignalsParams): Promise<CompanyHiringSignalsResponse> =>
      this.http.get('/company/hiring-signals', params as unknown as Record<string, unknown>),
  };

  monitors = {
    /** List all active webhook monitors for the workspace. */
    list: (): Promise<{ monitors: Monitor[] }> => this.http.get('/monitors'),

    /** Subscribe to change events on a profile or company URL. */
    create: (params: CreateMonitorParams): Promise<{ monitor: Monitor }> =>
      this.http.post('/monitors', params),

    /** Stop monitoring and delete the monitor. */
    delete: (id: string): Promise<{ ok: boolean }> => this.http.del('/monitors', { id }),
  };
}

export default Kooperativa;
