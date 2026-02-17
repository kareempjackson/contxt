export default function DashboardActivity() {
  const activities = [
    {
      type: 'push',
      title: 'Pushed 3 entries to my-saas-app',
      description: '1 decision, 1 pattern, 1 context',
      timestamp: '2 hours ago',
      color: '#0A84FF',
    },
    {
      type: 'session',
      title: 'Session ended: Stripe webhook implementation',
      description: '42 minutes · my-saas-app',
      timestamp: '3 hours ago',
      color: '#FF453A',
    },
    {
      type: 'branch',
      title: 'Created branch experiment/cache-optimization',
      description: 'contxt',
      timestamp: '5 hours ago',
      color: '#64D2FF',
    },
    {
      type: 'push',
      title: 'Pushed 2 entries to access-audit',
      description: '1 decision, 1 document',
      timestamp: '6 hours ago',
      color: '#0A84FF',
    },
    {
      type: 'project',
      title: 'New project initialized',
      description: 'procur-api',
      timestamp: '1 day ago',
      color: '#BF5AF2',
    },
    {
      type: 'session',
      title: 'Session ended: Database migration',
      description: '1 hour 18 minutes · contxt',
      timestamp: '1 day ago',
      color: '#FF453A',
    },
    {
      type: 'push',
      title: 'Pushed 5 entries to contxt',
      description: '2 decisions, 2 patterns, 1 session',
      timestamp: '2 days ago',
      color: '#0A84FF',
    },
    {
      type: 'branch',
      title: 'Merged branch feature/mcp-integration',
      description: 'my-saas-app',
      timestamp: '2 days ago',
      color: '#64D2FF',
    },
  ];

  return (
    <>
      {/* Page Top */}
      <div className="mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px] mb-6">Activity</h1>

        {/* Tabs */}
        <div className="inline-flex items-center gap-1 p-1 bg-black/[0.035] rounded-[10px]">
          <button className="h-8 px-4 text-[13px] font-semibold text-text-0 bg-white rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all">
            All
          </button>
          <button className="h-8 px-4 text-[13px] font-medium text-text-2 hover:text-text-1 rounded-[8px] transition-all">
            Pushes
          </button>
          <button className="h-8 px-4 text-[13px] font-medium text-text-2 hover:text-text-1 rounded-[8px] transition-all">
            Sessions
          </button>
        </div>
      </div>

      <div className="text-[12.5px] text-text-2 mb-4">Last 7 days</div>

      {/* Activity Feed */}
      <div className="space-y-0.5">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] cursor-pointer hover:bg-black/[0.028] transition-all"
          >
            {/* Indicator Dot */}
            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: activity.color }}></span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-text-0 mb-0.5">{activity.title}</div>
              <div className="text-[12px] text-text-2">{activity.description}</div>
            </div>

            {/* Timestamp */}
            <span className="font-mono text-[10.5px] text-text-3 min-w-[60px] text-right">{activity.timestamp}</span>
          </div>
        ))}
      </div>
    </>
  );
}
