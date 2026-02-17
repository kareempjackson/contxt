export default function ProjectPage({ params }: { params: { slug: string } }) {
  const projectName = params.slug;

  const projectData = {
    branch: 'main',
    syncedAt: '2m ago',
    entriesCount: 29,
    tokensCount: 3840,
    stack: ['Next.js', 'Prisma', 'Postgres'],
  };

  const entries = [
    {
      type: 'decision',
      title: 'Use Stripe for billing',
      description: 'Stripe over Paddle — better API, webhook reliability, global coverage.',
      version: 'v3',
      timestamp: '2h ago',
    },
    {
      type: 'decision',
      title: 'Use Prisma over Drizzle',
      description: 'Better TypeScript support, more mature migration system.',
      version: 'v1',
      timestamp: '5d ago',
    },
    {
      type: 'decision',
      title: 'JWT + httpOnly cookies for auth',
      description: 'Stateless auth with JWTs in httpOnly cookies. Refresh token rotation.',
      version: 'v3',
      timestamp: '1d ago',
    },
    {
      type: 'decision',
      title: 'Webhook signature verification',
      description: 'All incoming webhooks must verify signatures before processing.',
      version: 'v1',
      timestamp: '3d ago',
    },
    {
      type: 'pattern',
      title: 'API route: Zod → handler → response',
      description: 'Parse with Zod schema, pass to handler, return typed response.',
      version: 'v2',
      timestamp: '1d ago',
    },
    {
      type: 'pattern',
      title: 'API error handler with retry logic',
      description: 'Centralized error handler. Retries with exponential backoff.',
      version: 'v1',
      timestamp: '4d ago',
    },
    {
      type: 'pattern',
      title: 'Event-driven service pattern',
      description: 'Services communicate via typed events. EventBus dispatches async.',
      version: 'v1',
      timestamp: '6d ago',
    },
    {
      type: 'context',
      title: 'Building: user onboarding flow',
      description: 'Multi-step onboarding. Blocker: Stripe webhook integration.',
      version: 'v5',
      timestamp: '2h ago',
    },
    {
      type: 'document',
      title: 'API spec v2 — endpoints & auth',
      description: 'Complete REST API docs — endpoints, schemas, auth flow.',
      version: 'v1',
      timestamp: '3d ago',
    },
    {
      type: 'document',
      title: 'Deployment runbook',
      description: 'Vercel preview → staging → prod. Env vars, migration order.',
      version: 'v2',
      timestamp: '1w ago',
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
      case 'document':
        return 'bg-teal-soft text-teal-mute';
      case 'session':
        return 'bg-rose-soft text-rose';
      default:
        return 'bg-black/[0.035] text-text-2';
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] mb-4 mt-1">
        <a href="/dashboard" className="text-text-2 hover:text-text-0 transition-colors">
          Projects
        </a>
        <span className="text-text-3">/</span>
        <span className="text-text-0 font-semibold">{projectName}</span>
      </div>

      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-bold tracking-[-0.6px]">{projectName}</h1>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/[0.035] rounded-md">
              <svg className="w-3 h-3 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="font-mono text-[11px] font-medium text-text-2">{projectData.branch}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 flex items-center gap-2 text-[13px] font-medium text-text-2 bg-white rounded-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
              <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Branches
            </button>
            <button className="h-9 px-4 flex items-center gap-2 text-[13px] font-medium text-text-2 bg-white rounded-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
              <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button className="h-9 px-4 flex items-center gap-2 text-[13px] font-semibold text-white bg-blue rounded-[9px] shadow-[0_1px_3px_rgba(10,132,255,0.2)] hover:shadow-[0_3px_12px_rgba(10,132,255,0.25)] hover:bg-[#0070E0] transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add entry
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="flex items-center gap-3 text-[13px] text-text-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-[6px] h-[6px] rounded-full bg-green"></span>
            <span>Synced {projectData.syncedAt}</span>
          </div>
          <span>·</span>
          <span>{projectData.entriesCount} entries</span>
          <span>·</span>
          <span>{projectData.tokensCount.toLocaleString()} tokens</span>
        </div>

        {/* Stack Tags */}
        <div className="flex gap-2 flex-wrap">
          {projectData.stack.map((tech) => (
            <span key={tech} className="font-mono text-[11px] font-medium px-2 py-1 rounded-md bg-black/[0.035] text-text-2">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        <button className="h-10 px-4 text-[13.5px] font-semibold text-text-0 border-b-2 border-blue -mb-[1px] transition-colors">
          Memory <span className="ml-1.5 font-mono text-[11px] text-text-3">29</span>
        </button>
        <button className="h-10 px-4 text-[13.5px] font-medium text-text-2 hover:text-text-0 transition-colors">
          Branches <span className="ml-1.5 font-mono text-[11px] text-text-3">3</span>
        </button>
        <button className="h-10 px-4 text-[13.5px] font-medium text-text-2 hover:text-text-0 transition-colors">
          Sessions <span className="ml-1.5 font-mono text-[11px] text-text-3">12</span>
        </button>
        <button className="h-10 px-4 text-[13.5px] font-medium text-text-2 hover:text-text-0 transition-colors">
          History
        </button>
        <button className="h-10 px-4 text-[13.5px] font-medium text-text-2 hover:text-text-0 transition-colors">
          Settings
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6">
        <button className="h-8 px-3.5 text-[12.5px] font-semibold text-white bg-bg-dark rounded-full transition-all">
          All
        </button>
        <button className="h-8 px-3.5 text-[12.5px] font-medium text-blue bg-white border border-border rounded-full hover:bg-blue-soft transition-all">
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-blue mr-1.5"></span>
          Decisions
        </button>
        <button className="h-8 px-3.5 text-[12.5px] font-medium text-[#A855F7] bg-white border border-border rounded-full hover:bg-violet-soft transition-all">
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#A855F7] mr-1.5"></span>
          Patterns
        </button>
        <button className="h-8 px-3.5 text-[12.5px] font-medium text-[#CC7700] bg-white border border-border rounded-full hover:bg-amber-soft transition-all">
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#CC7700] mr-1.5"></span>
          Context
        </button>
        <button className="h-8 px-3.5 text-[12.5px] font-medium text-teal-mute bg-white border border-border rounded-full hover:bg-teal-soft transition-all">
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-teal-mute mr-1.5"></span>
          Docs
        </button>
        <button className="h-8 px-3.5 text-[12.5px] font-medium text-rose bg-white border border-border rounded-full hover:bg-rose-soft transition-all">
          <span className="inline-block w-[6px] h-[6px] rounded-full bg-rose mr-1.5"></span>
          Sessions
        </button>
      </div>

      {/* Entries List */}
      <div>
        {entries.map((entry, index) => (
          <a
            key={index}
            href={`/dashboard/entry/${index}`}
            className="grid grid-cols-[80px_1fr_auto_auto] items-center gap-3 px-3.5 py-3 rounded-[10px] cursor-pointer hover:bg-black/[0.028] transition-all"
          >
            {/* Badge */}
            <span
              className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.3px] px-2 py-1 rounded-full text-center ${getBadgeColor(entry.type)}`}
            >
              {entry.type}
            </span>

            {/* Content */}
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-text-0 truncate mb-0.5">{entry.title}</div>
              <div className="text-[12px] text-text-2 truncate">{entry.description}</div>
            </div>

            {/* Version */}
            <span className="font-mono text-[11px] text-text-3 min-w-[30px] text-right">{entry.version}</span>

            {/* Timestamp */}
            <span className="font-mono text-[10.5px] text-text-3 min-w-[50px] text-right">{entry.timestamp}</span>
          </a>
        ))}
      </div>
    </>
  );
}
