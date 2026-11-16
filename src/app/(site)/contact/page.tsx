import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeading, PageShell } from "@/components/ui/common";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with 4K Wallpaper Of Me – OFFICIAL for questions, feedback, collaborations or wallpaper requests.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell className="pb-10">
      <PageHeading eyebrow="Contact" title="Say hello" description="Questions, feedback, collaborations or a wallpaper request? Send a message and it will reach the site owner directly." />
      <div className="max-w-2xl">
        <ContactForm />
      </div>
    </PageShell>
  );
}
