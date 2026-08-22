# DevPick Growth Strategy

Last updated: 2026-08-22

## Decision

DevPick is not currently a viable display-ad business. Keep the site live because hosting is inexpensive, but defer ads and stop expanding the catalog for keyword coverage alone.

The next 90 days are a focused acquisition experiment. The goal is to prove that a small number of differentiated tools can earn organic discovery and repeat usage. MCP/WebMCP is a distribution and product-differentiation track, not a direct-revenue assumption.

## Verified baseline

Search Console data through 2026-08-21:

| Window | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| 2026-07-25 to 2026-08-21 | 0 | 54 | 0% | 52.5 |
| 2026-06-27 to 2026-07-24 | 0 | 36 | 0% | 21.6 |
| 2026-02-23 to 2026-08-21 | 1 | 1,090 | 0.09% | 61.8 |

GA4 data for 2026-07-25 to 2026-08-21:

- 45 users, 45 sessions, and 45 pageviews
- 29 engaged sessions; 64.4% engagement rate
- 25.6 seconds average session duration
- All sessions classified as Direct; zero Organic Search sessions

The 119 URLs in the sitemap are not an indexed-page estimate. Index coverage must come from Search Console's indexing report or URL Inspection, not sitemap count.

## Diagnosis

- The technical foundation is adequate: static output, sitemap, canonicals, structured data, and legacy redirects exist.
- The acquisition problem is not another missing meta tag. DevPick has little authority, few distribution signals, and no proven search winner.
- The 118-tool catalog is broad and mostly competes in mature commodity categories.
- Prior page priorities were chosen without Search Console and are superseded by the baseline above.
- Display ads would currently earn effectively nothing and would weaken the fast, private-tool experience.

## The 2026 search model

Google's current guidance does not treat AI Overviews or AI Mode as a separate optimization channel. These experiences retrieve from Google's index and use query fan-out to explore related subtopics, so the durable strategy remains strong technical access plus original, useful pages.

Apply these rules:

- **Be retrievable first.** A page must be indexed and eligible for a normal Search snippet before it can support Google's generative AI features. Keep canonical URLs crawlable, return successful responses, and inspect flagship URLs after meaningful releases.
- **Publish non-commodity evidence.** Each flagship should expose tested behavior, real examples, limitations, and first-party workflow knowledge that a generic summary cannot replace.
- **Cover the real task, not keyword variations.** Organize visible sections around adjacent user questions and follow-up tasks. Query fan-out rewards useful topical coverage; it does not justify mass-producing near-duplicate pages.
- **Use semantic, directly visible sections.** Descriptive headings and stable fragment IDs help people, agents, and Search understand and deep-link to specific answers. Do not hide core guidance behind tabs or collapsed widgets.
- **Treat structured data as a description, not a ranking lever.** Keep supported markup accurate and consistent with visible content. Do not add schema solely to create an appearance of depth.
- **Measure AI discovery when available.** Add Google's Generative AI Search Console report to the weekly review when it appears for the property, while keeping Search Console as the search source of truth and GA4 as the on-site behavior source of truth.
- **Ignore invented AEO/GEO rituals.** Do not spend time on `llms.txt`, arbitrary content chunking, inauthentic mentions, or scaled AI pages. MCP and accessible browser-agent behavior are product/distribution advantages, not ranking guarantees.
- **Stop investing in FAQ rich-result markup.** Google retired the FAQ rich-result feature in May 2026. Useful questions can remain as visible page content, but schema maintenance is no longer a growth priority.

Primary references:

- [Google's guide to generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Search Console and Analytics for SEO](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console)
- [Snippet and “Read more” deep-link guidance](https://developers.google.com/search/docs/appearance/snippet)

## 90-day experiment

### Flagship tools

Concentrate product and distribution work on three candidates:

1. `/hex-calculator/` — best balance of existing impressions and ranking proximity (27 impressions, average position 26.6 over the long window).
2. `/webp-to-png/` — meaningful discovery surface (144 impressions); differentiate with batch conversion, privacy proof, and a stronger workflow.
3. `/gitignore-generator/` — meaningful developer-aligned surface (135 impressions); differentiate with composable templates, explanations, and share/export workflows.

Keep `/words/` as a challenger because its average position was 11.5, but the sample was only 12 impressions. Review the candidate set weekly rather than protecting it from new evidence.

### Product standard

Each flagship must be materially better than generic competitors, not merely longer:

- advanced or batch workflows
- useful presets and realistic examples
- clear error handling and troubleshooting
- export/share/copy flows where safe
- verifiable client-side privacy behavior
- related-tool journeys that solve a complete task

### Distribution

- Create one strong MCP landing/docs experience with copy-paste setup for Codex, Claude Code, and Cursor.
- Publish workflow demonstrations, benchmarks, and technical explanations instead of generic launch posts.
- Seek integrations and backlinks from projects that genuinely use a DevPick tool or MCP capability.
- Track npm installs, GitHub stars, referring domains, returning visitors, and MCP/tool usage separately from web search.

### Monetization ladder

Financial freedom cannot rest on display ads alone. Build revenue in stages, and do not advance a stage without evidence:

1. **Discovery:** earn repeatable non-branded impressions and clicks on flagship tools.
2. **Retention:** prove successful tool completions, returning usage, direct/bookmarked traffic, and MCP adoption.
3. **Intent:** learn which workflows have commercial value through downloads, repeat use, and user requests.
4. **Revenue:** test one aligned offer at a time—such as a paid batch/workspace tier, hosted API or MCP capabilities, a relevant developer-product sponsorship, or carefully disclosed affiliate placement.
5. **Scale:** add display ads only when traffic is large enough that revenue outweighs the cost to speed, trust, and conversion.

The goal is a portfolio of durable, high-intent pages with more than one revenue mechanism—not an ad-supported pageview treadmill.

### Top three actions shipped on 2026-08-22

1. Added a prominent homepage flagship section to concentrate internal links and user attention on the three active experiments.
2. Added visible, deep-linkable field guides with examples, tested behavior, and honest limitations to Hex Calculator, WebP to PNG, and .gitignore Generator; also corrected the default treatment of `go.sum` and `Cargo.lock`.
3. Added privacy-safe analytics for successful calculations/conversions, downloads, presets, and flagship opens without collecting tool inputs, filenames, or generated output.

## Weekly scoreboard

Track only decision-grade metrics:

- Search Console clicks, impressions, CTR, and average position
- top queries and landing pages
- GA4 organic users, sessions, engaged sessions, and pageviews
- flagship-tool usage events
- relevant backlinks/integrations shipped
- MCP installs, stars, and invocation telemetry when available

Do not use Cloudflare request volume as a human-traffic metric.

## Continuation thresholds

At the end of 90 days, continue the SEO experiment only if:

- at least one non-branded page consistently ranks in the top 20;
- monthly Search Console impressions exceed 2,000;
- monthly organic clicks exceed 50; and
- organic acquisition is growing across consecutive monthly windows.

These are validation thresholds, not monetization thresholds. Reconsider ads only after traffic reaches at least 10,000 monthly pageviews and the placement can preserve the tool experience. Meaningful display-ad revenue generally requires traffic in the tens of thousands of monthly pageviews.

## Explicitly stopped

- adding tools solely from keyword-volume lists
- broad daily metadata/FAQ churn across the catalog
- treating sitemap count as indexed pages
- treating Direct or Cloudflare traffic as SEO success
- buying Google Ads traffic to fund display-ad revenue
- using the February-April winner-page shortlist as current guidance
