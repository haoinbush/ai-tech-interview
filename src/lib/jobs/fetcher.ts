import type { FetchedJob } from '@/types/job';

const GREENHOUSE_PATTERN =
  /^https?:\/\/job-boards\.greenhouse\.io\/([^/]+)\/jobs\/(\d+)(?:\/.*)?$/;

const STRIPE_PATTERN =
  /^https?:\/\/(?:www\.)?stripe\.com\/jobs(?:\/.*)?$/;

export function parseGreenhouseUrl(url: string): { company: string; jobId: string } | null {
  const match = url.trim().match(GREENHOUSE_PATTERN);
  if (!match) return null;
  return { company: match[1], jobId: match[2] };
}

export function isGreenhouseUrl(url: string): boolean {
  return parseGreenhouseUrl(url) !== null;
}

export async function fetchGreenhouseJob(url: string): Promise<FetchedJob | null> {
  const parsed = parseGreenhouseUrl(url);
  if (!parsed) return null;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechInterviewBot/1.0)',
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    const company = parsed.company.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const roleMatch = html.match(
      /<h1[^>]*class="[^"]*app-title[^"]*"[^>]*>([^<]+)<\/h1>/i
    ) || html.match(/<title[^>]*>([^|–-]+)/i);
    const role = roleMatch
      ? roleMatch[1].replace(/^\s*Jobs?\s*[-–|]\s*/i, '').trim()
      : 'Unknown Role';

    const extractText = (raw: string) =>
      raw
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const contentMatch =
      html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/i) ||
      html.match(/<section[^>]*id="content"[^>]*>([\s\S]*?)<\/section>/i) ||
      html.match(/<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    let description = contentMatch ? extractText(contentMatch[1]) : '';

    if (!description && html.length > 500) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        description = extractText(bodyMatch[1]).slice(0, 8000);
      }
    }

    return {
      company,
      role,
      description: description || 'Job description could not be extracted.',
      url,
    };
  } catch {
    return null;
  }
}

export function isStripeUrl(url: string): boolean {
  return STRIPE_PATTERN.test(url.trim());
}

function extractTextFromHtml(raw: string): string {
  return raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function fetchStripeJob(url: string): Promise<FetchedJob | null> {
  if (!isStripeUrl(url)) return null;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Try JSON-LD JobPosting first (Stripe may embed this)
    const jsonLdMatch = html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
    );
    if (jsonLdMatch) {
      try {
        const json = JSON.parse(jsonLdMatch[1]);
        const data = Array.isArray(json) ? json.find((j: { '@type'?: string }) => j['@type'] === 'JobPosting') : json;
        if (data && data['@type'] === 'JobPosting') {
          const desc = typeof data.description === 'string' ? data.description : '';
          const title = data.title ?? data.name ?? 'Unknown Role';
          if (desc.length > 100) {
            return {
              company: 'Stripe',
              role: String(title),
              description: desc,
              url,
            };
          }
        }
      } catch {
        // Fall through to HTML parsing
      }
    }

    // Fallback: extract from HTML structure
    const roleMatch =
      html.match(/data-page-title="([^"]+)"/i) ||
      html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
      html.match(/<title[^>]*>([^|–-]+)/i);
    const role = roleMatch ? roleMatch[1].replace(/^\s*Stripe\s*[-–|]\s*/i, '').trim() : 'Unknown Role';

    // Stripe embeds job description in a block starting with "About Stripe"
    let rawContent = '';
    const stripeJobBlock = html.match(
      /<h2 id="about-stripe">[\s\S]*?(?=<section\s|Apply for this role|In-office expectations)/i
    );
    if (stripeJobBlock && stripeJobBlock[0].length > 200) {
      rawContent = stripeJobBlock[0];
    }
    if (!rawContent) {
      const contentMatch =
        html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
        html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
        html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
        html.match(/<div[^>]*data-testid="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
        html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      rawContent = contentMatch ? contentMatch[1] : html;
    }
    let description = extractTextFromHtml(rawContent);

    if (description.length < 200 && html.length > 1000) {
      // SPA: content may be in __NEXT_DATA__ or similar
      const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
      if (nextDataMatch) {
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          const pageProps = nextData?.props?.pageProps ?? nextData?.props ?? {};
          const job = pageProps?.job ?? pageProps?.listing ?? pageProps;
          if (job && typeof job === 'object') {
            const parts: string[] = [];
            if (job.title) parts.push(job.title);
            if (job.description) parts.push(job.description);
            if (job.responsibilities) parts.push(String(job.responsibilities));
            if (job.requirements) parts.push(String(job.requirements));
            if (job.qualifications) parts.push(String(job.qualifications));
            const desc = parts.join('\n\n');
            if (desc.length > 100) {
              return {
                company: 'Stripe',
                role: job.title ?? role,
                description: desc,
                url,
              };
            }
          }
        } catch {
          // Ignore
        }
      }
    }

    if (description.length < 100) return null;

    return {
      company: 'Stripe',
      role,
      description: description.slice(0, 12000),
      url,
    };
  } catch {
    return null;
  }
}

export async function fetchJob(url: string): Promise<FetchedJob | null> {
  if (isGreenhouseUrl(url)) {
    return fetchGreenhouseJob(url);
  }
  if (isStripeUrl(url)) {
    const stripeJob = await fetchStripeJob(url);
    if (stripeJob) return stripeJob;
  }
  return fetchGenericJob(url);
}

function hostnameToCompany(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  const parts = host.split('.');
  const root = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return root
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanText(raw: string): string {
  return raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchGenericJob(url: string): Promise<FetchedJob | null> {
  try {
    const parsedUrl = new URL(url);
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (html.length < 200) return null;

    const titleMatch =
      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
      html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i) ||
      html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i);

    const rawTitle = titleMatch?.[1]?.trim() ?? 'Unknown Role';
    const role = rawTitle
      .replace(/\s*[|–-]\s*(careers?|jobs?|job openings?)\b.*$/i, '')
      .replace(/^\s*(careers?|jobs?)\s*[|–-]\s*/i, '')
      .trim();

    const contentMatch =
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
      html.match(/<section[^>]*class="[^"]*(job|position|description)[^"]*"[^>]*>([\s\S]*?)<\/section>/i) ||
      html.match(/<div[^>]*class="[^"]*(job|position|description|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    // If regex has an optional prefix capture group, keep the last captured group.
    const contentHtml = contentMatch ? contentMatch[contentMatch.length - 1] : html;
    const description = cleanText(contentHtml).slice(0, 12000);

    if (description.length < 120) return null;

    return {
      company: hostnameToCompany(parsedUrl.hostname),
      role: role || 'Unknown Role',
      description,
      url,
    };
  } catch {
    return null;
  }
}
