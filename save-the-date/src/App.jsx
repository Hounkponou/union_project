import { useState, useEffect } from 'react';

export default function App() {
  const [guestId, setGuestId] = useState(null);
  const [guestName, setGuestName] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState('idle'); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

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
      alert("Lien invalide : aucun identifiant trouvé.");
      return;
    }
    setRsvpStatus('loading');
    const apiUrl = "TON_URL_APPS_SCRIPT_ICI"; 

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ id: guestId, status: reponse }),
      });
      const data = await res.json();
      setRsvpStatus(data.success ? 'success' : 'error');
    } catch {
      setRsvpStatus('error');
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center font-sans antialiased"
      style={{ 
        // En attendant ta vraie photo de fiancé, voici un fond texturé aux teintes Vert Sauge / Ivoire
        backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop')",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay coloré : Un dégradé délicat qui part d'un Vert Sauge profond vers un Blanc Ivoire doux pour lier l'image de fond à vos couleurs */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7A8F75]/50 via-[#7A8F75]/20 to-[#FDFBF7]/90 z-0"></div>

      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-12 min-h-screen">
        
        {/* En-tête Textuel Poétique */}
        <div className="text-center mb-10 animate-fade-in-up">
          <p className="text-[#FDFBF7] uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-medium drop-shadow-md">
            Certaines histoires s'écrivent à deux...
          </p>
          
          <h1 className="font-serif text-6xl md:text-8xl text-[#FDFBF7] drop-shadow-lg mb-2">
            Ella <span className="text-[#87CEEB] italic font-light">&</span> Emmanuel
          </h1>
          
          <p className="font-serif text-2xl md:text-3xl text-[#7A8F75] bg-[#FDFBF7]/90 px-6 py-2 rounded-full inline-block font-medium tracking-wide mt-6 shadow-sm">
            26 Décembre 2026
          </p>
          
          <p className="text-[#7A8F75] tracking-[0.2em] uppercase text-xs font-semibold mt-4">
            Cotonou, Bénin
          </p>
        </div>

        {/* Bloc RSVP en Blanc Ivoire Translucide (Glassmorphism) */}
        <div className="w-full max-w-md backdrop-blur-md bg-[#FDFBF7]/70 border border-white/40 p-8 md:p-10 rounded-3xl shadow-xl text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          {guestName && (
            <p className="text-xl font-serif text-[#4A5D45] mb-4 italic">
              Cher(e) {guestName},
            </p>
          )}

          {rsvpStatus === 'success' ? (
            <div className="py-6 animate-fade-in">
              <span className="text-4xl block mb-4 text-[#7A8F75]">🌿</span>
              <h3 className="text-2xl font-serif text-[#4A5D45] mb-2">Avec une immense joie</h3>
              <p className="text-[#6B7C65] font-light">Nous avons hâte de partager ce moment unique avec vous.</p>
            </div>
          ) : (
            <div>
              <p className="text-[#4A5D45] font-light mb-8 text-base md:text-lg leading-relaxed">
                Ferez-vous partie de cette belle aventure ?<br/> 
                <span className="text-xs text-[#6B7C65] font-medium mt-2 block uppercase tracking-wider">Merci de confirmer votre présence</span>
              </p>
              
              {rsvpStatus === 'loading' ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A8F75]"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Bouton Oui : Vert Sauge élégant */}
                  <button 
                    onClick={() => handleResponse("Oui")}
                    className="w-full py-4 bg-[#7A8F75] text-[#FDFBF7] font-semibold uppercase tracking-widest text-xs rounded-xl hover:bg-[#687B63] transition-all shadow-md hover:scale-[1.02]"
                  >
                    Avec grand plaisir
                  </button>
                  
                  {/* Bouton Non : Bordure subtile */}
                  <button 
                    onClick={() => handleResponse("Non")}
                    className="w-full py-4 bg-transparent border border-[#7A8F75]/40 text-[#7A8F75] font-medium uppercase tracking-widest text-xs rounded-xl hover:bg-[#7A8F75]/5 transition-all"
                  >
                    Je ne pourrai pas
                  </button>
                </div>
              )}
              {rsvpStatus === 'error' && <p className="mt-4 text-red-600 text-xs">Une erreur est survenue, veuillez réessayer.</p>}
            </div>
          )}
        </div>

        {/* Compte à rebours discret en bas */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-[#4A5D45]/60 text-xs tracking-[0.15em] uppercase font-medium">
          Dans {timeLeft.days} Jours, {timeLeft.hours} H et {timeLeft.minutes} M
        </div>

      </main>
    </div>
  );
}