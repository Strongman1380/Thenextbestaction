export default function Header() {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="relative mx-auto mb-6 max-w-4xl overflow-hidden rounded-2xl md:rounded-[32px] bg-gradient-to-r from-primary to-primary-light p-6 md:p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 text-left">
            <p className="text-xs uppercase tracking-[0.6em] text-white/70">Guided decision support</p>
            <h1 className="text-2xl md:text-3xl font-bold">Next Best Action</h1>
            <p className="text-sm text-white/90 max-w-2xl">
              A trauma-informed companion for caseworkers that surfaces immediate actions, client context, and longer-term development goals.
            </p>
          </div>
          <div className="space-y-1 text-left md:text-right">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Confidence</p>
            <p className="text-3xl font-semibold">97%</p>
            <p className="text-xs text-white/80">based on your inputs and urgency selection</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-semibold uppercase tracking-[0.45em] text-white/80">
          <span className="rounded-full bg-white/20 px-4 py-2">Case overview</span>
          <span className="rounded-full bg-white/20 px-4 py-2">Risk insight</span>
          <span className="rounded-full bg-white/20 px-4 py-2">Skill building</span>
        </div>
      </div>

      <p className="text-base text-gray-600 max-w-3xl mx-auto px-4">
        Navigate between structured case plans and professional development resources to keep every client interaction purposeful.
      </p>
    </header>
  );
}
