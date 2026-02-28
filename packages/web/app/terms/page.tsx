export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight text-text-0 mb-2">Terms of Service</h1>
        <p className="text-sm text-text-3 mb-12">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-10 text-text-1 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Contxt ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">2. Use of the Service</h2>
            <p>
              You may use Contxt for lawful purposes only. You are responsible for all activity under your account. You agree not to misuse the Service, attempt unauthorized access, or interfere with its operation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">3. Your Data</h2>
            <p>
              You retain ownership of all context, memories, and data you store in Contxt. By using the Service you grant us a limited license to store and process that data solely to operate the Service on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">4. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the dashboard settings page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">5. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted availability or freedom from errors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Ghost Savvy Studios shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">7. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-0 mb-3">8. Contact</h2>
            <p>
              Questions about these terms? Reach us at{' '}
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
