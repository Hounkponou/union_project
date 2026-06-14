import { useState, useEffect } from 'react';

export default function App() {
  const [guestId, setGuestId] = useState(null);
  const [guestName, setGuestName] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState('idle'); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Initialisation (Récupération URL + Compte à rebours)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuestId(params.get('id'));
    if (params.get('invite')) {
      setGuestName(decodeURIComponent(params.get('invite').replace(/\+/g, ' ')));
    }

    const weddingDate = new Date('2026-12-26T14:00:00').getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = weddingDate - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResponse = async (reponse) => {
    if (!guestId) {
      alert("Lien invalide : aucun identifiant de connexion trouvé.");
      return;
    }
    setRsvpStatus('loading');
    
    // Remplacer par l'URL de ton Google Apps Script
    const apiUrl = "https://script.google.com/macros/s/AKfycbwR5MuShfHfHOH4JL_16hLVzbYG-62c9f-F_si-1BLI0TLuY91c71tPxuhg_JClECj-sw/exec"; 

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ id: guestId, status: reponse }),
      });
      const data = await res.json();
      setRsvpStatus(data.success ? 'success' : 'error');
    } catch (error) {
      setRsvpStatus('error');
    }
  };

  return (
    // Conteneur principal : L'image prend 100% de l'écran et reste fixe
    <div 
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat fixed flex flex-col justify-center items-center font-sans"
      style={{ 
        // Photo d'exemple romantique. Remplace ce lien par VOTRE belle photo (chemin local ou lien)
        backgroundImage:"url('https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop')",//"url('/couple.jpg')",//
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay : Dégradé sombre pour sublimer la photo et rendre le texte lisible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-0"></div>

      {/* Contenu principal */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-12 min-h-screen">
        
        {/* En-tête : Élégant et minimaliste */}
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-white/80 uppercase tracking-[0.3em] text-sm mb-6 font-light">
            Certaines histoires s'écrivent à deux...
          </p>
          
          <h1 className="font-serif text-7xl md:text-9xl text-white drop-shadow-xl mb-2" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
            Ella <span className="text-[#e2c792] italic font-light">&</span> Emmanuel
          </h1>
          
          <p className="font-serif text-3xl md:text-4xl text-[#e2c792] italic tracking-wide mt-4 drop-shadow-md">
            26 Décembre 2026
          </p>
          <p className="text-white/90 tracking-widest uppercase text-sm mt-4">
            Cotonou, Bénin
          </p>
        </div>

        {/* Bloc RSVP : Effet Verre Dépoli (Glassmorphism) */}
        <div className="w-full max-w-lg mt-8 backdrop-blur-md bg-white/10 border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl text-center transition-all duration-700 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          {guestName && (
            <p className="text-xl font-serif text-white mb-6 italic">
              Très cher(e) {guestName},
            </p>
          )}

          {rsvpStatus === 'success' ? (
            <div className="py-6 animate-fade-in">
              <span className="text-4xl block mb-4">🤍</span>
              <h3 className="text-2xl font-serif text-white mb-2">Avec une immense joie</h3>
              <p className="text-white/80 font-light">Nous avons hâte de partager ce moment unique avec vous.</p>
            </div>
          ) : (
            <div>
              <p className="text-white/90 font-light mb-8 text-lg leading-relaxed">
                Ferez-vous partie de cette belle aventure ?<br/> 
                <span className="text-sm text-white/60 mt-2 block">Merci de confirmer votre présence.</span>
              </p>
              
              {rsvpStatus === 'loading' ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Bouton Primaire (Oui) */}
                  <button 
                    onClick={() => handleResponse("Oui")}
                    className="w-full py-4 bg-white/90 text-black font-semibold uppercase tracking-widest text-sm rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
                  >
                    Avec grand plaisir
                  </button>
                  
                  {/* Bouton Secondaire (Non) */}
                  <button 
                    onClick={() => handleResponse("Non")}
                    className="w-full py-4 bg-transparent border border-white/50 text-white font-medium uppercase tracking-widest text-sm rounded-full hover:bg-white/10 transition-all"
                  >
                    Je ne pourrai pas
                  </button>
                </div>
              )}
              {rsvpStatus === 'error' && <p className="mt-4 text-red-400 text-sm">Une erreur est survenue, veuillez réessayer.</p>}
            </div>
          )}
        </div>

        {/* Compte à rebours très discret en bas */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-xs tracking-[0.2em] uppercase">
          Dans {timeLeft.days} Jours, {timeLeft.hours} Heures et {timeLeft.minutes} Minutes
        </div>

      </main>
    </div>
  );
}