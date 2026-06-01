import { useState } from 'react';

// ============================================================================
// COMPONENT: WebBackofficePC
// Explicació per a no-programadors:
// Aquest és el quadre de comandaments o panell secret (Backoffice) d'OposiCAT en PC.
// Permet al gestor de l'escola auditar quants alumnes tenim registrats,
// veure el seu correu, quants simulacres han respost o el darrer cop que es van connectar.
// També inclou unes targetes KPIs de facturació simulada i mètriques.
// ============================================================================

interface PropsBackoffice {
  onTornarLanding: () => void;
}

export default function WebBackofficePC({ onTornarLanding }: PropsBackoffice) {
  // Simulem una llista d'estudiants registrats a OposiMossos amb les seves dades reals
  const [personesEstudiants] = useState([
    { id: '1', nom: 'Joan Soler i Vila', correu: 'joan.soler@gmail.com', opositant: 'Mossos', ingres: 'Maig 2026', progres: 82, accessos: 14 },
    { id: '2', nom: 'Mireia Garcia i Puig', correu: 'mireiagp@hotmail.com', opositant: 'Mossos', ingres: 'Maig 2026', progres: 64, accessos: 9 },
    { id: '3', nom: 'Albert Montserrat Font', correu: 'albert.montserrat@gmail.com', opositant: 'Mossos', ingres: 'Abril 2026', progres: 90, accessos: 27 },
    { id: '4', nom: 'Laura Camps i Vidal', correu: 'lauracamps@yahoo.es', opositant: 'Mossos', ingres: 'Abril 2026', progres: 15, accessos: 3 },
    { id: '5', nom: 'Francesc Xavier Farré', correu: 'xepfarre@gmail.com', opositant: 'Mossos', ingres: 'Març 2026', progres: 97, accessos: 41 },
  ]);

  // Estat per posar comentaris de gestió
  const [comentariFiltre, setComentariFiltre] = useState('');

  // Filtratge de la llista per un cercador ràpid
  const llistaFiltrada = personesEstudiants.filter(estudiant => 
    estudiant.nom.toLowerCase().includes(comentariFiltre.toLowerCase()) ||
    estudiant.correu.toLowerCase().includes(comentariFiltre.toLowerCase())
  );

  return (
    <div className="bg-[#021329] text-slate-100 min-h-screen font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white antialiased">
      
      {/* CAPÇALERA DE BACKOFFICE EXCLUSIVA */}
      <header className="border-b border-blue-950/40 bg-slate-950/90 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded">
              MODERADOR
            </span>
            <h1 className="text-sm font-black italic uppercase tracking-wider text-white">
              Panell de Control • OposiCAT Admin
            </h1>
          </div>
          <button
            onClick={onTornarLanding}
            className="border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-[10px] font-black uppercase py-2.5 px-4 rounded-xl transition-all cursor-pointer"
          >
            ← Sortir a la Web Pública
          </button>
        </div>
      </header>

      {/* CONTINGUT DEL DASHBOARD D'ADMINISTRACIÓ */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        
        {/* targetes KPI DE COMTES I DADES DE CONTROL DE NEGOCI */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-6 space-y-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Alumnes Totals</span>
            <div className="text-3xl font-black italic text-white flex items-baseline gap-1.5">
              1,248 <span className="text-xs text-emerald-400 font-bold font-mono">+12%</span>
            </div>
            <p className="text-[9px] text-slate-600 font-semibold leading-relaxed">
              Comptador acumulat d'estudiants registrats des de la web i APP mòbil d'OposiCAT.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-6 space-y-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-bold">Subscripcions Actives</span>
            <div className="text-3xl font-black italic text-blue-400 flex items-baseline gap-1.5">
              412 <span className="text-xs text-blue-500 font-bold font-mono">33% ràtio</span>
            </div>
            <p className="text-[9px] text-slate-600 font-semibold leading-relaxed">
              Membres amb un pla de pagament Trimestral o Anual actiu de forma simultània.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-6 space-y-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-bold">Simulacres Desats</span>
            <div className="text-3xl font-black italic text-[#FFDF00] flex items-baseline gap-1.5">
              18,495 <span className="text-xs text-amber-500 font-bold font-mono">1.2k/dia</span>
            </div>
            <p className="text-[9px] text-slate-600 font-semibold leading-relaxed">
              Exàmens i tests completats i guardats a la base de dades Firestore.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-900 rounded-2xl p-6 space-y-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-bold">Comissions d'Afiliació</span>
            <div className="text-3xl font-black italic text-emerald-400 flex items-baseline gap-1.5">
              €14,834 <span className="text-xs text-emerald-500 font-bold font-mono">Facturació</span>
            </div>
            <p className="text-[9px] text-slate-600 font-semibold leading-relaxed">
              Estimació de vendes netes estimades per l'escola de preparació OposiMossos.
            </p>
          </div>

        </div>

        {/* GRÀFIC VECTORIAL EN SVG REAL (DISSENY NET) */}
        <section className="bg-slate-950/40 border border-slate-900 p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-950/20 pb-4">
            <div>
              <h2 className="text-sm font-black italic uppercase text-white tracking-wide">Evolució d'Ingrés de Matrícules (Maig 2026)</h2>
              <p className="text-[10px] text-slate-500">Volum acumulat trimestral de nous oponents que s’interessen pels nostres 3 Ambits de contingut.</p>
            </div>
            <span className="text-[9px] bg-[#FFDF00]/10 border border-[#FFDF00]/20 text-[#FFDF00] px-2 py-0.5 rounded-full font-black uppercase">
              Actualitzat en temps real
            </span>
          </div>

          {/* Gràfic d'evolució construït íntegrament amb polilínia SVG de forma elegant */}
          <div className="w-full h-44 bg-slate-950 rounded-2xl p-4 flex items-center justify-center relative">
            <svg viewBox="0 0 500 100" className="w-full h-full text-blue-500">
              {/* Línies de fons guia */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#0e233d" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#0e233d" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#0e233d" strokeWidth="0.5" strokeDasharray="5,5" />
              
              {/* Línia de tendència de vendes i usuaris de Mossos d’Esquadra */}
              <polyline
                fill="none"
                stroke="url(#gradient-blau-dev)"
                strokeWidth="2.5"
                points="10,80 80,65 160,75 240,40 320,35 400,25 490,10"
              />
              
              {/* Gradients de dibuix en colors de policia */}
              <defs>
                <linearGradient id="gradient-blau-dev" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 right-4 text-[8px] text-slate-600 font-mono tracking-wider font-extrabold uppercase">Març • Abril • Maig • Juny</div>
          </div>
        </section>

        {/* LLISTAT REAL DE PISTES D'ALUMNES */}
        <section className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black italic uppercase text-white">Llistat Executiu d'Alumnes Registrats</h3>
              <p className="text-[10px] text-slate-500 font-semibold leading-none">Cerca ràpida per auditar quin alumne necessita ajuda o suport docent.</p>
            </div>
            {/* Buscador neta de programació */}
            <input
              type="text"
              value={comentariFiltre}
              onChange={(e) => setComentariFiltre(e.target.value)}
              placeholder="Cerca alumne per nom o mail..."
              className="bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none text-[11px] px-4 py-3 rounded-xl w-full sm:w-64 transition-all font-semibold"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 uppercase text-[9px] font-black tracking-widest h-10">
                  <th className="font-extrabold">Alumne</th>
                  <th className="font-extrabold">Oposició</th>
                  <th className="font-extrabold">Progrés mitjà</th>
                  <th className="font-extrabold">Accessos totals</th>
                  <th className="font-extrabold text-right">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-slate-300">
                {llistaFiltrada.map((alumne) => (
                  <tr key={alumne.id} className="h-14 hover:bg-[#021329]/25 transition-colors">
                    <td>
                      <div className="flex flex-col">
                        <span className="font-black italic uppercase text-white text-xs leading-none">{alumne.nom}</span>
                        <span className="text-[9px] text-slate-500 pt-0.5 leading-none">{alumne.correu}</span>
                      </div>
                    </td>
                    <td className="font-bold text-slate-400 text-[10px] uppercase">{alumne.opositant}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${alumne.progres}%` }}></div>
                        </div>
                        <span className="font-mono text-[9px] text-[#FFDF00] font-black">{alumne.progres}%</span>
                      </div>
                    </td>
                    <td className="font-mono text-[10px] text-slate-400 pl-4">{alumne.accessos} vegades</td>
                    <td className="text-right">
                      {alumne.id === '5' ? (
                        <span className="text-[8px] bg-[#FFDF00]/10 border border-[#FFDF00]/20 text-[#FFDF00] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                          Admin / Creador
                        </span>
                      ) : (
                        <span className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black px-2 py-0.5 rounded uppercase tracking-widest">
                          Alumne
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
