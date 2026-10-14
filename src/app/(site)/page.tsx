import { Cars } from "@/components/cars/Cars";
import { Contact } from "@/components/contact/Contact";
import { Hero } from "@/components/hero/Hero";
import { Pricing } from "@/components/pricing/Pricing";
import { Reviews } from "@/components/reviews/Reviews";
import { Services } from "@/components/services/Services";
import { StructuredData } from "@/components/structured-data/StructuredData";
import { WhyChoose } from "@/components/why-choose/WhyChoose";
import { buildLocalBusinessSchema } from "@/lib/structured-data";

export default function HomePage() {
  return (
    <>
      <StructuredData data={buildLocalBusinessSchema()} />
      <Hero />
      <Services />
      <Cars />
      <WhyChoose />
      <Pricing />
      <Reviews />
      <Contact />
    </>
  );
}
