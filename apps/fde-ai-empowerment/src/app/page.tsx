import { Hero } from "@/components/home/hero";
import { ParadigmGrid } from "@/components/home/paradigm-grid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <ParadigmGrid />
      </div>
    </>
  );
}
