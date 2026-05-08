import React, { useState } from 'react';
import { Youtube, ChevronLeft, User, Shield, FileText, Play, Info, PencilLine, ChevronDown, ChevronUp } from 'lucide-react';

/* 
  Aquest component gestiona la guia de la Prova Biodata.
  Inclou explicacions, preguntes genèriques i pràctica del test.
*/

const VIDEO_BIODATA = "https://youtu.be/mrnciH-f1Kc?si=Is8UU2tn-Ch4emyh";

interface MenuButtonProps {
  titol: string;
  subtitol: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const MenuButton = ({ titol, subtitol, onClick }: Omit<MenuButtonProps, 'icon' | 'color'>) => (
  <button 
    onClick={onClick}
    className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-6 flex flex-col items-center justify-center transition-all active:scale-95 group text-center"
  >
    <span className="text-white font-black italic uppercase tracking-widest text-xs leading-none">{titol}</span>
    <span className="text-white/30 text-[7px] font-black uppercase tracking-[0.2em] mt-1.5 group-hover:text-white/50 transition-colors uppercase">{subtitol}</span>
  </button>
);

export const GuiaBiodata = ({ 
  seccio, 
  setSeccio,
  actualitzaSeccioPare 
}: { 
  seccio: 'menu' | 'personals' | 'laborals' | 'pgme' | 'test',
  setSeccio: (s: 'menu' | 'personals' | 'laborals' | 'pgme' | 'test') => void,
  actualitzaSeccioPare?: (s: any) => void 
}) => {
  const [subSeccioTest, setSubSeccioTest] = useState<'menu' | 'que_es' | 'practica'>('menu');
  const [preguntaOberta, setPreguntaOberta] = useState<number | null>(null);

  // Reiniciar l'estat de pregunta oberta quan canviem de secció
  React.useEffect(() => {
    setPreguntaOberta(null);
  }, [seccio]);

  const preguntesPersonals = [
    {
      p: "Digui'm els seus 3 majors defectes i 3 majors virtuts.",
      r: "Resposta pendent de definir..."
    },
    {
      p: "És el primer cop que es presenta? Si no ho és, per què es presenta un altre cop?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Per què creu que vostè ha d'aprovar aquesta oposició aquest any?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Descrigui breument la situació que més por ha passat a la seva vida.",
      r: "Resposta pendent de definir..."
    }
  ];

  const preguntesLaborals = [
    {
      p: "Quants anys ha treballat vostè i on?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Quin és el càrrec més important que vostè ha desenvolupat?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Si tornés a néixer, estudiaria el mateix?",
      r: "Resposta pendent de definir..."
    }
  ];

  const preguntesPGME = [
    {
      p: "Per què vostè vol ser policia?",
      r: "Voldria ser policia perquè considero que sóc una persona que vol ajudar a la societat de forma altruista i professional. Desenvoluparé la feina amb gran professionalitat i responsabilitat per a donar el màxim nivell del servei. Estic preparat per a fer el que sigui necessari per als ciutadans i el cos de PGME, però amb els peus a terra, sense creure'm un superheroi."
    },
    {
      p: "Per què ha decidit ser mosso i no policia local?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Què espera de la feina de mosso?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Què creu vostè que la ciutadania espera de vostè?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Quina especialitat és la que més li agradaria treballar dins del cos?",
      r: "Resposta pendent de definir..."
    }
  ];

  // Exposar l'estat de secció de la guia al pare si canvia
  React.useEffect(() => {
    if (actualitzaSeccioPare) actualitzaSeccioPare(seccio);
  }, [seccio]);

  const renderMenuPrincipal = () => (
    <div className="flex flex-col gap-3 w-full animate-in fade-in duration-500">
      {/* Botó Vermell de YouTube - Rectangular com els altres */}
      <a 
        href={VIDEO_BIODATA} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full bg-red-600/90 hover:bg-red-600 border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center transition-all active:scale-95 group shadow-xl mb-2"
      >
        <span className="text-white font-black italic uppercase tracking-widest text-xs">EN QUÈ CONSISTEIX LA PROVA?</span>
        <div className="flex items-center gap-2 mt-1.5">
           <Youtube size={12} className="text-white" />
           <span className="text-white/50 text-[7px] font-black uppercase tracking-[0.2em]">GUIA EN VÍDEO</span>
        </div>
      </a>

      {/* Línia separadora fina */}
      <div className="h-[1px] bg-white/5 w-full my-2 shadow-sm" />

      <div className="flex flex-col gap-3">
        <MenuButton 
          titol="TEST DE BIODATA" 
          subtitol="SIMULACRE DE L'EXAMEN"
          onClick={() => setSeccio('test')}
        />

        {/* Segona línia separadora per dividir el Test de les preguntes */}
        <div className="h-[1px] bg-white/5 w-full my-2 shadow-sm" />

        <MenuButton 
          titol="PREGUNTES PERSONALS" 
          subtitol="AUTOCONEIXEMENT I PASSAT"
          onClick={() => setSeccio('personals')}
        />
        <MenuButton 
          titol="PREGUNTES LABORALS" 
          subtitol="EXPERIÈNCIA I TRAJECTÒRIA"
          onClick={() => setSeccio('laborals')}
        />
        <MenuButton 
          titol="PREGUNTES DE PGME" 
          subtitol="VALORS i CULTURA MOSSO"
          onClick={() => setSeccio('pgme')}
        />
      </div>
    </div>
  );

  if (seccio === 'personals') {
    return (
      <div className="flex flex-col flex-1 gap-4 animate-in slide-in-from-right-4 duration-300 w-full mb-10">
        <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2rem] pt-6 px-6 pb-8 -mx-4 shadow-2xl backdrop-blur-sm">
          <h3 className="text-blue-400 font-[900] italic uppercase text-base mb-6 tracking-[0.1em] text-center">Preguntes Personals</h3>
          
          <ul className="flex flex-col gap-3">
            {preguntesPersonals.map((item, i) => (
              <li key={i} className="flex flex-col gap-2">
                <div className="text-[12px] text-white/90 bg-[#1a3a5a]/60 py-3 px-5 rounded-xl border border-white/5 leading-tight italic text-center shadow-inner w-full">
                  "{item.p}"
                </div>
                
                <button 
                  onClick={() => setPreguntaOberta(preguntaOberta === i ? null : i)}
                  className="flex items-center justify-center gap-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-blue-400/70 hover:text-blue-400 transition-colors"
                >
                  {preguntaOberta === i ? (
                    <>AMAGAR RESPOSTA <ChevronUp size={12} /></>
                  ) : (
                    <>MOSTRA RESPOSTA <ChevronDown size={12} /></>
                  )}
                </button>

                {preguntaOberta === i && (
                  <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[11px] text-white/60 leading-relaxed italic text-center">
                      {item.r}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (seccio === 'laborals') {
    return (
      <div className="flex flex-col flex-1 gap-4 animate-in slide-in-from-right-4 duration-300 w-full mb-10">
        <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2rem] pt-6 px-6 pb-8 -mx-4 shadow-2xl backdrop-blur-sm">
          <h3 className="text-amber-400 font-[900] italic uppercase text-base mb-4 tracking-[0.1em] text-center">Preguntes Laborals</h3>
          
          {/* Label introductori */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 mb-6 text-center">
            <p className="text-[11px] text-amber-400/90 font-bold leading-relaxed italic">
              "En aquesta secció es repassa la teva trajectòria professional i el teu compromís amb el treball."
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {preguntesLaborals.map((item, i) => (
              <li key={i} className="flex flex-col gap-2">
                <div className="text-[12px] text-white/90 bg-[#1a3a5a]/60 py-3 px-5 rounded-xl border border-white/5 leading-tight italic text-center shadow-inner w-full">
                  "{item.p}"
                </div>
                
                <button 
                  onClick={() => setPreguntaOberta(preguntaOberta === i ? null : i)}
                  className="flex items-center justify-center gap-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  {preguntaOberta === i ? (
                    <>AMAGAR RESPOSTA <ChevronUp size={12} /></>
                  ) : (
                    <>MOSTRA RESPOSTA <ChevronDown size={12} /></>
                  )}
                </button>

                {preguntaOberta === i && (
                  <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[11px] text-white/60 leading-relaxed italic text-center">
                      {item.r}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (seccio === 'pgme') {
    return (
      <div className="flex flex-col flex-1 gap-4 animate-in slide-in-from-right-4 duration-300 w-full mb-10">
        <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2rem] pt-6 px-6 pb-8 -mx-4 shadow-2xl backdrop-blur-sm">
          <h3 className="text-emerald-400 font-[900] italic uppercase text-base mb-4 tracking-[0.1em] text-center">Preguntes de PGME</h3>
          
          {/* Label introductori */}
          <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-4 mb-6 text-center">
            <p className="text-[11px] text-emerald-400/90 font-bold leading-relaxed italic">
              "En aquesta part de l'examen us faran preguntes relacionades amb la Policia de la Generalitat Mossos d'Esquadra (PGME)"
            </p>
          </div>

          <div className="flex flex-col items-center mb-4">
            <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] italic">Exemple de preguntes d'altres anys</span>
          </div>

          <ul className="flex flex-col gap-3">
            {preguntesPGME.map((item, i) => (
              <li key={i} className="flex flex-col gap-2">
                <div className="text-[12px] text-white/90 bg-[#1a3a5a]/60 py-3 px-5 rounded-xl border border-white/5 leading-tight italic text-center shadow-inner w-full">
                  "{item.p}"
                </div>
                
                <button 
                  onClick={() => setPreguntaOberta(preguntaOberta === i ? null : i)}
                  className="flex items-center justify-center gap-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400/70 hover:text-emerald-400 transition-colors"
                >
                  {preguntaOberta === i ? (
                    <>AMAGAR RESPOSTA <ChevronUp size={12} /></>
                  ) : (
                    <>MOSTRA RESPOSTA <ChevronDown size={12} /></>
                  )}
                </button>

                {preguntaOberta === i && (
                  <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[11px] text-white/60 leading-relaxed italic text-center">
                      {item.r}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (seccio === 'test') {
    return (
      <div className="flex flex-col flex-1 gap-6 animate-in slide-in-from-right-4 duration-300 w-full">
        {subSeccioTest === 'menu' ? (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setSubSeccioTest('que_es')}
              className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-6 flex flex-col items-center justify-center transition-all active:scale-95 group text-center"
            >
              <span className="text-white font-black italic uppercase tracking-widest text-xs leading-none">Què és un test biodata?</span>
              <span className="text-white/30 text-[7px] font-black uppercase tracking-[0.2em] mt-1.5 group-hover:text-white/50 transition-colors uppercase">Informació i guia</span>
            </button>
            <button 
              onClick={() => setSubSeccioTest('practica')}
              className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-6 flex flex-col items-center justify-center transition-all active:scale-95 group text-center"
            >
              <span className="text-white font-black italic uppercase tracking-widest text-xs leading-none">Practica el test biodata</span>
              <span className="text-white/30 text-[7px] font-black uppercase tracking-[0.2em] mt-1.5 group-hover:text-white/50 transition-colors uppercase">Exercicis de pràctica</span>
            </button>
          </div>
        ) : subSeccioTest === 'que_es' ? (
          <div className="flex flex-col flex-1 gap-4">
             <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2.5rem] pt-6 px-6 pb-8 -mx-4 shadow-2xl backdrop-blur-sm">
                <h4 className="text-cyan-400 font-[900] italic uppercase text-[11px] tracking-widest text-center mb-4">Definició i propòsit</h4>
                <p className="text-[13px] text-white/80 leading-relaxed italic text-center">
                  El biodata és un qüestionari biogràfic complet que serveix com a base per a la teva entrevista personal.
                  Es busquen evidències passades del teu comportament per predir com actuaràs com a policia.
                </p>
             </div>
             <button onClick={() => setSubSeccioTest('menu')} className="mt-8 text-white/40 text-[10px] font-[900] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-white transition-colors italic">
               <ChevronLeft size={16} /> TORNAR AL MENÚ BIODATA
             </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 gap-4">
             <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2.5rem] pt-6 px-6 pb-10 -mx-4 flex flex-col items-center gap-6 text-center shadow-2xl backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                   <PencilLine size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-white font-[900] italic uppercase text-sm tracking-widest">Simulacre en marxa</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Properament disponible per als nostres alumnes</p>
                </div>
             </div>
             <button onClick={() => setSubSeccioTest('menu')} className="mt-8 text-white/40 text-[10px] font-[900] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-white transition-colors italic">
               <ChevronLeft size={16} /> TORNAR AL MENÚ BIODATA
             </button>
          </div>
        )}
      </div>
    );
  }

  return renderMenuPrincipal();
};
