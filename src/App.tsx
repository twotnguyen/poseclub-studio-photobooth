import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StudioShowcase } from './components/StudioShowcase';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-studio-950 text-studio-100 flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />
      <main className="flex-1">
        <Hero />
        
        {/* Placeholder for Phase 3 & 4 Photobooth App */}
        <section id="photobooth" className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center py-16 border border-dashed border-white/20 rounded-2xl bg-studio-900/40">
            <h2 className="font-editorial text-3xl text-white">Online Photobooth</h2>
            <p className="text-studio-400 text-sm mt-2">Loading photobooth camera engine...</p>
          </div>
        </section>

        <StudioShowcase />
      </main>
      <Footer />
    </div>
  );
}
