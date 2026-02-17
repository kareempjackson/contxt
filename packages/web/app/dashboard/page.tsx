export default function DashboardProjects() {
  const projects = [
    {
      name: 'my-saas-app',
      entries: 29,
      branch: 'main',
      synced: '2m ago',
      tokens: 3840,
      stack: ['Next.js', 'Prisma', 'Postgres', 'Stripe'],
      active: true,
    },
    {
      name: 'access-audit',
      entries: 18,
      branch: 'main',
      synced: '18m ago',
      tokens: 2140,
      stack: ['Next.js', 'Supabase', 'Puppeteer'],
      active: true,
    },
    {
      name: 'contxt',
      entries: 42,
      branch: 'main',
      synced: '5m ago',
      tokens: 5620,
      stack: ['TypeScript', 'Supabase', 'MCP'],
      active: true,
    },
    {
      name: 'procur-api',
      entries: 11,
      branch: 'main',
      synced: '3d ago',
      tokens: 1280,
      stack: ['Node.js', 'Express', 'MongoDB'],
      active: false,
    },
  ];

  return (
    <>
      {/* Page Top */}
      <div className="flex items-center justify-between mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Projects</h1>
        <button className="h-9 px-4 flex items-center justify-center gap-2 rounded-[9px] bg-blue text-white font-semibold text-[13px] hover:bg-[#0070E0] transition-all shadow-[0_1px_3px_rgba(10,132,255,0.2)] hover:shadow-[0_3px_12px_rgba(10,132,255,0.25)]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New project
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
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
            placeholder="Search projects…"
            className="w-full h-10 px-3.5 pl-[38px] text-[13px] text-text-0 bg-white border-none rounded-[10px] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.03),0_0_1px_rgba(0,0,0,0.04)] transition-shadow focus:shadow-[0_0_0_3px_rgba(10,132,255,0.1),0_1px_3px_rgba(0,0,0,0.03)] placeholder:text-text-3"
          />
        </div>
        <button className="h-10 px-3.5 flex items-center gap-2 text-[12.5px] font-medium text-text-2 bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
          <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </button>
        <button className="h-10 px-3.5 flex items-center gap-2 text-[12.5px] font-medium text-text-2 bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
          <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort
        </button>
      </div>

      <div className="text-[12.5px] text-text-2 mb-4">Showing 4 projects</div>

      {/* Project Cards */}
      <div className="space-y-2">
        {projects.map((project) => (
          <a
            key={project.name}
            href={`/dashboard/project/${project.name}`}
            className="block bg-white rounded-[14px] p-6 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[15px] font-bold text-blue tracking-[-0.2px]">{project.name}</span>
              <span
                className={`w-[7px] h-[7px] rounded-full ${project.active ? 'bg-green' : 'bg-text-3'}`}
              ></span>
              <div className="ml-auto flex items-center gap-2">
                <button className="h-8 px-3 text-[12.5px] font-semibold bg-white text-text-1 rounded-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
                  Connect
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-3 hover:bg-black/[0.028] hover:text-text-1 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-text-2 mb-4">
              <span>
                <strong className="font-semibold text-text-1">Entries</strong> {project.entries}
              </span>
              <span>
                <strong className="font-semibold text-text-1">Branch</strong> {project.branch}
              </span>
              <span>
                <strong className="font-semibold text-text-1">Synced</strong> {project.synced}
              </span>
              <span>
                <strong className="font-semibold text-text-1">Tokens</strong> {project.tokens.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10.5px] font-medium px-2.5 py-1 rounded-full bg-black/[0.035] text-text-2"
                >
                  {tech}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
