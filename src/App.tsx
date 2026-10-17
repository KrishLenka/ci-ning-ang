import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Experiences } from "@/components/sections/Experiences";
import { Music } from "@/components/sections/Music";
import { Travel } from "@/components/sections/Travel";
import { Leadership } from "@/components/sections/Leadership";
import { Contact } from "@/components/sections/Contact";
import { BoopToast } from "@/components/ui/BoopToast";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <div className="bg-paper">
          <About />
          <Experiences />
          {/* "Hobbies" in the nav scrolls here. */}
          <div id="hobbies">
            <Music />
            <Travel />
          </div>
          <Leadership />
          <Contact />
        </div>
      </main>
      <Footer />
      <BoopToast />
    </>
  );
}
