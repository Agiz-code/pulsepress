export function NewsletterBanner() {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Stay Informed. Stay Balanced.</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Get the top stories and bias analysis delivered to your inbox.</p>
        </div>
        <form className="flex w-full max-w-md items-center gap-3 rounded-3xl bg-white/5 p-2 shadow-sm sm:w-auto">
          <label htmlFor="newsletter-email" className="sr-only">Enter your email</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-slate-300/40"
          />
          <button type="submit" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
