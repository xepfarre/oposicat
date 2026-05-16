import { useState, useEffect, Fragment } from "react";
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
      data: "16 Mai",
      categoria: "Societat",
      titol: "Catalunya entra en fase de pre-alerta per sequera després d'un abril sec",
      descripcio: "L'Agència Catalana de l'Aigua monitoritza els embassaments que es troben al 35% de la seva capacitat."
    },
    {
      id: "f2",
      data: "16 Mai",
      categoria: "Seguretat",
      titol: "Nou pla de seguretat per al Mobile World Congress 2026",
      descripcio: "Interior confirma un desplegament especial de Mossos d'Esquadra per garantir la seguretat en l'esdeveniment tecnològic."
    },
    {
      id: "f3",
      data: "15 Mai",
      categoria: "Política",
      titol: "El Parlament aprova la nova llei d'habitatge per limitar preus en zones tenses",
      descripcio: "La normativa busca frenar l'escalada de preus de lloguer a l'àrea metropolitana de Barcelona."
    },
    {
      id: "f4",
      data: "14 Mai",
      categoria: "Economia",
      titol: "L'atur baixa a Catalunya per tercer mes consecutiu",
      descripcio: "Les dades de maig mostren una forta recuperació en el sector serveis i hostaleria."
    },
    {
      id: "f5",
      data: "14 Mai",
      categoria: "Tecnologia",
      titol: "Barcelona inaugura el nou hub d'Intel·ligència Artificial del sud d'Europa",
      descripcio: "El centre preveu crear més de 1.000 llocs de treball d'alta qualificació en els propers dos anys."
    },
    {
      id: "f6",
      data: "13 Mai",
      categoria: "Cultura",
      titol: "Sant Jordi 2026 bat rècords de vendes de llibres en català",
      descripcio: "El Gremi de Llibreters confirma un increment del 15% respecte a l'any anterior."
    },
    {
      id: "f7",
      data: "12 Mai",
      categoria: "Infraestructures",
      titol: "Les obres de la L9 del Metro entren en la seva fase final a Sarrià",
      descripcio: "Es preveu que el tram central estigui operatiu a principis de l'any vinent."
    },
    {
      id: "f8",
      data: "11 Mai",
      categoria: "Medi Ambient",
      titol: "Protecció Civil demana precaució davant les primeres onades de calor",
      descripcio: "S'activen els protocols d'informació a la gent gran i col·lectius vulnerables."
    },
    {
      id: "f9",
      data: "10 Mai",
      categoria: "Esports",
      titol: "El Barça femení es proclama campió de lliga per cinquena vegada consecutiva",
      descripcio: "L'equip manté la seva hegemonia en el futbol estatal amb una temporada gairebé perfecta."
    },
    {
      id: "f10",
      data: "09 Mai",
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
    <div className="fixed inset-0 w-full h-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full max-w-lg md:max-w-4xl flex flex-col items-center shrink-0 text-center mb-4 relative">
        
        {/* FILA 1: BOTÓ ENRERA + LOGO */}
        <div className="w-full flex items-center justify-center relative mb-8 px-6">
          <button 
            onClick={onTornar}
            className="absolute left-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="bg-black/30 backdrop-blur-md px-10 py-3 rounded-[1.5rem] shadow-xl border border-white/10">
            <h1 className="text-2xl font-black italic tracking-tighter select-none">
              <span className="text-white">Oposi </span>
              <span className="text-red-500">Mossos</span>
            </h1>
          </div>
        </div>

        {/* FILA 2: TITOL SECCIO + RATLLA */}
        <div className="flex flex-col items-center mb-4 px-6">
          <span className="text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Última Setmana</span>
          <h2 className="text-lg font-black italic tracking-widest text-white uppercase mb-1 text-center">
            Notícies Rellevants
          </h2>
          <div className="w-12 h-1 bg-red-600 rounded-full" />
        </div>
      </header>

      {/* LLISTA DE NOTÍCIES */}
      <main className="w-full max-w-md md:max-w-6xl px-6 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6 md:py-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
             <div className="w-8 h-8 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin"></div>
          </div>
        ) : noticies.map((n, index) => {
          // Lògica per mostrar el separador de dia
          const mostrarSeparador = index === 0 || noticies[index - 1].data !== n.data;
          
          return (
            <Fragment key={n.id}>
              {mostrarSeparador && (
                <div className="col-span-full flex items-center gap-4 py-6 md:py-10">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] whitespace-nowrap text-amber-400">
                    {n.data.replace('Mai', ' DE MAIG').replace('Abr', ' DE ABRIL')}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-8 flex flex-col gap-3 relative overflow-hidden h-fit"
              >
                {/* Indicador lateral de categoria */}
                <div className="absolute top-0 right-0 p-3 md:p-5">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    <Tag size={10} className="text-amber-400" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/60">{n.categoria}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-5">
                  <h2 className="text-sm md:text-xl font-black italic uppercase leading-tight pr-20 tracking-tight">
                    {n.titol}
                  </h2>
                </div>
                
                <p className="text-white/50 text-[11px] md:text-sm leading-relaxed font-medium mt-1">
                  {n.descripcio}
                </p>

                <div className="flex items-center gap-2 mt-2 opacity-20">
                  <Clock size={10} />
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">ACTUALITZAT</span>
                </div>
              </motion.div>
            </Fragment>
          );
        })}

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
