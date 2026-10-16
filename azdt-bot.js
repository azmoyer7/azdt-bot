/* ===========================================================================
   AZ Does Taxes — website FAQ assistant  ("Winnie on the web")
   ---------------------------------------------------------------------------
   Single-file, zero-dependency chat widget. Drop in one <script> tag.

   HOW IT ANSWERS: every answer below is written by hand and grounded in the
   AZDT Company Brain. There is no AI model and no network call — the bot can
   only ever say something that appears in KB[] below. If it doesn't have a
   confident match, it hands off to a human. That is deliberate: a tax firm's
   public bot must not improvise.

   TO EDIT:  change CONFIG (contact details) or KB (the answers), then re-upload.
             Nothing else in this file needs to be touched.

   Sources: Company-Brain-Winnie/soul.md · reference/firm-facts.md ·
            reference/tax-calendar.md · Live-Registers/pricing-2027.md ·
            Playbooks/offers-and-pricing.md · hackathon/faq-batch-01.md
   Brand:   AZDT Brand Book 2025 (Blue Ribbon / Deep Koamaru / Riptide, Roboto)
   =========================================================================== */
(function () {
  'use strict';
  if (window.__azdtBotLoaded) return;
  window.__azdtBotLoaded = true;

  /* ======================= CONFIG — edit these ============================ */
  var CONFIG = {
    botName:     'Ask AZDT',
    greeting:    "Hi! I'm the AZ Does Taxes assistant. I can answer questions about our services, deadlines, pricing and the client portal.",
    greeting2:   "What brings you here today?",

    phone:       '512-522-7446',
    email:       'help@azdoestaxes.com',
    portalUrl:   'https://azdoestaxes.clientportal.com/',

    // Levitate scheduler — confirmed by AZ 2026-10-16. Used everywhere the bot
    // hands off to a human, so this one line is the whole fix if it ever changes.
    bookingUrl:  'https://meeting.levitate.ai/#/6dc7a6-2l5x8y/15-minute-meeting',
    bookingText: 'Book a free 15-min call',

    // Shown in the panel footer on every conversation.
    disclaimer:  'AZ Does Taxes provides tax preparation and financial education. Nothing here is investment, legal, or individualized tax advice, and no outcome is guaranteed. We are not a registered investment adviser or broker-dealer.',

    openOnFirstVisit: false,   // true = auto-open the panel for new visitors
    openDelayMs:      8000     // ...after this long
  };

  /* ======================= THE OPENING MENU ============================== */
  /* The four doors a visitor walks through. Each lists starter questions. */
  var ROUTES = [
    { label: "I'm a business owner", who: 'business owners',
      ask: ['What services do you offer?', 'How much do you charge?', 'Do you do bookkeeping and payroll?', 'When is my business return due?'] },
    { label: "I'm an NIL athlete",   who: 'NIL athletes',
      ask: ['Do you work with NIL athletes?', 'How much does NIL tax help cost?', 'Do I owe taxes on my NIL money?', 'I earn NIL in more than one state'] },
    { label: "I'm an individual",    who: 'individuals',
      ask: ['How much does a personal return cost?', 'When is my tax return due?', 'What are my refund options?', 'How do I become a client?'] },
    { label: "I'm already a client", who: 'current clients',
      ask: ["I can't log in to the portal", 'Does my spouse need to sign too?', 'What are my refund options?', 'I got a letter from the IRS'] }
  ];

  /* ======================= KNOWLEDGE BASE ================================
     id      — unique
     q       — question phrasings a visitor might type (drives matching)
     k       — extra keywords (weighted higher than q words)
     a       — the answer, HTML. Keep it short and in AZDT voice.
     chips   — follow-up questions to offer
     cta     — true to show the booking button under the answer
     ====================================================================== */
  var KB = [

  /* ---------- CLIENT PORTAL & EXISTING CLIENTS ---------- */
  {
    id: 'portal-login',
    q: ["I can't log in to the portal", 'portal login not working', 'how do I access the client portal',
        'forgot my portal password', 'the portal won\'t let me in', 'where is the client portal'],
    k: ['portal', 'login', 'log', 'signin', 'sign', 'password', 'account', 'access', 'clientportal'],
    a: "You'll first need to <strong>create an account</strong>, which you can do using Google Sign-On — and be sure to use <strong>the same email address we have on file for you</strong>. That's the piece that trips most people up." +
       "<p>If it still won't take, email <a href=\"mailto:" + CONFIG.email + "\">" + CONFIG.email + "</a> and we'll jump on a quick call.</p>" +
       "<p><a href=\"" + CONFIG.portalUrl + "\" target=\"_blank\" rel=\"noopener\">Open the client portal &rarr;</a></p>",
    chips: ['Does my spouse need to sign too?', 'What are my refund options?']
  },
  {
    id: 'spouse-signature',
    q: ['does my spouse need to sign', 'do both of us have to sign', 'who signs the tax return',
        'can I sign for my husband', 'can I sign for my wife', 'signature required both spouses', 'form 8879 signing'],
    k: ['spouse', 'spouses', 'husband', 'wife', 'sign', 'signature', 'signing', 'both', '8879'],
    a: "We need <strong>both the taxpayer's and the spouse's signature</strong> on all tax filings — there's no way around it on a joint return." +
       "<p>If you send us your spouse's email we'll add them to the request so they can sign their own copy.</p>" +
       "<p>Worth knowing: the authorization form only confirms our authority to file on your behalf — it isn't the return itself.</p>",
    chips: ["I can't log in to the portal", 'When is my tax return due?']
  },
  {
    id: 'refund-options',
    q: ['what are my refund options', 'how do I get my refund', 'direct deposit refund',
        'can I get a check', 'when will I get my refund', 'apply refund to next year',
        'can I put my refund toward next year'],
    k: ['refund', 'refunds', 'deposit', 'check', 'reimbursement', 'money back'],
    a: "Three choices. We can set up <strong>direct deposit</strong> into an account of your choosing — we'd need the routing number, account number and account type. Or <strong>the IRS can mail you a check</strong> at the address on your return." +
       "<p>You can also <strong>apply the refund forward</strong> as an estimated payment toward next year, which some clients prefer — especially if you tend to owe.</p>" +
       "<p>We can't look up the status of a specific refund here — the IRS <em>Where's My Refund</em> tool is the fastest way to check that.</p>",
    chips: ['Does my spouse need to sign too?', 'How do I contact a human?']
  },
  {
    id: 'irs-notice',
    q: ['I got a letter from the IRS', 'I received an IRS notice', 'the IRS sent me something',
        'I am being audited', 'IRS audit help', 'state tax notice', 'can you deal with the IRS for me'],
    k: ['irs', 'notice', 'letter', 'audit', 'audited', 'examination', 'cp2000', 'representation', 'levy', 'lien'],
    a: "Yes — this is squarely what we do, and it's worth sending to us rather than sitting on it. Most notices have a response window." +
       "<p>We handle <strong>IRS and state representation</strong>: reading the notice, working out whether it's correct, and responding on your behalf. We can also set up a Power of Attorney so we can talk to the agency directly.</p>" +
       "<p>Send a copy of the notice to <a href=\"mailto:" + CONFIG.email + "\">" + CONFIG.email + "</a> or book a call and bring it with you.</p>",
    cta: true,
    chips: ['How much do you charge?', 'How do I become a client?']
  },

  /* ---------- DEADLINES ---------- */
  {
    id: 'due-business',
    q: ['when is my business tax return due', 'when is my s corp return due', 'partnership return deadline',
        'when is the 1120s due', 'when is the 1065 due', 'c corp filing deadline', 'business tax deadline'],
    k: ['business', '1065', '1120s', '1120', 'partnership', 'scorp', 'ccorp', 'corporation', 'llc',
        'due', 'deadline', 'deadlines', 'duedate', 'filing', 'file'],
    a: "It depends on your entity and your tax year." +
       "<p><strong>Partnerships and S Corps</strong> (Forms 1065 and 1120-S) are due the <strong>15th day of the 3rd month</strong> after your tax year ends — for a calendar-year business, that's March 15.</p>" +
       "<p><strong>C Corps</strong> (Form 1120) are due the <strong>15th day of the 4th month</strong> — April 15 for calendar-year filers.</p>" +
       "<div class=\"azdt-nerdy\"><span class=\"azdt-nerdy-tag\">The nerdy stuff &middot; TLDR</span>" +
       "<p><strong>TLDR:</strong> if your business year ends December 31, use the dates above. If it doesn't, count the months yourself.</p>" +
       "<p>The IRS publishes these as rules relative to <em>your</em> tax year end, not as fixed dates. A partnership with a June 30 year end is not due March 15. Dates also shift when the 15th lands on a weekend or holiday.</p></div>",
    chips: ['What if I need an extension?', 'When is my tax return due?']
  },
  {
    id: 'due-individual',
    q: ['when is my tax return due', 'when is the 1040 due', 'individual tax deadline',
        'when do I have to file', 'personal tax return deadline', 'tax day'],
    k: ['1040', 'individual', 'personal', 'my return', 'due', 'deadline', 'deadlines', 'duedate', 'file', 'filing', 'april'],
    a: "Individual returns (Form 1040) are due the <strong>15th day of the 4th month</strong> after your tax year ends — <strong>April 15</strong> for almost everyone." +
       "<p>If that date lands on a weekend or a legal holiday, it shifts to the next business day.</p>",
    chips: ['What if I need an extension?', 'When is my business return due?']
  },
  {
    id: 'extensions',
    q: ['what if I need an extension', 'can I file an extension', 'how does an extension work',
        'I am going to be late', 'extension deadline', 'form 4868', 'form 7004', 'october 15 deadline'],
    k: ['extension', 'extensions', 'extend', 'extended', 'late', '4868', '7004', 'october', 'september'],
    a: "An extension gets you an <strong>automatic 6 months</strong> — but it's an extension of time to <strong>file</strong>, never an extension of time to <strong>pay</strong>." +
       "<p>For calendar-year filers that means September 15 for partnerships and S Corps, and October 15 for C Corps and individuals.</p>" +
       "<div class=\"azdt-nerdy\"><span class=\"azdt-nerdy-tag\">The nerdy stuff &middot; TLDR</span>" +
       "<p><strong>TLDR:</strong> file the extension, but estimate what you owe and pay it by the original due date anyway.</p>" +
       "<p>Interest and late-payment penalties start accruing from the original deadline on any unpaid balance, extension or not. The extension only protects you from the separate, larger late-<em>filing</em> penalty.</p></div>",
    cta: true,
    chips: ['Can I set up a payment plan?', 'How do I become a client?']
  },
  {
    id: 'due-w2-1099',
    q: ['when are W2s due', 'when do I have to send 1099s', '1099 deadline', 'W-2 deadline',
        'contractor 1099 filing', 'when do employees get their W2'],
    k: ['w2', 'w-2', '1099', '1099s', 'contractor', 'contractors', 'employees', 'information returns'],
    a: "The rule is <strong>January 31</strong> — that's when W-2s and most 1099s have to be in your workers' hands and filed with the agencies." +
       "<p>When January 31 falls on a weekend, the deadline shifts to the next business day. So the exact date moves year to year even though the rule doesn't.</p>" +
       "<p>We prepare and file 1099 batches for clients on a partnership — just don't leave it to the last week of January.</p>",
    chips: ['Do you do bookkeeping and payroll?', 'How do I become a client?']
  },

  /* ---------- WHO WE ARE ---------- */
  {
    id: 'services',
    q: ['what services do you offer', 'what do you do', 'what can you help with', 'what do you specialize in',
        'tell me about your services', 'what kind of firm are you'],
    k: ['services', 'service', 'offer', 'offerings', 'do you do', 'help with', 'specialize', 'provide'],
    a: "We're a tax and accounting firm built around <strong>ongoing partnerships</strong> rather than once-a-year filing. The main things we do:" +
       "<ul><li><strong>Tax Strategy Partnerships</strong> — year-round advisory that absorbs your returns, estimates and planning</li>" +
       "<li><strong>Full-service Business Owner Partnerships</strong> — bookkeeping, tax, payroll and advisory bundled</li>" +
       "<li><strong>NIL Athlete Partnerships</strong> — built for college athletes earning NIL income</li>" +
       "<li><strong>Specialty projects</strong> — cost segregation, estate returns, HOA financial reviews</li>" +
       "<li><strong>Education</strong> — the Prosperity Playbook, plus speaking and workshops</li></ul>" +
       "<p>Formations and state registrations we advise on and hand to vetted partners, so you get the guidance without paying us to do data entry.</p>",
    chips: ['How much do you charge?', 'Who do you work with?', 'How do I become a client?']
  },
  {
    id: 'who-we-serve',
    q: ['who do you work with', 'who are your clients', 'do you work with small businesses',
        'what kind of clients do you have', 'is this for individuals or businesses', 'do you take new clients'],
    k: ['who', 'clients', 'client', 'serve', 'work with', 'small business', 'individuals', 'athletes', 'new clients'],
    a: "Three groups, mainly:" +
       "<ul><li><strong>Business owners</strong> — LLCs, S Corps, partnerships and C Corps, from first-year to established</li>" +
       "<li><strong>NIL athletes</strong> — college athletes with name, image and likeness income</li>" +
       "<li><strong>Individuals</strong> — especially people with rentals, side businesses or K-1s</li></ul>" +
       "<p>And yes, we're taking new clients.</p>",
    cta: true,
    chips: ['What services do you offer?', 'How do I become a client?']
  },
  {
    id: 'location',
    q: ['where are you located', 'what city are you in', 'do you have an office', 'are you local',
        'do you work with clients outside texas', 'can you do my taxes if I live in another state', 'are you remote'],
    k: ['located', 'location', 'where', 'office', 'city', 'austin', 'texas', 'state', 'states', 'remote',
        'local', 'near me', 'virtual', 'in person'],
    a: "We're based in <strong>Austin, Texas</strong>, and we work with clients across the country — the whole process runs through our secure client portal, so where you live isn't a limit." +
       "<p>Beyond Texas we regularly handle filings in Delaware, Oklahoma, North Carolina, Colorado and Pennsylvania, and we can register you in new states as you grow.</p>",
    chips: ['How do I become a client?', 'I earn income in more than one state']
  },
  {
    id: 'team-credentials',
    q: ['are you a CPA', 'who will do my taxes', 'who does my return', 'who is AZ', 'what are your credentials',
        'how big is your team', 'who reviews my return', 'are you licensed'],
    k: ['cpa', 'credential', 'credentials', 'licensed', 'license', 'who', 'team', 'az', 'moyer', 'prepare', 'prepares', 'preparer',
        'enrolled agent', 'qualified', 'experience'],
    a: "<strong>AZ Moyer</strong> is a CPA and the founder — he reviews every return that goes out the door and signs off on tax advice." +
       "<p>Behind him is a five-person team: a Tax Manager (also a CPA) on senior review and complex returns, a Tax Accountant running prep, a Staff Accountant on bookkeeping, and a Client Success Coordinator who handles onboarding, payroll and documents.</p>" +
       "<p>There's also Winnie, our Chief Morale Officer. She's a mini Australian labradoodle and her qualifications are mostly fetch.</p>",
    chips: ['How do I become a client?', 'What services do you offer?']
  },
  {
    id: 'hours',
    q: ['what are your office hours', 'are you open right now', 'when are you available',
        'what time do you close', 'can I walk in', 'are you open on weekends'],
    k: ['hour', 'hours', 'open', 'closed', 'close', 'availability', 'available', 'appointment', 'walk in', 'weekend'],
    a: "We're open <strong>9am to 5pm Central, Monday through Friday</strong>." +
       "<p>Outside those hours the fastest route is the calendar \u2014 it'll only show you slots we're actually free.</p>" +
       "<p>For anything quick, email <a href=\"mailto:" + CONFIG.email + "\">" + CONFIG.email + "</a> or call <a href=\"tel:" + CONFIG.phone.replace(/-/g, '') + "\">" + CONFIG.phone + "</a> and we'll get back to you.</p>",
    cta: true,
    chips: ['How do I become a client?', 'Where are you located?']
  },
  {
    id: 'contact',
    q: ['how do I contact you', 'can I talk to a person', 'what is your phone number', 'I want to speak to someone',
        'email address', 'human please', 'customer service', 'talk to a real person'],
    k: ['contact', 'phone', 'call', 'email', 'reach', 'human', 'person', 'someone', 'number'],
    a: "Happily — here's how to reach us:" +
       "<ul><li><strong>Phone:</strong> <a href=\"tel:" + CONFIG.phone.replace(/-/g, '') + "\">" + CONFIG.phone + "</a></li>" +
       "<li><strong>Email:</strong> <a href=\"mailto:" + CONFIG.email + "\">" + CONFIG.email + "</a></li>" +
       "<li><strong>Existing clients:</strong> message us inside the <a href=\"" + CONFIG.portalUrl + "\" target=\"_blank\" rel=\"noopener\">client portal</a></li></ul>",
    cta: true
  },

  /* ---------- NIL ---------- */
  {
    id: 'nil-yes',
    q: ['do you work with NIL athletes', 'can you help with NIL', 'NIL taxes', 'I am a college athlete',
        'name image and likeness taxes', 'do you do athlete taxes'],
    k: ['nil', 'athlete', 'athletes', 'college', 'ncaa', 'name image likeness', 'student athlete', 'sponsorship deal'],
    a: "Yes — NIL is one of our core practice areas, and it's a genuinely different animal from a normal W-2." +
       "<p>NIL partnerships are built around what athletes actually run into: you're treated as self-employed, nobody is withholding tax for you, and income from collectives and brand deals can pull you into more than one state.</p>" +
       "<p>We handle the return, the set-aside math so you're not surprised in April, quarterly estimates, and — as the money grows — whether an entity makes sense.</p>",
    cta: true,
    chips: ['How much does NIL tax help cost?', 'Do I owe taxes on my NIL money?']
  },
  {
    id: 'nil-taxable',
    q: ['do I owe taxes on my NIL money', 'is NIL income taxable', 'do I have to pay tax on NIL',
        'how much should I save from NIL', 'nobody withheld taxes from my NIL deal', 'NIL 1099'],
    k: ['nil', 'taxable', 'owe', 'taxes on', 'withheld', 'withholding', 'save', 'set aside', 'quarterly'],
    a: "Short answer: <strong>yes</strong>. NIL income is taxable, and because nobody withholds tax from it the way an employer would, the bill arrives all at once." +
       "<p>It's generally treated as <strong>self-employment income</strong>, which means income tax <em>and</em> self-employment tax, and it usually triggers quarterly estimated payments.</p>" +
       "<p>How much to set aside depends on your total income, your state, and what you can deduct. That's a real conversation rather than a number we can quote you here.</p>" +
       "<div class=\"azdt-nerdy\"><span class=\"azdt-nerdy-tag\">The nerdy stuff &middot; TLDR</span>" +
       "<p><strong>TLDR:</strong> treat NIL money like business income, not like a gift. Set some aside the day it lands.</p>" +
       "<p>Non-cash deals count too — free product, a car, covered travel. If a brand gives you something of value for your name or image, the value is generally income even though no cash moved.</p></div>",
    cta: true,
    chips: ['How much does NIL tax help cost?', 'I earn income in more than one state']
  },
  {
    id: 'multi-state',
    q: ['I earn income in more than one state', 'do I have to file in multiple states', 'multi state taxes',
        'I played games in other states', 'do I owe taxes in another state', 'new state registration'],
    k: ['state', 'states', 'multistate', 'multiple', 'another state', 'nonresident', 'registration', 'nexus'],
    a: "Quite possibly, yes. Earning income in a state can create a filing obligation there even if you don't live there — this catches a lot of athletes, remote workers and growing businesses." +
       "<p>Which states and how much depends on where the income was earned, how much, and each state's own thresholds. We sort out which returns you actually need rather than filing everywhere out of caution.</p>" +
       "<p>For businesses, we also handle registering you in a new state when you expand.</p>",
    cta: true,
    chips: ['How much do you charge?', 'Do you work with clients outside Texas?']
  },

  /* ---------- PRICING ---------- */
  {
    id: 'price-general',
    q: ['how much do you charge', 'what are your prices', 'how much does it cost', 'pricing',
        'what are your fees', 'is it expensive', 'do you have a price list'],
    k: ['price', 'prices', 'pricing', 'cost', 'costs', 'charge', 'charges', 'fee', 'fees', 'rate', 'rates',
        'how much', 'expensive', 'afford', 'quote'],
    a: "Here's roughly where things start. Your actual number depends on your situation, so these are honest starting points rather than a quote:" +
       "<ul><li><strong>Personal return (1040)</strong> — from $750</li>" +
       "<li><strong>Business return (1120-S, 1065, 1120)</strong> — from $1,250, including one state</li>" +
       "<li><strong>Tax Strategy Partnership</strong> — from $229/month</li>" +
       "<li><strong>Full-service Business Owner Partnership</strong> — from $950/month</li>" +
       "<li><strong>NIL Athlete Partnership</strong> — from $125/month</li></ul>" +
       "<p>Most clients land on a monthly partnership rather than per-return pricing, because the planning is where the money actually gets saved.</p>" +
       "<p>AZ prices the engagement on a 15-minute call. No charge for that call.</p>",
    cta: true,
    chips: ['How much does a personal return cost?', 'How much does NIL tax help cost?', 'What services do you offer?']
  },
  {
    id: 'price-1040',
    q: ['how much does a personal return cost', 'price for a 1040', 'cost of individual tax return',
        'how much to file my personal taxes', 'what do you charge for a simple return'],
    k: ['1040', 'personal', 'individual', 'simple return', 'my taxes', 'price', 'cost', 'charge'],
    a: "A personal return starts at <strong>$750</strong>, which covers a straightforward 1040." +
       "<p>Common additions run <strong>$150 each</strong> — a rental property, a Schedule C side business, or more than five K-1s.</p>" +
       "<p>If you've got several of those stacking up, a monthly partnership usually works out better than paying per return.</p>",
    cta: true,
    chips: ['How much do you charge?', 'How do I become a client?']
  },
  {
    id: 'price-business',
    q: ['how much for a business return', 'cost of an s corp return', 'price for 1120s',
        'what do you charge businesses', 'business tax return cost'],
    k: ['business', '1120s', '1065', '1120', 'scorp', 'corporation', 'partnership', 'llc', 'price', 'cost', 'charge'],
    a: "A business return (1120-S, 1065 or 1120) starts at <strong>$1,250</strong> and includes one state." +
       "<p>Most business owners end up on a partnership instead — <strong>Tax Strategy</strong> from $229/month if you mainly need the returns and planning, or <strong>Full-service</strong> from $950/month if you want bookkeeping and payroll handled too.</p>",
    cta: true,
    chips: ['Do you do bookkeeping and payroll?', 'How do I become a client?']
  },
  {
    id: 'price-nil',
    q: ['how much does NIL tax help cost', 'NIL pricing', 'what do you charge athletes', 'NIL tiers cost'],
    k: ['nil', 'athlete', 'rookie', 'playmaker', 'all american', 'tier', 'tiers', 'price', 'cost', 'charge'],
    a: "Three tiers, scaled to what you're earning:" +
       "<ul><li><strong>Rookie — $125/month.</strong> NIL under $25k. Federal and home-state return, set-aside percentage, quarterly reminders.</li>" +
       "<li><strong>Playmaker — $250/month.</strong> NIL $25k–$75k. Adds quarterly estimates, a deduction tracker, a mid-year session and up to two states.</li>" +
       "<li><strong>All-American — $500/month.</strong> NIL above $75k. Adds entity and S-corp evaluation, payroll coordination, unlimited states, and coordination with your parents or agent.</li></ul>",
    cta: true,
    chips: ['Do I owe taxes on my NIL money?', 'How do I become a client?']
  },
  {
    id: 'price-bookkeeping',
    q: ['how much is bookkeeping', 'cost of a quickbooks cleanup', 'my books are a mess what does it cost',
        'bookkeeping cleanup price'],
    k: ['bookkeeping', 'books', 'quickbooks', 'cleanup', 'clean up', 'catch up', 'behind', 'messy', 'price', 'cost'],
    a: "Ongoing bookkeeping is bundled into the <strong>Full-service Business Owner Partnership</strong>, which starts at <strong>$950/month</strong>." +
       "<p>If you're behind and need a catch-up first, cleanups start at <strong>$1,500</strong> for the current year, and go to $3,500 for two years with a restructure, or $5,000 for three or more.</p>" +
       "<p>Being behind is extremely normal. We're not going to make you feel bad about it.</p>",
    cta: true,
    chips: ['Do you do bookkeeping and payroll?', 'How do I become a client?']
  },
  {
    id: 'price-specialty',
    q: ['how much is a cost segregation study', 'estate return cost', 'form 706 price', 'HOA review cost',
        'what do specialty projects cost'],
    k: ['cost segregation', 'cost seg', 'estate', '706', 'hoa', 'specialty', 'project', 'depreciation study'],
    a: "Our project work, with honest starting points:" +
       "<ul><li><strong>Cost segregation study</strong> — $4,500, scoped to the property</li>" +
       "<li><strong>Estate return (Form 706)</strong> — from $2,000, rising with the number of assets</li>" +
       "<li><strong>HOA financial statement review</strong> — $1,750</li></ul>" +
       "<p>These are all scoped on a call first — nobody should buy a cost seg study without knowing whether it'll pay for itself.</p>",
    cta: true,
    chips: ['How much do you charge?', 'How do I become a client?']
  },
  {
    id: 'price-consulting',
    q: ['do you do hourly consulting', 'what is your hourly rate', 'can I just ask a question',
        'one time consultation', 'can I pay for an hour of your time'],
    k: ['hourly', 'hour', 'consulting', 'consultation', 'rate', 'one time', 'onetime', 'advice', 'session'],
    a: "Yes. Tax and financial consulting is <strong>$300/hour</strong>, and it's a good fit if you've got a specific decision to make rather than an ongoing need." +
       "<p>If you find yourself booking those repeatedly, a Tax Strategy Partnership from $229/month includes the access and usually costs less.</p>" +
       "<p>The first 15-minute intro call is free.</p>",
    cta: true,
    chips: ['How do I become a client?', 'What services do you offer?']
  },

  /* ---------- SERVICES DETAIL ---------- */
  {
    id: 'bookkeeping-payroll',
    q: ['do you do bookkeeping', 'do you handle payroll', 'can you run payroll', 'can you do my books',
        'do you use quickbooks', 'bookkeeping and payroll services', 'monthly financials'],
    k: ['bookkeeping', 'books', 'payroll', 'quickbooks', 'qbo', 'gusto', 'financials', 'reconcile',
        'profit and loss', 'balance sheet', 'monthly'],
    a: "Yes to both, as part of our <strong>Full-service Business Owner Partnerships</strong>." +
       "<p>That covers monthly (or weekly, or daily) bookkeeping, bank and credit card reconciliation, monthly P&amp;L and balance sheet, payroll through Gusto, 1099s and AR aging — alongside the tax work.</p>" +
       "<p>Tiers run $950, $2,250 and $3,750/month depending on volume and how much advisory you want.</p>",
    cta: true,
    chips: ['How much is bookkeeping?', 'How do I become a client?']
  },
  {
    id: 'scorp',
    q: ['should I become an s corp', 'is an s corp right for me', 'can you do an s corp election',
        'would an s corp save me money', 'form 2553', 'LLC vs s corp'],
    k: ['scorp', 's corp', 'election', '2553', 'entity', 'llc', 'reasonable compensation', 'self employment tax',
        'should i', 'save money'],
    a: "We do handle S-corp elections, and it's one of the most common things we're asked about." +
       "<p>Whether it's right for you genuinely depends on your profit, what you'd pay yourself as reasonable compensation, your state, and how much admin you're willing to take on. It's a real analysis, not a rule of thumb — and the wrong answer here is expensive in both directions.</p>" +
       "<p>If the answer is yes, the election filing itself is <strong>$400</strong>. AZ will run the numbers with you on a call \u2014 bring last year's profit.</p>" +
       "<div class=\"azdt-nerdy\"><span class=\"azdt-nerdy-tag\">The nerdy stuff &middot; TLDR</span>" +
       "<p><strong>TLDR:</strong> an S corp can cut self-employment tax, but only above a certain profit level, and it adds payroll obligations.</p>" +
       "<p>The savings come from splitting your income between a salary (subject to employment taxes) and a distribution (not). The IRS requires that salary be <em>reasonable</em> — set it too low and the election becomes a liability rather than a saving.</p></div>",
    cta: true,
    chips: ['How much do you charge?', 'How do I become a client?']
  },
  {
    id: 'formation',
    q: ['can you set up my LLC', 'do you do business formation', 'how do I start a business',
        'registered agent', 'do you file articles of incorporation', 'dissolve my company'],
    k: ['formation', 'form an llc', 'llc', 'incorporate', 'incorporation', 'registered agent', 'start a business',
        'dissolution', 'dissolve', 'ein', 'new business'],
    a: "We advise on it and then hand the filing to vetted partners — that way you get the strategy from us without paying professional rates for paperwork." +
       "<p>We'll help you decide <strong>which entity and which state</strong>, then our Launch &amp; Compliance Concierge routes the formation, registered agent and state accounts through <strong>LegalZoom</strong>.</p>" +
       "<p>The entity decision is the part worth getting right, and that conversation is with us.</p>",
    cta: true,
    chips: ['Should I become an S corp?', 'How do I become a client?']
  },
  {
    id: 'prosperity',
    q: ['what is the prosperity playbook', 'do you have a course', 'financial education',
        'do you teach classes', 'can AZ speak at our event', 'speaking engagement'],
    k: ['prosperity', 'playbook', 'course', 'education', 'class', 'classes', 'workshop', 'cohort',
        'membership', 'speaking', 'speaker', 'keynote', 'teach'],
    a: "The <strong>Prosperity Playbook</strong> is our financial education program — a membership plus cohort-based coaching, built on the idea that financial literacy shouldn't be locked behind a professional fee." +
       "<p>AZ also speaks: keynotes, workshops and corporate trainings on tax and financial literacy.</p>" +
       "<p>Pricing on both is set case by case right now — get in touch and we'll talk through what you're looking for.</p>",
    cta: true,
    chips: ['How do I contact you?', 'What services do you offer?']
  },

  /* ---------- GETTING STARTED ---------- */
  {
    id: 'become-client',
    q: ['how do I become a client', 'how do I get started', 'I want to hire you', 'what is the onboarding process',
        'can we set up a call', 'do you offer a free consultation', 'next steps'],
    k: ['become', 'get started', 'getting started', 'start', 'hire', 'signup', 'sign up', 'onboard',
        'onboarding', 'consultation', 'consult', 'intro', 'call', 'meeting', 'book', 'schedule', 'new client'],
    a: "It starts with a <strong>free 15-minute call</strong>. AZ will ask about your situation, tell you straight whether we're a good fit, and price the engagement." +
       "<p>From there: you get a quote that doubles as the engagement letter, you e-sign it, and Teresa gets you set up in the client portal with a document list.</p>" +
       "<p>No long sales process. We either fit or we'll point you somewhere that does.</p>",
    cta: true,
    chips: ['How much do you charge?', 'What do you need from me?']
  },
  {
    id: 'switching',
    q: ['I already have an accountant', 'can I switch to you', 'how do I change accountants',
        'do you take over from another firm', 'I am unhappy with my CPA'],
    k: ['switch', 'switching', 'change', 'already have', 'current accountant', 'another firm', 'transfer',
        'leave my cpa', 'unhappy'],
    a: "Switching is routine and easier than most people expect. We'll need your prior-year returns, and we usually review them as part of onboarding — it's common to find something worth amending." +
       "<p>You don't need to have an awkward conversation with your current accountant first. Plenty of clients tell them after everything's already in place.</p>" +
       "<p>Start with the free 15-minute call and we'll map out the handover.</p>",
    cta: true,
    chips: ['How do I become a client?', 'How much do you charge?']
  },
  {
    id: 'documents',
    q: ['what documents do you need from me', 'what do you need from me', 'what should I bring',
        'what paperwork do I need', 'document checklist', 'what do I need to send you',
        'what records do you need'],
    k: ['document', 'documents', 'paperwork', 'checklist', 'bring', 'send you', 'need from me',
        'provide', 'records', 'upload'],
    a: "Your exact list gets built for your situation \u2014 once you're on board we send a personalised organiser through <strong>Intuit Link</strong> that asks only for what applies to you." +
       "<p>Broadly, though, it comes down to three things:</p>" +
       "<ul><li><strong>Last year's return</strong>, if you're new to us</li>" +
       "<li><strong>Every tax form that arrived in the mail</strong> \u2014 anything starting with W-2, 1099, 1098, 1095 or K-1</li>" +
       "<li><strong>The things no form covers</strong> \u2014 childcare provider details, charitable giving, estimated payments you made, and your bank details for a refund</li></ul>" +
       "<p>Want the specifics?</p>",
    chips: ['What do you need for a personal return?', 'What do you need for a business return?', 'How do I become a client?']
  },
  {
    id: 'documents-individual',
    q: ['what do you need for a personal return', 'what documents for my 1040',
        'what do I send for my individual taxes', 'personal tax document list',
        'do I need to send my W-2', 'do I send you my 1099'],
    k: ['personal', 'individual', '1040', 'my own', 'w2', '1098', '1095', 'k1'],
    a: "The usual set for a personal return:" +
       "<ul><li><strong>Income:</strong> W-2s; 1099-INT, -DIV, -R, -MISC, -NEC, -G and -Q; SSA-1099 or RRB-1099; a consolidated 1099 or 1099-B from your broker; K-1s from partnerships, S corps, trusts or estates; W-2G for gambling winnings</li>" +
       "<li><strong>Deductions:</strong> 1098 mortgage interest; 1098-E student loan interest; 1098-T tuition; charitable contribution statements; 1095-A if you're on a marketplace plan; HSA or MSA distribution forms</li>" +
       "<li><strong>Rentals or a side business:</strong> income and expenses for each</li>" +
       "<li><strong>Details we'll ask you for:</strong> childcare provider name, address and SSN or EIN; estimated payments with dates and amounts; bank routing and account number if you want direct deposit</li></ul>" +
       "<p>Anything that doesn't fit a category, send it anyway \u2014 we'd rather see it.</p>",
    chips: ['What do you need for a business return?', 'How do I become a client?']
  },
  {
    id: 'documents-business',
    q: ['what do you need for a business return', 'what documents for my business taxes',
        'what do I send for my LLC', 'business tax document list'],
    k: ['business', 'llc', 'scorp', 'partnership', 'bookkeeping', 'quickbooks', 'statements', 'formation'],
    a: "For a business return we'll want:" +
       "<ul><li><strong>Financial statements</strong> \u2014 easiest is to add <a href=\"mailto:" + CONFIG.email + "\">" + CONFIG.email + "</a> to your QuickBooks account and we'll pull them ourselves</li>" +
       "<li><strong>Bank and credit card statements</strong> through year end, if you want us to reconcile</li>" +
       "<li><strong>Invoices for any assets</strong> you bought or disposed of during the year</li>" +
       "<li><strong>Formation documents</strong> \u2014 EIN, state of formation, ownership percentages</li>" +
       "<li><strong>Owner activity</strong> \u2014 total distributions taken and contributions made, per owner</li></ul>" +
       "<p>If partners joined or left during the year, we'll need their details and ownership percentages too.</p>",
    chips: ['What do you need for a personal return?', 'Do you do bookkeeping and payroll?']
  },
  {
    id: 'security',
    q: ['is my information secure', 'how do you protect my data', 'is the portal safe',
        'can I email you my documents', 'can I just email you my W-2', 'where do you store my documents'],
    k: ['secure', 'security', 'safe', 'privacy', 'private', 'data', 'protect', 'encrypted', 'confidential'],
    a: "Please don't email tax documents — email isn't a secure channel, and that goes for every firm, not just us." +
       "<p>Everything goes through the <a href=\"" + CONFIG.portalUrl + "\" target=\"_blank\" rel=\"noopener\">client portal</a>, which is built for exactly this: encrypted upload, encrypted storage, and a record of what was sent.</p>" +
       "<p>If you've already emailed something sensitive, let us know and we'll get it moved.</p>",
    chips: ["I can't log in to the portal", 'How do I become a client?']
  }
  ];

  /* ======================= DELIBERATE REFUSALS ===========================
     Questions we get a lot and will NOT answer from a script. The bot
     recognises them and routes to a human instead of guessing.
     ====================================================================== */
  var REFUSALS = [
    {
      id: 'payment-plan',
      q: ['can I set up a payment plan', 'I owe money and cannot pay', 'IRS installment agreement',
          'what if I cannot afford my tax bill', 'offer in compromise'],
      k: ['payment plan', 'installment', 'cannot pay', "can't pay", 'owe', 'afford', 'compromise', 'settle', 'debt'],
      a: "Yes, options exist — the IRS has several, and which one you qualify for depends on how much you owe and your circumstances." +
         "<p>I'd rather not guess at the thresholds. We prepare installment agreement requests for clients regularly, and AZ can tell you in a few minutes which route actually applies to you.</p>"
    },
    {
      id: 'specific-advice',
      q: ['can I deduct this', 'is this deductible', 'is my home office deductible', 'how much will I owe', 'what is my tax rate',
          'should I buy a vehicle for my business', 'can I write off my car', 'how much tax will I pay'],
      k: ['deduct', 'deductible', 'deduction', 'write off', 'writeoff', 'will I owe', 'my tax rate',
          'how much tax', 'should I buy', 'is it worth'],
      a: "That's a real tax question, and the honest answer is that it depends on facts I don't have — your entity, your income, your state and how you use the thing in question." +
         "<p>AZ reviews and signs off on every piece of tax advice this firm gives, and I'm not going to put words in his mouth. A 15-minute call will get you a straight answer.</p>"
    },
    {
      id: 'investment',
      q: ['should I invest in', 'what stocks should I buy', 'is crypto a good investment',
          'should I buy real estate', 'what should I do with my money', 'retirement advice'],
      k: ['invest', 'investment', 'stocks', 'crypto', 'bitcoin', 'portfolio', 'should i buy', 'market', 'returns'],
      a: "That's outside what we do. AZ Does Taxes is a tax firm — we're <strong>not a registered investment adviser or broker-dealer</strong>, and we don't give investment advice." +
         "<p>What we can do is tell you the <strong>tax consequences</strong> of something you're already considering, which is a genuinely useful second opinion to have before you act.</p>"
    }
  ];

  /* =======================================================================
     MATCHING ENGINE
     Nothing below needs editing to change what the bot says.
     ======================================================================= */

  var STOP = {};
  ('a an and are as at be been but by can cant cannot could did do does doing for from get got had has have ' +
   'how i id if ill im in into is it its just me my need of on or our should so some that the their them then ' +
   'there these they this to too us want was we were what when where which why will with would you your ' +
   'am are be please tell about would like know actually really basically exactly even still ' +
   'guys folks anyone anybody there here thing stuff').split(' ').forEach(function (w) { STOP[w] = 1; });

  /* Words that appear in nearly every question here and shouldn't drive a match. */
  var LOW_VALUE = { tax: 1, taxes: 1, return: 0, help: 1, question: 1, year: 1 };

  /* Multi-word normalisations applied before tokenising. */
  var PRE = [
    [/\bwhat do (you|u)( guys| all| folks)? do\b/g, ' services '],
    [/\bwhat do (you|u)( guys| all| folks)? offer\b/g, ' services offer '],
    [/\bhow much\b/g,                     ' price '],
    [/\bs[\s-]?corp(oration)?s?\b/g,      ' scorp '],
    [/\bc[\s-]?corp(oration)?s?\b/g,      ' ccorp '],
    [/\b1120[\s-]?s\b/g,                  ' scorp 1120s '],
    [/\b1120\b/g,                         ' ccorp 1120 '],
    [/\b1065\b/g,                         ' partnership 1065 '],
    [/\bw[\s-]?2s?\b/g,                   ' w2 '],
    [/\b1099s?\b/g,                       ' 1099 '],
    [/\bcost seg(regation)?\b/g,          ' costseg '],
    [/\bquick ?books\b/g,                 ' quickbooks '],
    [/\bwrite[\s-]?offs?\b/g,             ' deduct '],
    [/\bname,? image,? and likeness\b/g,  ' nil '],
    [/\bset[\s-]?up\b/g,                  ' setup '],
    [/\bsign[\s-]?(on|in)\b/g,            ' login '],
    [/\blog[\s-]?(on|in)\b/g,             ' login '],
    [/\bmulti[\s-]?state\b/g,             ' multistate state '],
    [/\breal person\b/g,                  ' human '],
    [/\bcpa\b/g,                          ' cpa '],
    [/\bdue date\b/g,                     ' due '],
    [/\bnon[\s-]?resident\b/g,            ' nonresident ']
  ];

  /* Single-token synonyms, applied after tokenising. */
  var SYN = {
    cost: 'price', costs: 'price', charge: 'price', charges: 'price', fee: 'price', fees: 'price',
    pricing: 'price', prices: 'price', expensive: 'price', quote: 'price', afford: 'price',
    deadline: 'due', deadlines: 'due', duedate: 'due', owing: 'owe', owed: 'owe',
    filing: 'file', filed: 'file', files: 'file', documents: 'document', docs: 'document',
    doc: 'document', paperwork: 'document', businesses: 'business', companies: 'business',
    company: 'business', clients: 'client', states: 'state', athletes: 'athlete',
    deductible: 'deduct', deductions: 'deduct', deduction: 'deduct', deducting: 'deduct',
    extensions: 'extension', extend: 'extension', extended: 'extension',
    bookkeeper: 'bookkeeping', books: 'bookkeeping', refunds: 'refund',
    signature: 'sign', signatures: 'sign', signing: 'sign', signed: 'sign',
    notices: 'notice', letters: 'letter', audited: 'audit', spouses: 'spouse',
    wife: 'spouse', husband: 'spouse', partner: 'spouse',
    located: 'location', city: 'location',
    invest: 'investment', investing: 'investment', investments: 'investment',
    consultation: 'consulting', consult: 'consulting', hourly: 'hour', hours: 'hour',
    portals: 'portal', payments: 'payment', paying: 'pay', paid: 'pay',
    starting: 'start', started: 'start', begin: 'start', hiring: 'hire',
    scheduling: 'schedule', booking: 'book', booked: 'book', meetings: 'meeting',
    secure: 'security', safety: 'security', safe: 'security', private: 'privacy',
    person: 'human', someone: 'human', somebody: 'human'
  };

  function normalise(s) {
    var t = ' ' + String(s).toLowerCase() + ' ';
    t = t.replace(/[‘’]/g, "'").replace(/[^a-z0-9']+/g, ' ');
    for (var i = 0; i < PRE.length; i++) t = t.replace(PRE[i][0], PRE[i][1]);
    return t.replace(/'/g, '').replace(/\s+/g, ' ').trim();
  }

  function tokenise(s) {
    var raw = normalise(s).split(' ');
    var out = [], seen = {};
    for (var i = 0; i < raw.length; i++) {
      var w = raw[i];
      if (!w || STOP[w]) continue;
      if (SYN[w]) w = SYN[w];
      /* plural fallback for words we didn't map explicitly */
      else if (w.length > 4 && w.charAt(w.length - 1) === 's' && w.slice(-2) !== 'ss') w = w.slice(0, -1);
      if (STOP[w] || seen[w]) continue;
      seen[w] = 1;
      out.push(w);
    }
    return out;
  }

  function weightOf(tok) { return LOW_VALUE.hasOwnProperty(tok) ? 0.3 : 1; }

  /* Build the search index once. */
  var INDEX = [];
  (function buildIndex() {
    function add(entry, kind) {
      var kw = {}, qw = {}, phrases = [];
      (entry.k || []).forEach(function (s) { tokenise(s).forEach(function (t) { kw[t] = 1; }); });
      (entry.q || []).forEach(function (s) {
        phrases.push(normalise(s));
        tokenise(s).forEach(function (t) { if (!kw[t]) qw[t] = 1; });
      });
      INDEX.push({ entry: entry, kind: kind, kw: kw, qw: qw, phrases: phrases });
    }
    KB.forEach(function (e) { add(e, 'answer'); });
    REFUSALS.forEach(function (e) { add(e, 'refusal'); });
  })();

  var ACCEPT = 0.34;   /* answer confidently */
  var SUGGEST = 0.17;  /* offer "did you mean" */

  function search(query) {
    var toks = tokenise(query);
    if (!toks.length) return [];
    var nq = normalise(query), budget = 0, i;
    for (i = 0; i < toks.length; i++) budget += 3 * weightOf(toks[i]);
    if (budget <= 0) return [];

    var results = [];
    for (i = 0; i < INDEX.length; i++) {
      var rec = INDEX[i], score = 0, j;
      for (j = 0; j < toks.length; j++) {
        var t = toks[j], w = weightOf(t);
        if (rec.kw[t]) score += 3 * w;
        else if (rec.qw[t]) score += 1 * w;
      }
      var conf = score / budget;

      /* phrase containment — a strong signal either direction */
      for (j = 0; j < rec.phrases.length; j++) {
        var p = rec.phrases[j];
        if (!p) continue;
        if (nq === p) { conf += 0.6; break; }
        if (p.length > 8 && (nq.indexOf(p) !== -1 || (nq.length > 8 && p.indexOf(nq) !== -1))) { conf += 0.3; break; }
      }
      if (conf > 0) results.push({ rec: rec, conf: Math.min(conf, 1.2) });
    }
    results.sort(function (a, b) { return b.conf - a.conf; });
    return results;
  }

  /* Tell the site's analytics what people are asking. Harmless if absent. */
  function track(event, detail) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: 'azdt_bot_' + event }, detail));
      window.dispatchEvent(new CustomEvent('azdt-bot:' + event, { detail: detail }));
    } catch (e) {}
  }

  /* =======================================================================
     STYLES — AZDT Brand Book 2025
     Blue Ribbon #0044F9 · Deep Koamaru #191772 · Riptide #77E8CA · Elm #1C806D
     Lives inside a shadow root, so the host site's CSS can't reach it and
     these rules can't leak out onto the site.
     ======================================================================= */
  var CSS = `
  :host{all:initial}
  *,*::before,*::after{box-sizing:border-box}

  :host{
    --blue-ribbon:#0044F9; --deep-koamaru:#191772; --riptide:#77E8CA; --elm:#1C806D;
    --white-lilac:#F0F4FF; --clear-day:#EEFFFA; --perano:#B3C5F6;
    --ink:#191772; --ink-soft:#4A4878; --ink-faint:#6E6C96;
    --paper:#FFFFFF; --paper-alt:#F0F4FF; --line:#DDE4F7;
    --accent:var(--blue-ribbon); --on-accent:#FFFFFF;
    --shadow:0 12px 40px rgba(25,23,114,.22), 0 2px 8px rgba(25,23,114,.10);
    --font:'Roboto',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
    --mono:'Roboto Mono',ui-monospace,'SF Mono',Menlo,monospace;
    --nerd:'Courier Prime',ui-monospace,Menlo,monospace;
  }
  @media (prefers-color-scheme:dark){
    :host(:not([data-theme="light"])){
      --ink:#EAEDFF; --ink-soft:#B9BFE6; --ink-faint:#8E93C0;
      --paper:#15142F; --paper-alt:#1E1C43; --line:#2E2C5C;
      --accent:#6C92FF; --deep-koamaru:#0D0C26;
      --shadow:0 12px 40px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.3);
    }
  }
  :host([data-theme="dark"]){
    --ink:#EAEDFF; --ink-soft:#B9BFE6; --ink-faint:#8E93C0;
    --paper:#15142F; --paper-alt:#1E1C43; --line:#2E2C5C;
    --accent:#6C92FF; --deep-koamaru:#0D0C26;
    --shadow:0 12px 40px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.3);
  }

  .wrap{position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:var(--font);
        display:flex;flex-direction:column;align-items:flex-end;gap:12px}

  /* ---- launcher ---- */
  .launch{all:unset;cursor:pointer;display:flex;align-items:center;gap:10px;
    background:var(--blue-ribbon);color:#fff;border-radius:999px;padding:14px 20px 14px 17px;
    box-shadow:var(--shadow);font:700 15px/1 var(--font);letter-spacing:-.01em;
    transition:transform .18s cubic-bezier(.2,.9,.3,1.3),box-shadow .18s}
  .launch:hover{transform:translateY(-2px) scale(1.02)}
  .launch:active{transform:translateY(0) scale(.98)}
  .launch:focus-visible{outline:3px solid var(--riptide);outline-offset:3px}
  .launch svg{width:22px;height:22px;flex:none}
  .launch[hidden]{display:none}
  .dot{position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;
       background:var(--riptide);border:2px solid var(--blue-ribbon)}
  .launch-in{position:relative;display:flex;align-items:center;gap:10px}

  /* ---- panel ---- */
  .panel{width:380px;max-width:calc(100vw - 32px);height:580px;max-height:calc(100vh - 110px);
    background:var(--paper);border-radius:18px;box-shadow:var(--shadow);overflow:hidden;
    display:flex;flex-direction:column;transform-origin:bottom right;
    animation:pop .22s cubic-bezier(.2,.9,.3,1.1)}
  .panel[hidden]{display:none}
  @keyframes pop{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.panel{animation:none}.launch{transition:none}}

  .head{background:var(--deep-koamaru);color:#fff;padding:16px 16px 14px;
        border-bottom:3px solid var(--riptide);display:flex;align-items:flex-start;gap:12px}
  .mark{width:38px;height:38px;border-radius:10px;background:var(--riptide);color:#191772;
        display:grid;place-items:center;font:900 15px/1 var(--font);flex:none;letter-spacing:-.03em}
  .head h2{margin:0;font:700 16px/1.25 var(--font);letter-spacing:-.015em}
  .head p{margin:3px 0 0;font:400 12.5px/1.35 var(--font);color:#C9D3FF}
  .head .spacer{flex:1}
  .x{all:unset;cursor:pointer;width:30px;height:30px;border-radius:8px;display:grid;place-items:center;
     color:#C9D3FF;flex:none}
  .x:hover{background:rgba(255,255,255,.12);color:#fff}
  .x:focus-visible{outline:2px solid var(--riptide);outline-offset:2px}
  .x svg{width:16px;height:16px}

  .log{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:18px 16px 8px;
       display:flex;flex-direction:column;gap:12px;background:var(--paper)}
  .log::-webkit-scrollbar{width:8px}
  .log::-webkit-scrollbar-thumb{background:var(--line);border-radius:8px}

  .msg{max-width:88%;font:400 14.5px/1.55 var(--font);color:var(--ink);
       animation:rise .25s cubic-bezier(.2,.9,.3,1.05) both}
  @keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.msg{animation:none}}
  .msg.bot{align-self:flex-start;background:var(--paper-alt);border:1px solid var(--line);
           border-radius:4px 16px 16px 16px;padding:12px 14px}
  .msg.me{align-self:flex-end;background:var(--accent);color:var(--on-accent);
          border-radius:16px 16px 4px 16px;padding:11px 14px;font-weight:500}
  .msg p{margin:.65em 0 0}
  .msg p:first-child{margin-top:0}
  .msg ul{margin:.6em 0 0;padding-left:1.15em}
  .msg li{margin:.3em 0}
  .msg a{color:var(--accent);font-weight:500;text-underline-offset:2px}
  .msg.me a{color:#fff}
  .msg strong{font-weight:700}

  /* the Nerdy Stuff treatment */
  .azdt-nerdy{margin:12px 0 0;padding:11px 12px;border:1px dashed var(--elm);border-radius:8px;
    background:var(--clear-day);font:400 13px/1.5 var(--nerd);color:#17313B}
  @media (prefers-color-scheme:dark){
    :host(:not([data-theme="light"])) .azdt-nerdy{background:#10261F;border-color:#3E8C7A;color:#CFEFE4}
  }
  :host([data-theme="dark"]) .azdt-nerdy{background:#10261F;border-color:#3E8C7A;color:#CFEFE4}
  .azdt-nerdy p{margin:.55em 0 0}
  .azdt-nerdy-tag{display:block;font:700 9.5px/1 var(--mono);letter-spacing:.17em;
    text-transform:uppercase;color:var(--elm);margin-bottom:7px}
  @media (prefers-color-scheme:dark){:host(:not([data-theme="light"])) .azdt-nerdy-tag{color:#77E8CA}}
  :host([data-theme="dark"]) .azdt-nerdy-tag{color:#77E8CA}

  .eyebrow{font:700 9.5px/1 var(--mono);letter-spacing:.17em;text-transform:uppercase;
           color:var(--ink-faint);align-self:flex-start;margin:4px 0 -4px}

  /* ---- chips ---- */
  .chips{display:flex;flex-wrap:wrap;gap:7px;align-self:flex-start;max-width:100%}
  .chip{all:unset;cursor:pointer;font:500 13px/1.3 var(--font);color:var(--accent);
    border:1.5px solid var(--perano);background:var(--paper);border-radius:999px;padding:8px 13px;
    transition:background .15s,border-color .15s}
  .chip:hover{background:var(--paper-alt);border-color:var(--accent)}
  .chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

  .cta{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;
    background:var(--accent);color:var(--on-accent);border-radius:10px;padding:11px 16px;
    font:700 14px/1 var(--font);align-self:flex-start;transition:filter .15s}
  .cta:hover{filter:brightness(1.1)}
  .cta:focus-visible{outline:2px solid var(--riptide);outline-offset:2px}
  .cta svg{width:14px;height:14px}

  /* ---- typing ---- */
  .typing{align-self:flex-start;display:flex;gap:4px;padding:14px;background:var(--paper-alt);
          border:1px solid var(--line);border-radius:4px 16px 16px 16px}
  .typing i{width:6px;height:6px;border-radius:50%;background:var(--ink-faint);
            animation:bob 1.1s infinite ease-in-out}
  .typing i:nth-child(2){animation-delay:.16s}
  .typing i:nth-child(3){animation-delay:.32s}
  @keyframes bob{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}

  /* ---- composer ---- */
  .foot{border-top:1px solid var(--line);background:var(--paper);padding:10px 12px 8px}
  .row{display:flex;gap:8px;align-items:flex-end}
  .ta{flex:1;resize:none;border:1.5px solid var(--line);border-radius:12px;padding:11px 13px;
    font:400 14.5px/1.45 var(--font);color:var(--ink);background:var(--paper);max-height:96px;
    min-height:42px;outline:none;transition:border-color .15s}
  .ta::placeholder{color:var(--ink-faint)}
  .ta:focus{border-color:var(--accent)}
  .send{all:unset;cursor:pointer;width:42px;height:42px;flex:none;border-radius:12px;
    background:var(--accent);color:var(--on-accent);display:grid;place-items:center;transition:filter .15s}
  .send:hover{filter:brightness(1.1)}
  .send:disabled{opacity:.4;cursor:default}
  .send:focus-visible{outline:2px solid var(--riptide);outline-offset:2px}
  .send svg{width:18px;height:18px}

  .legal{margin:8px 2px 2px;font:400 10.5px/1.45 var(--font);color:var(--ink-faint)}
  .legal a{color:var(--ink-faint)}

  .sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
      clip:rect(0,0,0,0);white-space:nowrap;border:0}

  @media (max-width:480px){
    .wrap{right:12px;bottom:12px;left:12px;align-items:stretch}
    .panel{width:auto;height:min(76vh,580px)}
    .launch{align-self:flex-end}
  }
  `;

  /* =======================================================================
     UI
     ======================================================================= */
  var ICON = {
    chat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-.9L3 21l1.9-4.6A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    send:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  function loadFonts() {
    if (document.getElementById('azdt-bot-fonts')) return;
    var pre = document.createElement('link');
    pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = '';
    document.head.appendChild(pre);
    var l = document.createElement('link');
    l.id = 'azdt-bot-fonts';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Mono:wght@700&family=Courier+Prime:wght@400;700&display=swap';
    document.head.appendChild(l);
  }

  var host, root, els = {}, state = { open: false, busy: false, log: [] };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function scroll() { requestAnimationFrame(function () { els.log.scrollTop = els.log.scrollHeight; }); }

  function save() {
    try { sessionStorage.setItem('azdt-bot-log', JSON.stringify(state.log.slice(-40))); } catch (e) {}
  }

  /* Answers are authored as "lead text" + <p>/<ul> blocks. Wrap that lead text so the
     first-child margin rule lands on the real first paragraph. */
  function wrapLead(html) {
    var i = html.search(/<(p|ul|ol|div)[\s>]/);
    if (i === 0) return html;
    if (i < 0) return '<p>' + html + '</p>';
    return '<p>' + html.slice(0, i) + '</p>' + html.slice(i);
  }

  function addMsg(who, html, remember) {
    if (who === 'bot') html = wrapLead(html);
    var n = el('div', 'msg ' + who, html);
    els.log.appendChild(n);
    if (remember !== false) { state.log.push({ w: who, h: html }); save(); }
    scroll();
    return n;
  }

  function clearInteractive() {
    Array.prototype.slice.call(els.log.querySelectorAll('.chips,.cta,.eyebrow'))
      .forEach(function (n) { n.remove(); });
  }

  function addChips(list, eyebrow) {
    if (!list || !list.length) return;
    if (eyebrow) els.log.appendChild(el('span', 'eyebrow', eyebrow));
    var box = el('div', 'chips');
    list.forEach(function (text) {
      var b = el('button', 'chip', text);
      b.type = 'button';
      b.addEventListener('click', function () { clearInteractive(); submit(text); });
      box.appendChild(b);
    });
    els.log.appendChild(box);
    scroll();
  }

  function addCta() {
    var a = el('a', 'cta', CONFIG.bookingText + ICON.arrow);
    a.href = CONFIG.bookingUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', function () { track('booking_click', {}); });
    els.log.appendChild(a);
    scroll();
  }

  function typing(on) {
    var t = els.log.querySelector('.typing');
    if (on) {
      if (t) return;
      els.log.appendChild(el('div', 'typing', '<i></i><i></i><i></i>'));
      scroll();
    } else if (t) { t.remove(); }
  }

  /* Reply length drives the pause — it should feel like reading, not loading. */
  function reply(html, after) {
    state.busy = true;
    els.send.disabled = true;
    typing(true);
    var ms = Math.min(1100, 320 + html.length * 0.9);
    setTimeout(function () {
      typing(false);
      addMsg('bot', html);
      state.busy = false;
      els.send.disabled = false;
      if (after) after();
    }, ms);
  }

  var HANDOFF =
    "I don't have a confident answer for that one, and I'd rather point you to a human than guess." +
    "<p>Email <a href=\"mailto:" + CONFIG.email + "\">" + CONFIG.email + "</a>, call " +
    "<a href=\"tel:" + CONFIG.phone.replace(/-/g, '') + "\">" + CONFIG.phone + "</a>, or grab 15 minutes with AZ below.</p>";

  function submit(text) {
    text = String(text || '').trim();
    if (!text || state.busy) return;
    clearInteractive();
    addMsg('me', escapeHtml(text));
    els.ta.value = '';
    els.ta.style.height = 'auto';

    var hits = search(text);
    var best = hits[0];

    if (best && best.conf >= ACCEPT) {
      var e = best.rec.entry;
      track('answered', { query: text, matched: e.id, confidence: Math.round(best.conf * 100) / 100 });
      reply(e.a, function () {
        if (e.cta || best.rec.kind === 'refusal') addCta();
        addChips(e.chips && e.chips.length ? e.chips
                 : ['How do I become a client?', 'How much do you charge?'],
                 e.chips ? 'Related' : 'Or ask about');
      });
      return;
    }

    /* Near misses — offer them rather than dead-ending. */
    var near = hits.filter(function (h) { return h.conf >= SUGGEST; }).slice(0, 3);
    if (near.length) {
      track('suggested', { query: text, candidates: near.map(function (h) { return h.rec.entry.id; }) });
      reply("I'm not certain I've got that one. Did you mean any of these?", function () {
        addChips(near.map(function (h) { return h.rec.entry.q[0]; }));
        addChips(['Talk to a human instead'], 'Otherwise');
      });
      return;
    }

    track('unanswered', { query: text });
    reply(HANDOFF, function () {
      addCta();
      addChips(['What services do you offer?', 'How much do you charge?', 'How do I become a client?'], 'Or try');
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function greet() {
    addMsg('bot', CONFIG.greeting);
    addMsg('bot', CONFIG.greeting2);
    addChips(ROUTES.map(function (r) { return r.label; }), 'Pick one');
  }

  /* Route labels aren't questions — they open a sub-menu instead. */
  var ROUTE_BY_LABEL = {};
  ROUTES.forEach(function (r) { ROUTE_BY_LABEL[r.label] = r; });

  var _submit = submit;
  submit = function (text) {
    var r = ROUTE_BY_LABEL[String(text || '').trim()];
    if (r && !state.busy) {
      clearInteractive();
      addMsg('me', escapeHtml(text));
      track('route', { route: r.label });
      reply('Got it. Here are the questions I get asked most by ' + r.who +
            ' — or just type your own.', function () { addChips(r.ask); });
      return;
    }
    if (String(text).trim() === 'Talk to a human instead') {
      clearInteractive();
      addMsg('me', escapeHtml(text));
      reply(HANDOFF, function () { addCta(); });
      return;
    }
    _submit(text);
  };

  function open() {
    if (state.open) return;
    state.open = true;
    els.panel.hidden = false;
    els.launch.hidden = true;
    if (!state.log.length) greet();
    setTimeout(function () { els.ta.focus(); }, 60);
    track('open', {});
  }

  function close() {
    state.open = false;
    els.panel.hidden = true;
    els.launch.hidden = false;
    els.launch.focus();
  }

  function build() {
    loadFonts();
    host = document.createElement('div');
    host.id = 'azdt-bot';
    document.body.appendChild(host);
    root = host.attachShadow({ mode: 'open' });
    root.appendChild(el('style', null, CSS));

    var wrap = el('div', 'wrap');

    els.panel = el('div', 'panel');
    els.panel.setAttribute('role', 'dialog');
    els.panel.setAttribute('aria-label', CONFIG.botName);
    els.panel.hidden = true;

    var head = el('div', 'head');
    head.appendChild(el('div', 'mark', 'AZ'));
    var ht = el('div');
    ht.appendChild(el('h2', null, CONFIG.botName));
    ht.appendChild(el('p', null, 'Answers from the AZ Does Taxes team'));
    head.appendChild(ht);
    head.appendChild(el('div', 'spacer'));
    var x = el('button', 'x', ICON.close);
    x.type = 'button';
    x.setAttribute('aria-label', 'Close chat');
    x.addEventListener('click', close);
    head.appendChild(x);
    els.panel.appendChild(head);

    els.log = el('div', 'log');
    els.log.setAttribute('role', 'log');
    els.log.setAttribute('aria-live', 'polite');
    els.panel.appendChild(els.log);

    var foot = el('div', 'foot');
    var row = el('div', 'row');
    els.ta = el('textarea', 'ta');
    els.ta.rows = 1;
    els.ta.placeholder = 'Ask a question…';
    els.ta.setAttribute('aria-label', 'Type your question');
    els.ta.addEventListener('input', function () {
      els.ta.style.height = 'auto';
      els.ta.style.height = Math.min(els.ta.scrollHeight, 96) + 'px';
    });
    function onKey(ev) {
      if ((ev.key === 'Enter' || ev.keyCode === 13) && !ev.shiftKey && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        ev.stopPropagation();
        submit(els.ta.value);
      }
    }
    els.ta.addEventListener('keydown', onKey);
    els.ta.addEventListener('keypress', function (ev) {
      if (ev.key === 'Enter' || ev.keyCode === 13) ev.preventDefault();
    });
    els.send = el('button', 'send', ICON.send);
    els.send.type = 'button';
    els.send.setAttribute('aria-label', 'Send');
    els.send.addEventListener('click', function () { submit(els.ta.value); });
    row.appendChild(els.ta);
    row.appendChild(els.send);
    foot.appendChild(row);
    foot.appendChild(el('p', 'legal', CONFIG.disclaimer));
    els.panel.appendChild(foot);

    els.launch = el('button', 'launch',
      '<span class="launch-in">' + ICON.chat + '<span>' + CONFIG.botName + '</span><span class="dot"></span></span>');
    els.launch.type = 'button';
    els.launch.setAttribute('aria-label', 'Open ' + CONFIG.botName);
    els.launch.addEventListener('click', open);

    wrap.appendChild(els.panel);
    wrap.appendChild(els.launch);
    root.appendChild(wrap);

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && state.open) close();
    });

    /* restore an in-progress conversation across page navigation */
    try {
      var saved = JSON.parse(sessionStorage.getItem('azdt-bot-log') || '[]');
      if (saved.length) {
        state.log = saved;
        saved.forEach(function (m) { addMsg(m.w, m.h, false); });
        addChips(['What services do you offer?', 'How much do you charge?', 'Talk to a human instead'], 'Pick up where you left off');
      }
    } catch (e) {}

    if (CONFIG.openOnFirstVisit) {
      try {
        if (!sessionStorage.getItem('azdt-bot-seen')) {
          sessionStorage.setItem('azdt-bot-seen', '1');
          setTimeout(function () { if (!state.open) open(); }, CONFIG.openDelayMs);
        }
      } catch (e) {}
    }
  }

  /* Public hooks, in case you want a page button to open the bot:
     AZDTBot.open()  /  AZDTBot.ask('How much do you charge?')  */
  window.AZDTBot = {
    open: function () { open(); },
    close: close,
    ask: function (q) { open(); setTimeout(function () { submit(q); }, 200); },
    search: search,
    config: CONFIG
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
