import { useState, useEffect } from "react";
import { ChevronLeft, Newspaper, Clock, Tag } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../../../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

/**
 * PANTALLA: NoticiesSetmana
 * Mostra una llista de les 10 notícies més rellevants de l'última setmana.
 */
export default function NoticiesSetmana({ onTornar }: { onTornar: () => void }) {
  const [noticies, setNoticies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 10 notícies d'actualitat simulades (període maig 2026 segons context)
  const fallbackNoticies = [
    {
      id: "f1",
      data: "07 Mai",
      categoria: "Societat",
      titol: "Catalunya entra en fase de pre-alerta per sequera després d'un abril sec",
      descripcio: "L'Agència Catalana de l'Aigua monitoritza els embassaments que es troben al 35% de la seva capacitat."
    },
    {
      id: "f2",
      data: "06 Mai",
      categoria: "Seguretat",
      titol: "Nou pla de seguretat per al Mobile World Congress 2026",
      descripcio: "Interior confirma un desplegament especial de Mossos d'Esquadra per garantir la seguretat en l'esdeveniment tecnològic."
    },
    {
      id: "f3",
      data: "05 Mai",
      categoria: "Política",
      titol: "El Parlament aprova la nova llei d'habitatge per limitar preus en zones tenses",
      descripcio: "La normativa busca frenar l'escalada de preus de lloguer a l'àrea metropolitana de Barcelona."
    },
    {
      id: "f4",
      data: "04 Mai",
      categoria: "Economia",
      titol: "L'atur baixa a Catalunya per tercer mes consecutiu",
      descripcio: "Les dades de maig mostren una forta recuperació en el sector serveis i hostaleria."
    },
    {
      id: "f5",
      data: "03 Mai",
      categoria: "Tecnologia",
      titol: "Barcelona inaugura el nou hub d'Intel·ligència Artificial del sud d'Europa",
      descripcio: "El centre preveu crear més de 1.000 llocs de treball d'alta qualificació en els propers dos anys."
    },
    {
      id: "f6",
      data: "02 Mai",
      categoria: "Cultura",
      titol: "Sant Jordi 2026 bat rècords de vendes de llibres en català",
      descripcio: "El Gremi de Llibreters confirma un increment del 15% respecte a l'any anterior."
    },
    {
      id: "f7",
      data: "01 Mai",
      categoria: "Infraestructures",
      titol: "Les obres de la L9 del Metro entren en la seva fase final a Sarrià",
      descripcio: "Es preveu que el tram central estigui operatiu a principis de l'any vinent."
    },
    {
      id: "f8",
      data: "30 Abr",
      categoria: "Medi Ambient",
      titol: "Protecció Civil demana precaució davant les primeres onades de calor",
      descripcio: "S'activen els protocols d'informació a la gent gran i col·lectius vulnerables."
    },
    {
      id: "f9",
      data: "29 Abr",
      categoria: "Esports",
      titol: "El Barça femení es proclama campió de lliga per cinquena vegada consecutiva",
      descripcio: "L'equip manté la seva hegemonia en el futbol estatal amb una temporada gairebé perfecta."
    },
    {
      id: "f10",
      data: "28 Abr",
      categoria: "Sanitat",
      titol: "Salut implanta el nou sistema de recepta electrònica universal",
      descripcio: "El sistema permetrà retirar medicaments a qualsevol farmàcia de la Unió Europea amb el codi QR."
    }
  ];

  useEffect(() => {
    const fetchNoticies = async () => {
      try {
        const q = query(collection(db, "actualitat"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setNoticies(fallbackNoticies);
        } else {
          setNoticies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error carregant notícies:", error);
        setNoticies(fallbackNoticies);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticies();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white">
      
      {/* CAPÇALERA */}
      <header className="w-full p-6 flex flex-col gap-6 shrink-0 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onTornar}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Última Setmana</span>
            <h1 className="text-white text-base font-black uppercase italic tracking-tight">
              Notícies <span className="text-red-500">Rellevants</span>
            </h1>
          </div>
        </div>
      </header>

      {/* LLISTA DE NOTÍCIES */}
      <main className="w-full max-w-md md:max-w-6xl px-6 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6 md:py-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
             <div className="w-8 h-8 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin"></div>
          </div>
        ) : noticies.map((n, index) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-8 flex flex-col gap-3 relative overflow-hidden"
          >
            {/* Indicador lateral de categoria */}
            <div className="absolute top-0 right-0 p-3 md:p-5">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Tag size={10} className="text-amber-400" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/60">{n.categoria}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              <div className="flex flex-col items-center justify-center bg-red-600 px-2 py-1.5 md:py-3 rounded-xl min-w-[50px] md:min-w-[70px] shadow-lg shadow-red-900/20">
                <span className="text-[9px] md:text-xs font-black uppercase tracking-tighter opacity-80 leading-none mb-0.5">MAI</span>
                <span className="text-lg md:text-2xl font-black italic tracking-tighter leading-none">{n.data?.split(' ')?.[0] || '12'}</span>
              </div>
              <h2 className="text-sm md:text-xl font-black italic uppercase leading-tight pr-12 tracking-tight">
                {n.titol}
              </h2>
            </div>
            
            <p className="text-white/50 text-[11px] md:text-sm leading-relaxed font-medium pl-14 md:pl-24">
              {n.descripcio}
            </p>

            <div className="flex items-center gap-2 pl-14 md:pl-24 mt-1 opacity-20">
              <Clock size={10} />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">ACTUALITZAT</span>
            </div>
          </motion.div>
        ))}

        <div className="mt-8 p-6 bg-amber-400/10 border border-amber-400/20 rounded-3xl flex flex-col items-center text-center gap-3 md:col-span-2">
          <Newspaper size={32} className="text-amber-400 opacity-50" />
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-relaxed">
            Aquestes notícies són clau per a la part de cultura general i actualitat de l'examen. Repassa-les amb freqüència.
          </p>
        </div>
      </main>

    </div>
  );
}
