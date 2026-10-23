import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBrand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  const bundle = getBrand();
  const page = bundle.content.pages.contact;
  return buildMetadata(bundle, { title: page.title, description: page.intro, path: "/contact" });
}

interface ContactPageProps {
  /** `?product=<slug>` pre-selects a product, e.g. from a product page's enquiry link. */
  searchParams: Promise<{ product?: string | string[]; bag?: string | string[] }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { product, bag } = await searchParams;
  const { brand, content, products } = getBrand();
  const page = content.pages.contact;
  const form = content.contactForm;
  const { email, phone, address } = brand.contact;

  const preselected = typeof product === "string" && products.some((p) => p.slug === product) ? product : "";
  const renderedAt = new Date().getTime();

  return (
    <>
      <PageHeader title={page.title} intro={page.intro} />
      <Container className="grid gap-16 border-t border-border/70 py-20 pb-32 lg:grid-cols-12">
        <section aria-label="Send a message" id="contact-form" className="scroll-mt-28 lg:col-span-7">
          <ContactForm
            topics={form.topics}
            products={products.map(({ slug, name }) => ({ slug, name }))}
            initialTopic={preselected || bag === "1" ? form.productTopic : (form.topics[0] ?? "")}
            initialProduct={preselected}
            startedAt={renderedAt}
            successHeading={form.successHeading}
            successBody={form.successBody}
            privacyNote={form.privacyNote}
            fromBag={bag === "1"}
          />
        </section>

        <aside aria-label="Other ways to reach us" className="space-y-9 lg:col-span-4 lg:col-start-9">
          {email && (
            <div>
              <h2 className="field-label">Email</h2>
              <a href={`mailto:${email}`} className="text-link mt-2 inline-block font-display text-[1.75rem] leading-tight">
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div>
              <h2 className="field-label">Phone</h2>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-2 inline-block text-xl text-text">
                {phone}
              </a>
            </div>
          )}
          {address && (
            <div>
              <h2 className="field-label">Studio</h2>
              <p className="mt-2 text-xl text-text">{address}</p>
            </div>
          )}
          {brand.social.length > 0 && (
            <div>
              <h2 className="field-label">Elsewhere</h2>
              <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xl">
                {brand.social.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
