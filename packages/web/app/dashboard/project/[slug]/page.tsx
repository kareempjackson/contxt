import { redirect } from 'next/navigation';

// Redirect old singular /dashboard/project/[slug] → /dashboard/projects/[slug]
export default async function ProjectPageLegacy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/dashboard/projects/${slug}`);
}
