import { STUDIO_CONFIG } from './config/studio';

export default function App() {
  return (
    <div className="min-h-screen bg-studio-950 text-studio-100 flex flex-col items-center justify-center p-6">
      <h1 className="font-editorial text-4xl tracking-widest uppercase">{STUDIO_CONFIG.brandName}</h1>
      <p className="text-studio-400 text-sm tracking-widest uppercase mt-2">{STUDIO_CONFIG.tagline}</p>
    </div>
  );
}
