import { useState, useEffect } from 'react';

export default function Invitation() {
  const [guestName, setGuestName] = useState("");
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite')) {
      setGuestName(decodeURIComponent(params.get('invite').replace(/\+/g, ' ')));
    }
    if (params.get('id')) {
      setGuestId(params.get('id'));
    }
  }, []);

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat fixed flex flex-col items-center font-sans overflow-y-auto pb-12"
      style={{ 
        backgroundImage: "url('./wedding.png')", // Garde le chemin de ta photo
        backgroundAttachment: "fixed"
      }}
    >
      {/* Voile sombre pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-0 fixed"></div>

      <main className="relative z-10 flex flex-col items-center w-full px-4 py-12 md:py-16 max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-[#FAF8F5]/80 uppercase tracking-[0.3em] text-xs md:text-sm mb-4 font-light drop-shadow-md">
            Invitation Officielle
          </p>
          
          <h1 className="font-serif text-5xl md:text-7xl text-[#FAF8F5] mb-2" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
            Ella <span className="text-[#9CA986] italic font-light mx-2">&</span> Emmanuel
          </h1>

          {/* Thème Spirituel */}
          <div className="my-6">
            <h2 className="text-[#9CA986] font-serif italic text-xl md:text-2xl mb-2 drop-shadow-md">
              « Sous le manteau de la grâce »
            </h2>
            <p className="text-[#FAF8F5]/80 font-light text-sm italic px-4">
              "De sa plénitude nous avons tous reçu, et grâce sur grâce." <br/><span className="text-xs text-[#AEC6CF] not-italic">— Jean 1:16</span>
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-8 opacity-80 mt-4">
            <span className="w-16 h-px bg-[#AEC6CF] shadow-lg"></span>
            <span className="text-[#AEC6CF] text-lg drop-shadow-lg">✦</span>
            <span className="w-16 h-px bg-[#AEC6CF] shadow-lg"></span>
          </div>

          {/* Mot d'accueil */}
          {guestName && (
            <div className="backdrop-blur-md bg-black/50 border border-[#9CA986]/40 px-8 py-5 rounded-2xl inline-block shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
              <p className="text-xl font-serif text-[#FAF8F5] italic">
                Très cher(e) {guestName},
              </p>
              <p className="text-[#FAF8F5] font-light mt-2 text-sm md:text-base">
                Nous sommes comblés de vous compter parmi nous. Voici les détails de notre journée.
              </p>
            </div>
          )}
        </div>

        {/* Grille du Programme */}
        <div className="grid md:grid-cols-2 gap-6 w-full animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          {/* Cérémonie */}
          <div className="backdrop-blur-md bg-black/60 border border-[#9CA986]/40 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group hover:bg-black/70 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl group-hover:scale-110 transition-transform">⛪</div>
            <h2 className="text-[#9CA986] uppercase tracking-widest text-xs font-bold mb-2">15H00</h2>
            <h3 className="font-serif text-3xl text-[#FAF8F5] mb-4">Célébration Eucharistique</h3>
            
            <div className="mt-6 space-y-4 text-[#FAF8F5] font-light text-sm md:text-base">
              <p className="flex items-start gap-3">
                <span className="text-[#AEC6CF] drop-shadow-md">📍</span>
                <span><strong className="font-medium">Église Saint-Jean de Gbégamey</strong><br/>Cotonou, Bénin</span>
              </p>
              <p className="flex items-start gap-3 text-[#FAF8F5]/80 italic mt-4">
                Nous vous prions d'arriver 15 minutes à l'avance pour une installation dans le calme.
              </p>
            </div>
          </div>

          {/* Réception */}
          <div className="backdrop-blur-md bg-black/60 border border-[#AEC6CF]/40 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group hover:bg-black/70 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl group-hover:scale-110 transition-transform">🥂</div>
            <h2 className="text-[#AEC6CF] uppercase tracking-widest text-xs font-bold mb-2">18H00</h2>
            <h3 className="font-serif text-3xl text-[#FAF8F5] mb-4">Réception & Dîner</h3>
            
            <div className="mt-6 space-y-4 text-[#FAF8F5] font-light text-sm md:text-base">
              <p className="flex items-start gap-3">
                <span className="text-[#9CA986] drop-shadow-md">📍</span>
                <span><strong className="font-medium">Le Palais des Anges</strong><br/>Fidjrossè feux tricolores, Route des pêches, Cotonou, Bénin</span>
              </p>
              <div className="mt-6 p-4 border border-[#FAF8F5]/20 rounded-xl bg-black/40">
                <p className="text-xs uppercase tracking-widest text-[#AEC6CF] mb-1">Dress Code</p>
                <p className="italic text-[#FAF8F5]/90">Chic & Élégant. Une touche de Vert Sauge ou Bleu Clair serait appréciée.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Section QR CODE VIP */}
        {guestName && (
          <div className="mt-8 w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="backdrop-blur-md bg-black/60 border border-[#FAF8F5]/20 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col items-center relative overflow-hidden">
              {/* Lignes décoratives VIP */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9CA986] to-transparent opacity-50"></div>
              
                <h3 className="text-[#FAF8F5] uppercase tracking-[0.2em] text-sm font-semibold mb-6 flex items-center justify-center gap-2 text-center">
                <span className="text-[#AEC6CF]">✦</span> Pass d'Accès de {guestName} <span className="text-[#AEC6CF]">✦</span>
                </h3>
              
              {/* Image du QR Code générée dynamiquement */}
              <div className="bg-[#FAF8F5] p-3 rounded-2xl shadow-inner mb-4 transition-transform hover:scale-105 duration-300">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${guestName}&color=2a3026`} 
                  alt="QR Code d'accès" 
                  className="w-32 h-32 md:w-40 md:h-40 opacity-90"
                />
              </div>
              
              <p className="text-[#FAF8F5]/80 text-xs text-center italic font-light px-4">
                Veuillez présenter ce code à l'entrée de la réception le jour J.
              </p>
              <p className="text-[#FAF8F5]/40 text-[10px] mt-3 font-mono tracking-wider">
                ID: {guestId}
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}