import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/hero/Hero";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* About, Animals, Music, Dance, Journal and Contact sections come next. */}
      </main>
    </>
  );
}
