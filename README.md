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
- `person.check({ linkedin_url | username | id })`
- `person.search({ title, location, industry, seniority, ... })`
- `person.bulkEnrich([{ id | username | linkedin_url }, ...])` — up to 100 per call
- `person.colleagues({ id })`
- `person.similar({ id })`
- `person.jobChanges({ days, company_id })`

**Company**
- `company.enrich({ linkedin_url | username | company_id | id })`
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

Full parameter reference: [docs.kooperativa.io](https://docs.kooperativa.io).

## License

MIT
