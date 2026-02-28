export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight text-text-0 mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-3 mb-12">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-10 text-text-1 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">1. What We Collect</h2>
            <p>
              We collect only what is necessary to operate the Service: your email address (via GitHub OAuth), project context and memory data you explicitly push, and basic usage metadata (e.g., sync timestamps).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">2. How We Use It</h2>
            <p>
              Your data is used solely to power Contxt — storing, syncing, and retrieving your context across sessions and devices. We do not sell your data or use it to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">3. Data Storage</h2>
            <p>
              Data is stored in Supabase (PostgreSQL + pgvector) on infrastructure hosted in the United States. We use industry-standard encryption in transit (TLS) and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">4. Third-Party Services</h2>
            <p>
              We use the following third-party services to operate Contxt:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-text-2">
              <li>Supabase — database and authentication</li>
              <li>GitHub — OAuth login</li>
              <li>OpenAI — embedding generation for semantic search</li>
            </ul>
            <p className="mt-3">
              Each service operates under its own privacy policy. We share only the minimum data required for each integration to function.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">5. Your Rights</h2>
            <p>
              You can export or delete all your data at any time from the dashboard settings page. Deleting your account permanently removes all stored context and memories from our systems within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">6. Cookies</h2>
            <p>
              We use session cookies for authentication only. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this policy as the Service evolves. We will notify you of material changes via the email associated with your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">8. Contact</h2>
            <p>
              Privacy questions or requests? Contact us at{' '}
              <a href="mailto:hello@ghostsavvy.com" className="text-text-0 underline underline-offset-2">
                hello@ghostsavvy.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <a href="/" className="text-sm text-text-3 hover:text-text-0 transition-colors">← Back to home</a>
        </div>
      </div>
    </div>
  );
}
