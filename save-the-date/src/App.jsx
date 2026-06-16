import { useState, useEffect } from 'react';

export default function App() {
  const [guestId, setGuestId] = useState(null);
  const [guestName, setGuestName] = useState(null);
  
  // Le statut cherche d'abord dans la mémoire du téléphone si l'invité a déjà répondu
  const [rsvpStatus, setRsvpStatus] = useState(() => {
    return localStorage.getItem('wedding_rsvp_status') || 'idle';
  }); 
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setGuestId(id);
    
    if (params.get('invite')) {
      setGuestName(decodeURIComponent(params.get('invite').replace(/\+/g, ' ')));
    }

    // Si on change d'ID (quelqu'un transfère le lien), on réinitialise le cache
    if (id && localStorage.getItem('wedding_rsvp_id') !== id) {
      localStorage.removeItem('wedding_rsvp_status');
      setRsvpStatus('idle');
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

const handleResponse = (reponse) => {
    if (!guestId) return;
    
    setRsvpStatus('loading');
    
    // Ton URL confirmée
    const baseUrl = "https://script.google.com/macros/s/AKfycbzyg_sULXS3qr86EVe-BMowReOvn_prHTXFfUWkC-kXCGIhv32CanZz5ybOLxxbAIXbbA/exec"//"https://script.google.com/macros/s/AKfycbyqk_-PbQOYtSo6LwLiao4fZ1fYNgnZ7z0KaWNdkiH8w-IUqNpYhYWOsGKGLNvI2ascLw/exec"; 
    
    const urlWithParams = `${baseUrl}?id=${guestId}&status=${reponse}`;

    try {
      // 🚨 L'ASTUCE ULTIME : On crée une image invisible en arrière-plan.
      // Le navigateur va charger l'URL sans se poser de question (zéro blocage CORS).
      const requeteFantome = new Image();
      requeteFantome.src = urlWithParams;
      
      // On simule un petit temps de chargement pour rassurer l'utilisateur, puis on affiche le succès
      setTimeout(() => {
        const finalStatus = reponse === "Oui" ? 'success_yes' : 'success_no';
        setRsvpStatus(finalStatus);
        
        // Sauvegarde locale
        localStorage.setItem('wedding_rsvp_status', finalStatus);
        localStorage.setItem('wedding_rsvp_id', guestId);
      }, 1000); // 1 seconde de faux chargement

    } catch (error) {
      console.error("Erreur inattendue :", error);
      setRsvpStatus('error');
    }
  };


  // Lien Google Agenda généré automatiquement
  const googleCalendarLink = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mariage+Ella+%26+Emmanuel&dates=20261226T130000Z/20261227T030000Z&details=Nous+avons+h%C3%A2te+de+vous+y+voir+!&location=Cotonou,+B%C3%A9nin";

      

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-top bg-no-repeat fixed flex flex-col justify-center items-center font-sans"
      style={{ 
        backgroundImage:"url('./prewedding0119.jpg')", //"url('https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop')",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#9CA986]/10 to-black/70 z-0"></div>

      <main className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-12 min-h-screen">
        
        {/* En-tête */}
        <div className="text-center mb-8 animate-fade-in-up">
          <p className="text-[#FAF8F5]/80 uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-light">
            Certaines histoires s'écrivent à deux, mais se vivent à plusieurs. Nous aimerions tant que vous soyez des nôtres pour célébrer notre union.
          </p>
          
          <h1 className="font-serif text-6xl md:text-8xl text-[#FAF8F5] drop-shadow-xl mb-4" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
            Ella <span className="text-[#9CA986] italic font-light mx-2">&</span> Emmanuel
          </h1>
          
          <div className="flex justify-center items-center gap-4 mb-4 opacity-80">
            <span className="w-12 h-px bg-[#9CA986]"></span>
            <span className="text-[#9CA986] text-sm">✦</span>
            <span className="w-12 h-px bg-[#9CA986]"></span>
          </div>

          <p className="font-serif text-2xl md:text-3xl text-[#AEC6CF] italic tracking-wider drop-shadow-md">
            26 Décembre 2026
          </p>
          <p className="text-[#FAF8F5]/90 tracking-widest uppercase text-xs md:text-sm mt-4">
            Cotonou, Bénin
          </p>
        </div>

        {/* Bloc RSVP */}
        <div className="w-full max-w-lg mt-2 backdrop-blur-md bg-[#FAF8F5]/5 border border-[#AEC6CF]/30 p-8 md:p-12 rounded-3xl shadow-2xl text-center transition-all duration-700 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          
          {guestName && (
            <p className="text-xl font-serif text-[#FAF8F5] mb-6 italic">
              Très cher(e) {guestName},
            </p>
          )}

          {/* ÉTAT : A DIT OUI */}
          {rsvpStatus === 'success_yes' && (
            <div className="py-2 animate-fade-in">
              <span className="text-4xl block mb-4 text-[#9CA986]">🌿</span>
              <h3 className="text-2xl font-serif text-[#FAF8F5] mb-2">C'est noté !</h3>
              <p className="text-[#FAF8F5]/80 font-light mb-8">Votre présence est confirmée. Nous avons hâte de partager cette journée avec vous.</p>
              
              <a 
                href={googleCalendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-4 bg-[#AEC6CF]/20 border border-[#AEC6CF]/50 text-[#FAF8F5] font-medium uppercase tracking-widest text-xs md:text-sm rounded-full hover:bg-[#AEC6CF]/40 transition-all"
              >
                📅 Ajouter au calendrier
              </a>
            </div>
          )}

          {/* ÉTAT : A DIT NON */}
          {rsvpStatus === 'success_no' && (
            <div className="py-4 animate-fade-in">
              <h3 className="text-xl font-serif text-[#FAF8F5] mb-2">C'est noté</h3>
              <p className="text-[#FAF8F5]/80 font-light">Nous regrettons que vous ne puissiez pas être des nôtres, mais nous penserons fort à vous.</p>
            </div>
          )}

          {/* ÉTAT : EN ATTENTE DE RÉPONSE */}
          {rsvpStatus === 'idle' && guestId && (
            <div>
              <p className="text-[#FAF8F5] font-light mb-8 text-base md:text-lg leading-relaxed">
                Ferez-vous partie de cette belle aventure ?<br/> 
                <span className="text-xs md:text-sm text-[#AEC6CF] mt-2 block italic">Merci de confirmer votre présence.</span>
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => handleResponse("Oui")}
                  className="w-full py-4 bg-[#FAF8F5] text-[#9CA986] font-semibold uppercase tracking-widest text-xs md:text-sm rounded-full hover:bg-white hover:text-[#7A8A66] transition-all shadow-[0_0_20px_rgba(250,248,245,0.15)] hover:scale-105"
                >
                  Avec grand plaisir
                </button>
                <button 
                  onClick={() => handleResponse("Non")}
                  className="w-full py-4 bg-transparent border border-[#AEC6CF]/50 text-[#FAF8F5] font-medium uppercase tracking-widest text-xs md:text-sm rounded-full hover:bg-[#AEC6CF]/10 transition-all"
                >
                  Je ne pourrai pas
                </button>
              </div>
            </div>
          )}

          {/* CHARGEMENT */}
          {rsvpStatus === 'loading' && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9CA986]"></div>
            </div>
          )}

          {/* VISITEUR SANS LIEN (Pas d'ID) */}
          {!guestId && (
             <div className="py-2">
               <p className="text-[#FAF8F5]/80 font-light italic text-sm">
                 Veuillez utiliser le lien personnel qui vous a été envoyé pour confirmer votre présence.
               </p>
             </div>
          )}

          {rsvpStatus === 'error' && <p className="mt-4 text-red-400 text-sm">Une erreur est survenue, veuillez réessayer.</p>}
        </div>

        {/* Compte à rebours */}
        <div className="absolute bottom-6 left-0 right-0 text-center text-[#FAF8F5]/60 text-[10px] md:text-xs tracking-[0.2em] uppercase">
          Dans <span className="text-[#AEC6CF] font-medium">{timeLeft.days}</span> Jours, <span className="text-[#AEC6CF] font-medium">{timeLeft.hours}</span> Heures et <span className="text-[#AEC6CF] font-medium">{timeLeft.minutes}</span> Minutes
        </div>

      </main>
    </div>
  );
}