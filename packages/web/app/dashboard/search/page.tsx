export default function DashboardSearch() {
  const searchResults = [
    {
      score: 0.94,
      type: 'decision',
      title: 'Use Stripe for billing',
      description: 'Stripe over Paddle — better API, webhook reliability.',
      project: 'my-saas-app',
    },
    {
      score: 0.82,
      type: 'decision',
      title: 'Webhook signature verification',
      description: 'All incoming webhooks must verify signatures.',
      project: 'my-saas-app',
    },
    {
      score: 0.71,
      type: 'pattern',
      title: 'Payment service abstraction',
      description: 'All payment logic behind IPaymentProvider.',
      project: 'access-audit',
    },
    {
      score: 0.65,
      type: 'context',
      title: 'Building: user onboarding flow',
      description: 'Blocker: Stripe webhook integration.',
      project: 'my-saas-app',
    },
    {
      score: 0.58,
      type: 'session',
      title: 'Feb 15 — Stripe webhook handlers',
      description: 'Implemented subscription webhooks.',
      project: 'my-saas-app',
    },
  ];

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'decision':
        return 'bg-blue-soft text-blue';
      case 'pattern':
        return 'bg-violet-soft text-[#A855F7]';
      case 'context':
        return 'bg-amber-soft text-[#CC7700]';
      case 'doc':
        return 'bg-teal-soft text-teal-mute';
      case 'session':
        return 'bg-rose-soft text-rose';
      default:
        return 'bg-black/[0.035] text-text-2';
    }
  };

  return (
    <>
      {/* Page Top */}
      <div className="mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px] mb-6">Search</h1>

        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-3 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            defaultValue="why did we pick Stripe"
            className="w-full h-10 px-3.5 pl-[38px] text-[13px] text-text-0 bg-white border-none rounded-[10px] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.03),0_0_1px_rgba(0,0,0,0.04)] transition-shadow focus:shadow-[0_0_0_3px_rgba(10,132,255,0.1),0_1px_3px_rgba(0,0,0,0.03)] placeholder:text-text-3"
          />
        </div>
      </div>

      <div className="text-[12.5px] text-text-2 mb-4">5 results across 2 projects</div>

      {/* Search Results */}
      <div>
        {searchResults.map((result, index) => (
          <a
            key={index}
            href={`/dashboard/entry/${index}`}
            className="grid grid-cols-[38px_80px_1fr_auto] items-center gap-3 px-3.5 py-3 rounded-[10px] cursor-pointer hover:bg-black/[0.028] transition-all"
          >
            {/* Score */}
            <span className="font-mono text-[11.5px] font-bold text-[#248A3D]">{result.score.toFixed(2)}</span>

            {/* Badge */}
            <span
              className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.3px] px-2 py-1 rounded-full text-center ${getBadgeColor(result.type)}`}
            >
              {result.type}
            </span>

            {/* Content */}
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-text-0 truncate mb-0.5">{result.title}</div>
              <div className="text-[12px] text-text-2 truncate">{result.description}</div>
            </div>

            {/* Project */}
            <span className="font-mono text-[10.5px] text-text-3 min-w-[80px] text-right">{result.project}</span>
          </a>
        ))}
      </div>
    </>
  );
}
