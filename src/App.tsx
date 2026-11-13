import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Photobooth } from './components/Photobooth/Photobooth';
import { StudioShowcase } from './components/StudioShowcase';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-studio-950 text-studio-100 flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />
      <main className="flex-1">
        <Hero />
        
        <Photobooth />

        <StudioShowcase />
      </main>
      <Footer />
    </div>
  );
}
