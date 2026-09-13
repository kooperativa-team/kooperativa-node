# @kooperativa_team/sdk

Official Node.js / TypeScript SDK for the [Kooperativa](https://kooperativa.io) API. Enrich and search professional profiles and companies, track hiring signals and job changes, and manage webhook monitors.

## Installation

```bash
npm install @kooperativa_team/sdk
```

Requires a Kooperativa API key. Get one from your [account dashboard](https://kooperativa.io/api-keys).

## Usage

```ts
import { Kooperativa } from '@kooperativa_team/sdk';

const kooperativa = new Kooperativa({ apiKey: process.env.KOOPERATIVA_API_KEY! });

const { data } = await kooperativa.person.enrich({ username: 'satyanadella' });
console.log(data.full_name, data.current_title);
```

Works the same with CommonJS:

```js
const { Kooperativa } = require('@kooperativa_team/sdk');
```

## Methods

**Account**
- `health()` — API liveness probe, no auth required
- `me()` — license status and usage breakdown

**Person**
- `person.enrich({ linkedin_url | username | id })`
- `person.enrichRealtime({ linkedin_url | username })` — from the live source, **metered**, see below
- `person.check({ linkedin_url | username | id })`
- `person.search({ title, location, industry, seniority, ... })`
- `person.bulkEnrich([{ id | username | linkedin_url }, ...])` — up to 100 per call
- `person.colleagues({ id })`
- `person.similar({ id })`
- `person.jobChanges({ days, company_id })`

**Company**
- `company.enrich({ linkedin_url | username | company_id | id })`
- `company.enrichRealtime({ linkedin_url | username })` — from the live source, **metered**, see below
- `company.check({ linkedin_url | username | company_id | id })`
- `company.search({ country, industry, min_staff, max_staff, ... })`
- `company.currentEmployees({ company_id })`
- `company.pastEmployees({ company_id })`
- `company.headcountBySeniority({ company_id })`
- `company.hiringSignals({ company_id, days })`

**Monitors** (webhooks)
- `monitors.list()`
- `monitors.create({ type, subject_url, webhook_url, label?, events? })`
- `monitors.delete(id)`

Every method returns the parsed JSON response, typed. Errors throw `KooperativaApiError` with `status` and `code` properties.

## Realtime enrichment and billing

Everything above is included in the flat license, with no per-request charge, except the two `enrichRealtime` methods. Those read from the live source rather than from our data lake, and are metered at **$0.001 per call** on top of the license, which is still required.

Three things are worth knowing before you call them in a loop:

- **A miss still costs.** A call is billed whenever the live source actually answered, so a `404` costs the same as a hit, because the lookup happened either way. Only a `503`, meaning we could not reach the source at all, is not billed.
- **A billed call can land in your `catch`.** A `404` throws `KooperativaApiError`, so a call you handle as a failure has still been charged. If you are counting spend, count calls, not successes.
- **There is no cache in front of them.** Calling `enrichRealtime` twice for the same person bills twice. The result is written back to the data lake though, so a following plain `enrich` is free and returns what the realtime call just returned.

Reach for `enrich` first: it is included, and roughly 4x faster. Use `enrichRealtime` when the record is missing from the lake, or when its `fetched_at` is not recent enough for what you are doing.

Full parameter reference: [docs.kooperativa.io](https://docs.kooperativa.io).

## License

MIT
