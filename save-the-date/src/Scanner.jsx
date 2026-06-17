import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;

    // Initialisation du scanner
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (decodedText) => {
        // Succès : un QR Code a été lu !
        scanner.clear(); // On arrête la caméra
        setIsScanning(false);
        setScanResult(decodedText); // ex: "INV-001"
        
        // C'est ici que l'on pourra envoyer l'info au Google Sheet !
      },
      (error) => {
        // Le scanner cherche en continu, on ignore les erreurs de lecture
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Erreur arrêt scanner", error));
    };
  }, [isScanning]);

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1A1C18] flex flex-col justify-center items-center font-sans p-4">
      {/* Design sombre et élégant pour le staff */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#9CA986]/10 to-black z-0"></div>

      <main className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        <h1 className="text-[#9CA986] uppercase tracking-[0.3em] text-sm md:text-base font-bold mb-8 text-center drop-shadow-md">
          Accueil VIP <br/> <span className="text-[#FAF8F5] text-xs font-light">Ella & Emmanuel</span>
        </h1>

        {/* ZONE DE SCAN */}
        {isScanning && (
          <div className="w-full backdrop-blur-md bg-black/50 border border-[#AEC6CF]/30 p-6 rounded-3xl shadow-2xl">
            <p className="text-[#FAF8F5]/80 text-center text-sm mb-4 italic">
              Veuillez scanner le Pass de l'invité.
            </p>
            {/* C'est ici que la caméra va s'afficher */}
            <div id="reader" className="w-full rounded-2xl overflow-hidden bg-black"></div>
          </div>
        )}

        {/* RÉSULTAT DU SCAN */}
        {!isScanning && scanResult && (
          <div className="w-full backdrop-blur-md bg-[#9CA986]/20 border border-[#9CA986] p-8 rounded-3xl shadow-[0_0_40px_rgba(156,169,134,0.3)] text-center animate-fade-in-up">
            <span className="text-5xl block mb-4">✅</span>
            <h2 className="text-2xl font-serif text-[#FAF8F5] mb-2">Accès Autorisé</h2>
            <p className="text-[#FAF8F5]/80 text-sm mb-6 uppercase tracking-widest">
              Identifiant : <strong className="text-[#AEC6CF]">{scanResult}</strong>
            </p>
            
            <button 
              onClick={resetScanner}
              className="w-full py-4 bg-[#FAF8F5] text-[#1A1C18] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-lg"
            >
              Scanner le prochain invité
            </button>
          </div>
        )}

      </main>
    </div>
  );
}