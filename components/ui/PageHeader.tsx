/** Title block for inner pages. Leaves room for the fixed navigation. */
export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="page-header mx-auto max-w-[1440px] px-5 pt-36 pb-16 sm:px-8 lg:px-12 lg:pt-44">
      <h1 className="max-w-[16ch] font-display text-[clamp(2.6rem,6vw,5rem)] font-light leading-[1.02] text-text">{title}</h1>
      <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-text">{intro}</p>
    </header>
  );
}
