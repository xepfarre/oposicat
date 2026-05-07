import { ChevronLeft, Newspaper, Clock, Tag } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: NoticiesSetmana
 * Mostra una llista de les 10 notícies més rellevants de l'última setmana.
 */
export default function NoticiesSetmana({ onTornar }: { onTornar: () => void }) {
  
  // 10 notícies d'actualitat simulades (període maig 2026 segons context)
  const noticies = [
    {
      id: 1,
      data: "07 Mai",
      categoria: "Societat",
      titol: "Catalunya entra en fase de pre-alerta per sequera després d'un abril sec",
      resum: "L'Agència Catalana de l'Aigua monitoritza els embassaments que es troben al 35% de la seva capacitat."
    },
    {
      id: 2,
      data: "06 Mai",
      categoria: "Seguretat",
      titol: "Nou pla de seguretat per al Mobile World Congress 2026",
      resum: "Interior confirma un desplegament especial de Mossos d'Esquadra per garantir la seguretat en l'esdeveniment tecnològic."
    },
    {
      id: 3,
      data: "05 Mai",
      categoria: "Política",
      titol: "El Parlament aprova la nova llei d'habitatge per limitar preus en zones tenses",
      resum: "La normativa busca frenar l'escalada de preus de lloguer a l'àrea metropolitana de Barcelona."
    },
    {
      id: 4,
      data: "04 Mai",
      categoria: "Economia",
      titol: "L'atur baixa a Catalunya per tercer mes consecutiu",
      resum: "Les dades de maig mostren una forta recuperació en el sector serveis i hostaleria."
    },
    {
      id: 5,
      data: "03 Mai",
      categoria: "Tecnologia",
      titol: "Barcelona inaugura el nou hub d'Intel·ligència Artificial del sud d'Europa",
      resum: "El centre preveu crear més de 1.000 llocs de treball d'alta qualificació en els propers dos anys."
    },
    {
      id: 6,
      data: "02 Mai",
      categoria: "Cultura",
      titol: "Sant Jordi 2026 bat rècords de vendes de llibres en català",
      resum: "El Gremi de Llibreters confirma un increment del 15% respecte a l'any anterior."
    },
    {
      id: 7,
      data: "01 Mai",
      categoria: "Infraestructures",
      titol: "Les obres de la L9 del Metro entren en la seva fase final a Sarrià",
      resum: "Es preveu que el tram central estigui operatiu a principis de l'any vinent."
    },
    {
      id: 8,
      data: "30 Abr",
      categoria: "Medi Ambient",
      titol: "Protecció Civil demana precaució davant les primeres onades de calor",
      resum: "S'activen els protocols d'informació a la gent gran i col·lectius vulnerables."
    },
    {
      id: 9,
      data: "29 Abr",
      categoria: "Esports",
      titol: "El Barça femení es proclama campió de lliga per cinquena vegada consecutiva",
      resum: "L'equip manté la seva hegemonia en el futbol estatal amb una temporada gairebé perfecta."
    },
    {
      id: 10,
      data: "28 Abr",
      categoria: "Sanitat",
      titol: "Salut implanta el nou sistema de recepta electrònica universal",
      resum: "El sistema permetrà retirar medicaments a qualsevol farmàcia de la Unió Europea amb el codi QR."
    }
  ];

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
      <main className="w-full max-w-md px-6 flex flex-col gap-4">
        {noticies.map((n, index) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden"
          >
            {/* Indicador lateral de categoria */}
            <div className="absolute top-0 right-0 p-3">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <Tag size={10} className="text-amber-400" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/60">{n.categoria}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center bg-red-600 px-2 py-1.5 rounded-xl min-w-[50px] shadow-lg shadow-red-900/20">
                <span className="text-[9px] font-black uppercase tracking-tighter opacity-80 leading-none mb-0.5">MAI</span>
                <span className="text-lg font-black italic tracking-tighter leading-none">{n.data.split(' ')[0]}</span>
              </div>
              <h2 className="text-sm font-black italic uppercase leading-tight pr-12 tracking-tight">
                {n.titol}
              </h2>
            </div>
            
            <p className="text-white/50 text-[11px] leading-relaxed font-medium pl-14">
              {n.resum}
            </p>

            <div className="flex items-center gap-2 pl-14 mt-1 opacity-20">
              <Clock size={10} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Publicat fa 2 dies</span>
            </div>
          </motion.div>
        ))}

        <div className="mt-8 p-6 bg-amber-400/10 border border-amber-400/20 rounded-3xl flex flex-col items-center text-center gap-3">
          <Newspaper size={32} className="text-amber-400 opacity-50" />
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-relaxed">
            Aquestes notícies són clau per a la part de cultura general i actualitat de l'examen. Repassa-les amb freqüència.
          </p>
        </div>
      </main>

    </div>
  );
}
