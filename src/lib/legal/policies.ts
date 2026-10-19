export interface LegalSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
  links?: readonly { label: string; href: string }[];
}
export interface LegalPolicy {
  slug: 'privacy' | 'terms' | 'cookies';
  title: string;
  eyebrow: string;
  heading: readonly [string, string];
  description: string;
  approvalNotes: readonly string[];
  sections: readonly LegalSection[];
}

export const legalPolicies: readonly LegalPolicy[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    eyebrow: 'Your privacy',
    heading: ['Privacy matters.', 'Clarity matters more.'],
    description:
      'How ElevateX Lab handles information shared through this website, project conversations and optional website analytics.',
    approvalNotes: [
      'Confirm the legal operator behind the ElevateX Lab trading name. Hamid is the verified founder; no registered entity or legal address has been supplied.',
      'Approve the proposed inquiry-retention criteria and state the actual Google Analytics retention setting, Clarity retention/settings and hosting-log practices.',
      'Approve this wording for the actual audience and operating model. Pakistan and the WhatsApp privacy contact are owner-confirmed. Applicable international obligations and transfer arrangements need review.',
    ],
    sections: [
      {
        id: 'operator',
        title: 'Who this policy concerns',
        paragraphs: [
          'This website is operated by Hamid, trading as ElevateX Lab, in Pakistan. The website presents web development, AI automation, AI chatbots and landing-page services.',
          'For a question about this policy or the information you share with us, contact us using the WhatsApp privacy-request channel below. This policy concerns the website; a particular client project may need separate privacy arrangements.',
        ],
      },
      {
        id: 'inquiries',
        title: 'Project inquiries and conversations',
        paragraphs: [
          'The current website form is a local review interface. It includes name, email, service, project description and optional phone, website, budget and timeline fields. Reviewing or validating those fields does not submit them to us, save them in a website database or email an inquiry. Values remain in the current browser page unless your browser independently retains them.',
          'If you choose WhatsApp, you leave this website and communicate through that service. We receive the details you choose to send there and use them to understand your request, reply and discuss possible next steps. WhatsApp also processes information under its own terms and privacy policy. Avoid sending sensitive documents or unnecessary personal information in an initial inquiry.',
          'There is no automated lead-acceptance backend on this website. An inquiry, reviewed form or WhatsApp click is not a completed service agreement.',
        ],
        links: [
          {
            label: 'WhatsApp privacy information',
            href: 'https://www.whatsapp.com/legal/privacy-policy',
          },
        ],
      },
      {
        id: 'hosting',
        title: 'Website delivery and technical information',
        paragraphs: [
          'The website is hosted through Cloudflare. Loading a website involves technical information such as network addresses, requested resources, timestamps, browser information and security signals. Cloudflare processes technical information to deliver and protect hosted content under its applicable service arrangements.',
          'We do not require an account or payment to read this website. The site does not implement a customer login, checkout or inquiry-storage database.',
        ],
        links: [
          {
            label: 'Cloudflare privacy information',
            href: 'https://www.cloudflare.com/privacypolicy/',
          },
        ],
      },
      {
        id: 'analytics',
        title: 'Optional Google Analytics',
        paragraphs: [
          'When you accept optional analytics, Google Analytics 4 helps us understand page use and service interest. The website sends page views and selected actions such as opening a case study, choosing a service contact link, starting the inquiry form or clicking WhatsApp.',
          'Enhanced Measurement is enabled. Depending on the stream settings and available features, Google can also measure scrolling, outbound links, downloads, form interactions and supported media. These automatic events may include public destination URLs and form identifiers; a form interaction or submit event does not confirm that we received an inquiry.',
          'Our custom events do not include names, email addresses, phone numbers, free-text messages or project descriptions. This does not mean that analytics is anonymous or collects no personal information: providers process technical and pseudonymous identifiers under their own arrangements.',
          'Advertising storage, advertising personalization and Google signals are disabled in this integration. A WhatsApp click records interest only; it does not prove that a conversation or lead occurred. No confirmed-lead event is sent by the current form.',
        ],
        links: [
          {
            label: 'Google privacy policy',
            href: 'https://policies.google.com/privacy',
          },
        ],
      },
      {
        id: 'recording',
        title: 'Optional Microsoft Clarity',
        paragraphs: [
          'After an analytics grant, Microsoft Clarity can help us understand clicks, scrolling and website interactions using heatmaps and session recordings. These recordings are reconstructed interaction data, rather than a video of your device camera.',
          'The integration marks the entire page, including the inquiry form and editable fields, for masking and does not send custom identity information. Masking is a protection, not a guarantee that every possible sensitive detail is removed. We do not deliberately unmask inquiry details. Our loader also skips collection on query-string URLs, unknown fragments and sensitive referrers.',
          'We do not load Clarity before an analytics grant. Denying cookies alone is not equivalent to stopping all provider transmission, which is why the script itself is blocked until permission is given.',
        ],
        links: [
          {
            label: 'Microsoft privacy statement',
            href: 'https://privacy.microsoft.com/privacystatement',
          },
        ],
      },
      {
        id: 'choice',
        title: 'Your analytics choice',
        paragraphs: [
          'Optional analytics start off. You can accept or reject them and reopen Cookie Preferences later. Reading the site does not require accepting optional analytics. We honor browser Do Not Track and Global Privacy Control by keeping these integrations off.',
          'Withdrawal disables the tracking adapter, requests provider consent changes, attempts to remove known first-party analytics cookies and reloads after saving the denial. It stops future optional collection through this integration; it cannot erase information already sent to providers. If the browser blocks preference storage, the interface explains that limitation.',
        ],
        links: [{ label: 'Cookie Policy', href: '/cookies/' }],
      },
      {
        id: 'retention',
        title: 'Storage and retention',
        paragraphs: [
          'We keep inquiry correspondence only while needed to respond, discuss a potential project, carry out agreed work or meet applicable record-keeping and dispute needs. Unnecessary information should be removed when those purposes end.',
          'Our Google Analytics event and user-data retention setting is 14 months. This setting does not govern all aggregated reports. Microsoft documents Clarity recording retention of 30 days, with favorites and a random sample retained for up to nine months. Provider cookie durations, analytics reports, hosting logs and our own correspondence are different things; a browser preference toggle does not control all of those systems.',
          'We remember an analytics choice for up to 180 days using a versioned browser-storage record containing the choice and expiry. Clearing browser storage removes that saved preference. Cloudflare processes delivery and security information under its own service arrangements.',
        ],
      },
      {
        id: 'sharing',
        title: 'Providers, international processing and security',
        paragraphs: [
          'Cloudflare, Google, Microsoft and WhatsApp process information relevant to their respective services. Their processing may involve countries outside Pakistan or your country. The applicable service terms, locations and transfer arrangements must be considered for the audiences served.',
          'The website uses HTTPS where served by the configured host, native browser protections and limited custom analytics fields. No internet service can promise absolute security. Do not send passwords, financial account details or sensitive records through an initial inquiry.',
        ],
      },
      {
        id: 'requests',
        title: 'Privacy questions and requests',
        paragraphs: [
          'Contact +92 335 6709222 on WhatsApp and explain the information or processing you are asking about. Share only enough detail to identify the relevant conversation. We may need proportionate information to check that a request concerns your own information.',
          'Depending on the law that applies, you may have rights to ask for access, correction, deletion, restriction or objection, to withdraw consent, or to complain to a relevant authority. Applicable rights and exceptions depend on the circumstances; this page does not promise that every request can be fulfilled without a lawful reason to retain information.',
        ],
        links: [
          {
            label: 'Contact privacy requests on WhatsApp',
            href: 'https://wa.me/923356709222',
          },
        ],
      },
      {
        id: 'updates',
        title: 'Changes to this policy',
        paragraphs: [
          'An approved updated policy will identify its effective update date. If our website data practices change, the policy and, where appropriate, the consent choice must be reviewed before the new processing begins.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Website Terms',
    eyebrow: 'Website terms',
    heading: ['Clear expectations.', 'Better experiences.'],
    description:
      'Terms for using the ElevateX Lab website and understanding the material presented here.',
    approvalNotes: [
      'Approve the actual operator identity and these substantive website-use terms before publication.',
      'No governing law, court, refund policy, limitation amount, company registration or payment obligation has been invented. Project contracts remain separate.',
    ],
    sections: [
      {
        id: 'purpose',
        title: 'About this website',
        paragraphs: [
          'ElevateX Lab presents digital services, selected project concepts and practical editorial material. These terms concern use of the website. They are not a quotation, statement of work or complete client-services contract.',
        ],
      },
      {
        id: 'use',
        title: 'Reasonable website use',
        paragraphs: [
          'Use the site lawfully and avoid interfering with its operation, attempting unauthorized access, distributing harmful content or misrepresenting yourself as ElevateX Lab. Do not use the inquiry or contact channels to send unwanted bulk messages.',
          'You may read the public material and share ordinary links to it. Other uses of protected material may require permission from the relevant rights holder.',
        ],
      },
      {
        id: 'materials',
        title: 'Content and project materials',
        paragraphs: [
          'Website text, design, code, photographs, artwork, logos and project materials may be subject to copyright, licenses or other rights. ElevateX Lab does not claim ownership of every third-party asset, brand or item shown in a project presentation.',
          'Concept projects, illustrative scenes, generated art and authentic website captures are labelled according to their context. A concept or interface demonstration is not a client endorsement, deployed integration or guarantee of commercial results.',
        ],
      },
      {
        id: 'information',
        title: 'Information and results',
        paragraphs: [
          'The site explains possible approaches and examples. It is not individualized legal, financial or other regulated advice. Technical choices and outcomes depend on the actual project, systems and operating conditions.',
          'Performance goals, illustrative workflows and proposed adaptations are not promises of rankings, revenue, conversions or universal system reliability. Refer to the stated source and limits of a particular example.',
        ],
      },
      {
        id: 'projects',
        title: 'Inquiries and separate agreements',
        paragraphs: [
          'An inquiry does not itself create a paid service agreement or oblige either party to proceed. The current form only reviews information locally; it does not deliver an inquiry. WhatsApp is the available conversation channel.',
          'Project scope, deliverables, fees, milestones, ownership arrangements and other commercial terms are agreed separately when applicable. These website terms do not introduce a refund, cancellation or payment policy for a future project.',
        ],
        links: [{ label: 'Project contact', href: '/contact/' }],
      },
      {
        id: 'external',
        title: 'External links',
        paragraphs: [
          'Project demos, sources and provider links may take you to websites controlled by others. Their content, availability, privacy choices and terms are their responsibility. A link is not a guarantee of their service or an endorsement of every statement they make.',
        ],
      },
      {
        id: 'availability',
        title: 'Availability and changes',
        paragraphs: [
          'Website content and features may change, and access may be interrupted for maintenance, technical issues or other reasons. We do not promise uninterrupted access or that every item will remain available indefinitely.',
          'Nothing in these terms is intended to remove rights that cannot lawfully be excluded. Any project-specific commitments must be addressed in the applicable separate agreement.',
        ],
      },
      {
        id: 'privacy',
        title: 'Privacy and contact',
        paragraphs: [
          'The Privacy Policy and Cookie Policy explain website information handling and optional analytics choices. Contact ElevateX Lab on WhatsApp at +92 335 6709222 if you have a question about website use.',
        ],
        links: [
          { label: 'Privacy Policy', href: '/privacy/' },
          { label: 'Cookie Policy', href: '/cookies/' },
          { label: 'WhatsApp contact', href: 'https://wa.me/923356709222' },
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    eyebrow: 'Cookies and choices',
    heading: ['Your visit.', 'Your choice.'],
    description:
      'How browser storage and optional Google Analytics and Microsoft Clarity work on this website.',
    approvalNotes: [
      'Approve the implemented 180-day consent-choice duration or specify a replacement. This is an existing code value, not an assumed business policy.',
      'Confirm actual provider cookie expiry and analytics retention settings before activation. Names below are provider-documented examples, not a claim that a live session has been inspected.',
      'Cloudflare security cookies depend on actual zone features. No unsupported necessary-cookie inventory is claimed.',
    ],
    sections: [
      {
        id: 'meaning',
        title: 'Cookies and similar technologies',
        paragraphs: [
          'Cookies are small browser records associated with a website or provider. Local storage is a separate browser mechanism that can remember a preference across page visits. Their purposes and lifetimes depend on the implementation and provider.',
        ],
      },
      {
        id: 'necessary',
        title: 'Preferences and website delivery',
        paragraphs: [
          'The website uses a local-storage record named elevatex.analytics-consent to remember an analytics grant or denial, its policy version and expiry. The current implementation expires that record after 180 days. It does not contain inquiry details.',
          'If preference storage is blocked or cleared, a previous choice may be unavailable and optional analytics default off. Cloudflare delivers and protects the site; whether it sets a security cookie depends on the enabled hosting features. No account, shopping basket or payment session is implemented here.',
        ],
      },
      {
        id: 'google',
        title: 'Optional Google Analytics storage',
        paragraphs: [
          'After valid analytics consent, Google Analytics may use cookies to distinguish browsers and understand page use. Google documents names such as _ga and _ga_<container-id>. Cookie expiry may depend on the property and tag configuration; it is different from retention of analytics reports.',
          'The website does not load Google Analytics before an analytics grant. Advertising storage and personalization remain denied. Our selected interaction events exclude form content and personal contact details.',
          'After permission, Enhanced Measurement can also collect interaction events such as scrolls, outbound clicks, downloads and form interactions, depending on the stream settings. These events are usage measurements, not proof of a delivered inquiry or completed sale.',
        ],
        links: [
          {
            label: 'Google Analytics cookie documentation',
            href: 'https://developers.google.com/analytics/devguides/collection/ga4/cookie-usage',
          },
          {
            label: 'Google Analytics retention controls',
            href: 'https://support.google.com/analytics/answer/7667196?hl=en',
          },
        ],
      },
      {
        id: 'clarity',
        title: 'Optional Microsoft Clarity storage',
        paragraphs: [
          'After valid analytics consent, Clarity may use first-party cookies such as _clck to associate a browser with its Clarity preferences and _clsk to connect page views within a session. Microsoft also documents third-party cookies; their use depends on consent, provider behavior and browser controls.',
          'The integration grants analytics storage only, keeps advertising storage denied and marks inquiry/editable regions for masking. Cookie denial alone is not relied on to prevent transmission: the Clarity script is blocked before a grant.',
        ],
        links: [
          {
            label: 'Microsoft Clarity cookie list',
            href: 'https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies',
          },
        ],
      },
      {
        id: 'manage',
        title: 'Manage or withdraw permission',
        paragraphs: [
          'Use Cookie Preferences in the footer to accept or reject optional analytics, or to change a previous choice. Neither option is preselected as permission. Website content remains available when you reject.',
          'Withdrawal disables optional event collection, updates provider consent, attempts known first-party cookie cleanup and reloads the document after saving denial. It cannot recall data already received by providers or delete cookies owned by unrelated domains. Browser settings can also remove or block storage.',
          'Do Not Track and Global Privacy Control keep these integrations off. Without JavaScript, neither optional provider loads; the policy text remains readable. If optional analytics are operationally disabled, the preferences area states that instead of suggesting collection is active.',
        ],
      },
      {
        id: 'more',
        title: 'Further questions',
        paragraphs: [
          'The Privacy Policy explains the wider information-handling context. For a privacy question, contact ElevateX Lab in Pakistan on WhatsApp at +92 335 6709222.',
        ],
        links: [
          { label: 'Privacy Policy', href: '/privacy/' },
          {
            label: 'WhatsApp privacy contact',
            href: 'https://wa.me/923356709222',
          },
        ],
      },
    ],
  },
];
