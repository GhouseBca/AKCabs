import { Cars } from "@/components/cars/Cars";
import { Contact } from "@/components/contact/Contact";
import { Hero } from "@/components/hero/Hero";
import { Pricing } from "@/components/pricing/Pricing";
import { Services } from "@/components/services/Services";
import { WhyChoose } from "@/components/why-choose/WhyChoose";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Cars />
      <WhyChoose />
      <Pricing />
      <Contact />
    </>
  );
}
