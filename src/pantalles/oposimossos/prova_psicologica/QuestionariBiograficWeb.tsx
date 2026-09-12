import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, Shield, Search, ChevronDown, CheckCircle2, ChevronLeft, 
  BookOpen, HelpCircle, AlertCircle, Sparkles, Filter, FileText,
  Eye, EyeOff, Save, Check, Clock, Bookmark, PenTool, RotateCcw
} from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

/* =============================================================================
 * LLISTA OFICIAL DE LES 10 COMPETÈNCIES CLAU DE L'ISPC PER A MOSSOS D'ESQUADRA
 * -----------------------------------------------------------------------------
 * Comentari planer per a no-programadors:
 * Aquestes són les 10 competències que els psicòlegs del tribunal avaluen
 * durant tot el procés selectiu (tant al Biodata com a l'entrevista oral).
 * En cada pregunta del qüestionari, 3 d'aquestes competències estaran ressaltades
 * en color verd com a claus avaluades.
 * ============================================================================= */
export const COMPETENCIES_OFICIALS_ISPC = [
  "Habilitats socials i comunicatives",
  "Orientació de servei a la ciutadania",
  "Treball en equip i col·laboració",
  "Adaptabilitat i flexibilitat",
  "Autocontrol i gestió de l'estrès",
  "Autogestió i creixement personal",
  "Compromís amb l'organització",
  "Eficiència i orientació a la qualitat",
  "Resolució de problemes",
  "Iniciativa i autonomia"
] as const;

/* =============================================================================
 * COMPONENT: QuestionariBiograficWeb
 * -----------------------------------------------------------------------------
 * Explicació per a no-programadors:
 * Aquest component mostra la guia i el banc oficial de preguntes del QÜESTIONARI BIOGRÀFIC
 * per a la Prova Psicològica i Biodata d'accés a la Policia de la Generalitat - Mossos d'Esquadra.
 * 
 * Estructura visual i funcional:
 * 1. Títol superior únic i net ("ENTÈN I PRACTICA EL QÜESTIONARI BIOGRÀFIC").
 * 2. Sistema interactiu i didàctic de Preguntes i Respostes (FAQ) sobre com és la prova.
 * 3. Selector de 4 Blocs Temàtics d'igual mida en graella ("Selecciona un bloc temàtic que explorar i practicar"):
 *    - Dades Personals (Informació i context)
 *    - Preguntes Personals (Autoconeixement i passat)
 *    - Preguntes Laborals (Experiència i trajectòria)
 *    - Preguntes de PGME (Valors i cultura mosso)
 * 4. Barra d'eines: Cercador ràpid + Botó Plegar/Desplegar totes.
 * 5. Targetes de preguntes amb els 3 blocs requerits:
 *    - "Resposta orientativa" (oculta per defecte, clic per desplegar)
 *    - "Competències clau involucrades" (oculta per defecte, mostra les 10 amb les 3 claus en verd)
 *    - "Resposta de l'alumne" (xuleta personal editable i desada a la base de dades)
 * ============================================================================= */

export type BlocBiograficTipus = 'tots' | 'dades_personals' | 'personals' | 'laborals' | 'pgme';

export interface PreguntaBiograficaItem {
  id: string;
  bloc: 'dades_personals' | 'personals' | 'laborals' | 'pgme';
  pregunta: string;
  respostaModel?: string;
  consellOposicat?: string;
  competenciesAvaluades?: string[];
  docId?: string;
}

interface QuestionariBiograficWebProps {
  onTornar: () => void;
  onTornarMenuPrincipal: () => void;
  onAnarBiodata?: () => void;
  onAnarEntrevista?: () => void;
  blocInicial?: BlocBiograficTipus;
}

/**
 * Component auxiliar per formatar de manera elegant, clara i didàctica
 * les respostes orientatives:
 * - Subratlla els títols principals ("3 Virtuts" i "3 Defectes").
 * - Presenta amb gran distinció visual les opcions condicionals ("Si és la primera vegada" / "Si ja s'hi ha presentat abans").
 * - Ressalta cadascun dels conceptes i explicacions amb una estructura neta i còmoda de llegir.
 */
const FormatadorRespostaModel: React.FC<{ text: string }> = ({ text }) => {
  if (!text) {
    return (
      <span className="text-slate-400 italic">
        Elabora la teva resposta basant-te en fets reals, demostrant sinceritat, autocrítica i una sòlida vocació de servei públic.
      </span>
    );
  }

  // Dividim el text en paràgrafs per blocs de doble salt de línia
  const paragrafs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

  return (
    <div className="space-y-3.5 text-xs sm:text-sm text-slate-200">
      {paragrafs.map((paragraf, index) => {
        const paragrafNet = paragraf.trim();

        // 1. Encapçalament subratllat: "3 Virtuts"
        if (paragrafNet.toLowerCase() === '3 virtuts' || paragrafNet.startsWith('3 Virtuts')) {
          return (
            <div key={index} className="pt-1.5 pb-1">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-300 font-black text-sm uppercase tracking-wider underline underline-offset-4 decoration-emerald-400 decoration-2">
                  3 Virtuts
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Punts forts a destacar
                </span>
              </div>
            </div>
          );
        }

        // 2. Encapçalament subratllat: "3 Defectes"
        if (paragrafNet.toLowerCase() === '3 defectes' || paragrafNet.startsWith('3 Defectes')) {
          return (
            <div key={index} className="pt-3.5 pb-1 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="text-amber-300 font-black text-sm uppercase tracking-wider underline underline-offset-4 decoration-amber-400 decoration-2">
                  3 Defectes
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Àrees de millora sota control
                </span>
              </div>
            </div>
          );
        }

        // 3. Cas bonic: "Si és la primera vegada"
        if (paragrafNet.toLowerCase().includes('si és la primera vegada') || paragrafNet.toLowerCase().includes('si es la primera vegada')) {
          return (
            <div key={index} className="pt-2 pb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-black text-xs uppercase tracking-wider underline underline-offset-4 decoration-cyan-400 decoration-2">
                  Si és la primera vegada
                </span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  Opció A
                </span>
              </div>
            </div>
          );
        }

        // 4. Cas bonic: "Si ja s'hi ha presentat abans"
        if (paragrafNet.toLowerCase().includes("si ja s'hi ha presentat abans") || paragrafNet.toLowerCase().includes("si ja s'ha presentat")) {
          return (
            <div key={index} className="pt-4 pb-1 border-t border-slate-800/80">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 shadow-sm">
                <RotateCcw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="font-black text-xs uppercase tracking-wider underline underline-offset-4 decoration-purple-400 decoration-2">
                  Si ja s'hi ha presentat abans
                </span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  Opció B (Repetidor/a)
                </span>
              </div>
            </div>
          );
        }

        // 5. Paràgrafs amb estructura "Concepte: Explicació" (ex: "Vocació clara: ...", "Autocontrol: ...")
        const dosPuntsIdx = paragrafNet.indexOf(':');
        if (dosPuntsIdx > 0 && dosPuntsIdx < 45) {
          const concepte = paragrafNet.substring(0, dosPuntsIdx).trim();
          const explicacio = paragrafNet.substring(dosPuntsIdx + 1).trim();
          return (
            <div key={index} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 hover:border-slate-700 transition-colors">
              <div className="leading-relaxed">
                <strong className="text-white font-bold tracking-wide mr-1.5">
                  {concepte}:
                </strong>
                <span className="text-slate-300">
                  {explicacio}
                </span>
              </div>
            </div>
          );
        }

        // 6. Text normal/general
        return (
          <p key={index} className="leading-relaxed text-slate-300">
            {paragrafNet}
          </p>
        );
      })}
    </div>
  );
};

export const QuestionariBiograficWeb: React.FC<QuestionariBiograficWebProps> = ({
  onTornar,
  onTornarMenuPrincipal,
  onAnarBiodata,
  onAnarEntrevista,
  blocInicial = 'tots',
}) => {
  // Estat per filtrar per bloc seleccionat
  const [blocActiu, setBlocActiu] = useState<BlocBiograficTipus>(blocInicial);

  // Estat per controlar quines targetes de preguntes estan desplegades
  const [obertes, setObertes] = useState<string[]>([]);
  const [cerca, setCerca] = useState<string>('');

  // Preguntes predeterminades de l'acadèmia amb explicacions riques
  const preguntesPerDefecte: PreguntaBiograficaItem[] = [
    // =========================================================================
    // 1. BLOC: DADES PERSONALS (INFORMACIÓ I CONTEXT SENSE PUNTUACIÓ DIRECTA)
    // =========================================================================
    {
      id: 'bio-dp-1',
      bloc: 'dades_personals',
      pregunta: "Dades de filiació: Nom complet, edat, data de naixement i municipi actual de residència.",
      respostaModel: "Indiqueu de forma clara i directa el vostre nom complet, edat actual, data de naixement i el municipi on esteu empadronats i viviu habitualment.",
      consellOposicat: "Aquestes dades són purament informatives i administratives. No avaluen competències clau, però serveixen al tribunal per verificar el teu expedient administratiu i de residència.",
      competenciesAvaluades: ["Habilitats socials i comunicatives", "Compromís amb l'organització", "Adaptabilitat i flexibilitat"]
    },
    {
      id: 'bio-dp-2',
      bloc: 'dades_personals',
      pregunta: "Situació de convivència: Amb qui vius actualment? Tens parella, fills o germans?",
      respostaModel: "Descriviu la vostra unitat familiar actual (per exemple: visc amb la meva parella / visc amb els meus pares i germà) amb total naturalitat i precisió.",
      consellOposicat: "Serveix per conèixer l'entorn de convivència i estabilitat de l'opositor. No té cap incidència negativa tenir fills, parella o viure de forma independent.",
      competenciesAvaluades: ["Autogestió i creixement personal", "Autocontrol i gestió de l'estrès", "Habilitats socials i comunicatives"]
    },
    {
      id: 'bio-dp-3',
      bloc: 'dades_personals',
      pregunta: "Tens familiars directes o amics que treballin al cos de Mossos d'Esquadra o en altres cossos policials?",
      respostaModel: "Indiqueu si teniu o no familiars (per exemple: Sí, el meu oncle és caporal a Trànsit / No, no tinc cap familiar en cossos policials).",
      consellOposicat: "El tribunal ho pregunta per contextualitzar el teu coneixement directe del cos. Respondre que sí o que no no afegeix ni resta punts per aprovar.",
      competenciesAvaluades: ["Compromís amb l'organització", "Orientació de servei a la ciutadania", "Habilitats socials i comunicatives"]
    },
    {
      id: 'bio-dp-4',
      bloc: 'dades_personals',
      pregunta: "Nivell d'estudis reglats i idiomes: Quina és la teva màxima titulació acadèmica i quines llengües domines?",
      respostaModel: "Exposeu els vostres estudis oficials finalitzats (Batxillerat, CFGS, Grau Universitari) i els idiomes que parleu o teniu certificats (català, castellà, anglès, etc.).",
      consellOposicat: "Sigueu fidels a la vostra documentació oficial. El coneixement d'idiomes estrangers o titulacions superiors és una dada valuosa per al vostre historial.",
      competenciesAvaluades: ["Eficiència i orientació a la qualitat", "Autogestió i creixement personal", "Iniciativa i autonomia"]
    },
    {
      id: 'bio-dp-5',
      bloc: 'dades_personals',
      pregunta: "Permisos de conducció i mobilitat: Quins permisos de conduir tens i quina disponibilitat tens per desplaçar-te per Catalunya?",
      respostaModel: "Confirmeu la tinença del permís B (i altres si s'escau com A2 o C) i la disponibilitat plena per prestar servei a qualsevol Àrea Bàsica Policial del territori.",
      consellOposicat: "La mobilitat geogràfica és una característica inherent a la condició de mosso/a d'esquadra. Mostreu sempre total flexibilitat i predisposició.",
      competenciesAvaluades: ["Adaptabilitat i flexibilitat", "Compromís amb l'organització", "Eficiència i orientació a la qualitat"]
    },
    {
      id: 'bio-dp-6',
      bloc: 'dades_personals',
      pregunta: "Has viscut, estudiat o treballat alguna temporada fora de Catalunya o a l'estranger?",
      respostaModel: "Detalleu breument estades per estudis (com beques Erasmus o idiomes), feines estacionals o voluntariats, o bé confirmeu la residència continuada a Catalunya.",
      consellOposicat: "Les experiències fora aporten context de maduresa i autonomia personal. Si no heu viscut fora, no té cap aspecte negatiu.",
      competenciesAvaluades: ["Adaptabilitat i flexibilitat", "Iniciativa i autonomia", "Autogestió i creixement personal"]
    },

    // =========================================================================
    // 2. BLOC: PREGUNTES PERSONALS (AUTOCONEIXEMENT I PASSAT)
    // =========================================================================
    {
      id: 'bio-per-1',
      bloc: 'personals',
      pregunta: "Digui'm els seus 3 majors defectes i 3 majors virtuts.",
      respostaModel: `3 Virtuts

Autocontrol: Mantinc la calma sota pressió, actuant amb racionalitat i criteri en situacions de conflicte.

Empatia i fermesa: Capacitat per deescalar tensions amb la ciutadania mitjançant la comunicació assertiva.

Treball en equip: Disposició total a la cooperació, la disciplina operativa i la coordinació amb els companys.

3 Defectes

Autoexigència alta: Em costa desconnectar quan un treball és millorable; aprenc a ajustar expectatives de manera realista.

Incomoditat davant la imprevisió: M'agrada tenir les tasques estructurades i em requereix un esforç extra adaptar-me quan els plans canvien de cop.

Rigidesa amb els terminis: Poso molta pressió en complir els temps marcats, la qual cosa m'obliga a treballar la paciència amb els ritmes externs.`,
      consellOposicat: "Eviteu clixés artificials com «sóc massa treballador». El tribunal vol veure maduresa i autocrítica real. Mai mencioneu defectes incompatibles amb la funció pública com la impulsivitat o el desordre.",
      competenciesAvaluades: ["Autocontrol i gestió de l'estrès", "Habilitats socials i comunicatives", "Treball en equip i col·laboració"]
    },
    {
      id: 'bio-per-2',
      bloc: 'personals',
      pregunta: "És el primer cop que es presenta? Si no ho és, per què es presenta un altre cop?",
      respostaModel: `Si és la primera vegada

Vocació clara: És la meva primera convocatòria perquè és ara quan he completat la meva preparació teòrica, física i personal per afrontar el procés amb garanties.

Determinació: Reuneixo el perfil i les competències necessàries per assumir la responsabilitat del servei policial des del primer dia.

Si ja s'hi ha presentat abans

Perseverança i vocació: Em torno a presentar perquè la meva prioritat professional és ser policia; el no haver-ho aconseguit abans reafirma el meu compromís.

Aprenentatge i millora: He analitzat els punts febles de la convocatòria anterior, he reforçat la meva preparació i em presento amb més maduresa i millor capacitat de resposta.`,
      consellOposicat: "Mai culpeu tercers ni el tribunal anterior si no vau aprovar. Assumiu el procés com una oportunitat d'evolució i demostreu constància i fermesa.",
      competenciesAvaluades: ["Compromís amb l'organització", "Autogestió i creixement personal", "Adaptabilitat i flexibilitat"]
    },
    {
      id: 'bio-per-3',
      bloc: 'personals',
      pregunta: "Per què creu que vostè ha d'aprovar aquesta oposició aquest any?",
      respostaModel: "Perquè disposo de la maduresa vital, l'estabilitat emocional i la preparació teòrica i física necessàries per assumir el deure policial. El meu projecte professional està plenament alineat amb els valors de servei, proximitat i respecte de la PG-ME.",
      consellOposicat: "No us compareu despectivament amb altres opositors. Centreu el discurs exclusivament en la vostra vàlua, dedicació i compromís amb el servei públic.",
      competenciesAvaluades: ["Orientació de servei a la ciutadania", "Habilitats socials i comunicatives", "Compromís amb l'organització"]
    },
    {
      id: 'bio-per-4',
      bloc: 'personals',
      pregunta: "Descrigui breument la situació que més por ha passat a la seva vida.",
      respostaModel: `Situació: Conduint de nit de la ciutat cap al poble a uns 80 km/h, em va irrompre de cop un porc senglar a la calçada.

Reacció i control: Gràcies a circular a una velocitat moderada i atenta, vaig poder fer una maniobra d'esquiva segura sense perdre el control del vehicle.

Gestió posterior: Em vaig aturar un moment al voral per assimilar l'impacte emocional de l'ensurt, em vaig recuperar i vaig reprendre la marxa amb normalitat.`,
      consellOposicat: "La por és una emoció humana natural. Negar-la denota immaduresa o manca de sinceritat. El tribunal vol avaluar que la por no us paralitza i que sabeu mantenir el control sota pressió.",
      competenciesAvaluades: ["Autocontrol i gestió de l'estrès", "Resolució de problemes", "Iniciativa i autonomia"]
    },
    {
      id: 'bio-per-5',
      bloc: 'personals',
      pregunta: "Expliqueu algun error personal important realitzat en el passat i quina conducta vau rectificar.",
      respostaModel: `Error d'assumpció: Voler resoldre una tasca complexa de manera individual per no carregar els altres, provocant un retard en el resultat final.

Rectificació i aprenentatge: Vaig reconèixer la situació a temps, vaig demanar suport i vaig canviar el meu enfocament cap a una comunicació més fluida i una delegació eficient.

Impacte actual: Ara m'asseguro de coordinar-me millor des del primer moment per optimitzar els recursos i l'equip.`,
      consellOposicat: "L'error no ha de constituir cap delicte ni falta ètica greu. El valor d'aquesta pregunta rau en la capacitat d'aprenentatge i la humilitat per rectificar.",
      competenciesAvaluades: ["Autogestió i creixement personal", "Eficiència i orientació a la qualitat", "Adaptabilitat i flexibilitat"]
    },
    {
      id: 'bio-per-6',
      bloc: 'personals',
      pregunta: "Parli'm de vostè. Quin tipus de persona és i com el defineix el seu entorn familiar i d'amics?",
      respostaModel: `Definició personal: Em considero una persona equilibrada, treballadora, adaptable i amb un alt sentit de la responsabilitat.

Visió de l'entorn: Els meus familiars i amics em defineixen com algú de confiança, serè davant els problemes i accessible quan cal ajudar.

Relació social: Mantenir un entorn estable i sa demostra la meva capacitat de convivència, empatia i compromís amb les persones del meu voltant.`,
      consellOposicat: "Estructureu la resposta en tres eixos: formació/feina, estil de vida/valors i relacions humanes. Eviteu mostrar un perfil individualista o conflictiu.",
      competenciesAvaluades: ["Habilitats socials i comunicatives", "Adaptabilitat i flexibilitat", "Treball en equip i col·laboració"]
    },

    // =========================================================================
    // 3. BLOC: PREGUNTES LABORALS (EXPERIÈNCIA I TRAJECTÒRIA)
    // =========================================================================
    {
      id: 'bio-lab-1',
      bloc: 'laborals',
      pregunta: "Quants anys ha treballat vostè i en quins sectors o empreses?",
      respostaModel: `Resum de trajectòria: [X] anys d'experiència laboral en sectors com [ex: serveis, atenció al públic, seguretat privada o administració].

Transferència de competències: Cada experiència m'ha permès desenvolupar habilitats clau com el tracte amb la ciutadania, el treball sota pressió i la resolució d'incidències.

Orientació al cos: Tota la meva trajectòria ha estat un camí d'aprenentatge constant per consolidar el meu perfil cap a la funció policial.`,
      consellOposicat: "Les dates i feines han de coincidir exactament amb el document escrit que vau lliurar i amb la vostra Vida Laboral oficial. No deixeu llacunes temporals sense justificació raonable.",
      competenciesAvaluades: ["Treball en equip i col·laboració", "Eficiència i orientació a la qualitat", "Adaptabilitat"]
    },
    {
      id: 'bio-lab-2',
      bloc: 'laborals',
      pregunta: "Quin és el càrrec o responsabilitat més important que vostè ha desenvolupat?",
      respostaModel: `Càrrec i funcions: [Nom del lloc de treball, ex: Responsable d'equip / Atenció a incidències], on gestionava [gestió d'equips, atenció directa a clients, coordinació de tasques].

Habilitats demostrades: Assumir aquesta responsabilitat em va exigir un alt nivell d'organització, presa de decisions ràpides i gestió de situacions complexes.

Aprenentatge: Em va permetre comprovar la meva capacitat per liderar amb l'exemple i respondre amb rigor davant compromisos d'alta exigència.`,
      consellOposicat: "No cal haver estat director per tenir responsabilitat: haver estat encarregat de tancament, de caixa, de seguretat o de la formació de noves incorporacions és plenament vàlid.",
      competenciesAvaluades: ["Iniciativa i autonomia", "Resolució de problemes", "Compromís amb l'organització"]
    },
    {
      id: 'bio-lab-3',
      bloc: 'laborals',
      pregunta: "Si tornés a néixer, estudiaria i treballaria en el mateix?",
      respostaModel: `Valoració del camí: Sí, perquè les experiències acadèmiques i laborals que he tingut m'han format com a persona i m'han donat eines molt útils.

Vocació clara: Tanmateix, hagués orientat la meva preparació cap a la professió policial de forma encara més primerenca per haver-hi accedit abans.

Coherència: Estic satisfet del meu recorregut perquè m'ha aportat la maduresa necessària per afrontar aquest oposició amb garanties.`,
      consellOposicat: "Eviteu transmetre sensació de penediment o ressentiment cap a ocupacions passades. Demostreu que sabeu treure profit positiu de cada experiència.",
      competenciesAvaluades: ["Autogestió i creixement personal", "Adaptabilitat i flexibilitat", "Compromís organitzatiu"]
    },
    {
      id: 'bio-lab-4',
      bloc: 'laborals',
      pregunta: "Ha tingut mai cap discrepància o conflicte amb un company o un superior? Com ho va resoldre?",
      respostaModel: `Discrepància professional: Sí, hem tingut diferències d'criteri puntuals sobre com abordar una tasca o organitzar un torn de treball.

Resolució assertiva: Ho vaig resoldre parlant-ho directament de forma privada, escoltant la seva postura i buscant un punt d'entesa basat en el bé comú de l'equip.

Respecte a la jerarquia: Si la diferència era amb un superior, vaig exposar el meu punt de vista amb respecte i vaig assumir i executar la seva decisió final sense dubtar.`,
      consellOposicat: "En cap cas mencioneu discussions agressives ni faltes de respecte. Mostreu habilitat per separar el debat constructiu de la disciplina professional.",
      competenciesAvaluades: ["Treball en equip i col·laboració", "Habilitats socials i comunicatives", "Compromís amb l'organització"]
    },
    {
      id: 'bio-lab-5',
      bloc: 'laborals',
      pregunta: "Heu pres mai una decisió d'alta transcendència a la vostra feina sense aval directe de caps?",
      respostaModel: `Alineació amb el protocol: En situacions operatives imprevistes i d'urgència on no hi havia temps de consultar, vaig actuar seguint estrictament els procediments marcats.

Criteri i responsabilitat: Vaig prendre la decisió de forma racional, prioritzant la seguretat i el correcte funcionament del servei.

Rendició de comptes: Immediatament després de resoldre la situació, vaig informar detalladament al meu superior sobre les accions preses i el motiu de la decisió.`,
      consellOposicat: "A la Policia la línia jeràrquica és sagrada. Remarqueu que en situacions ordinàries se segueixen estrictament les instruccions, i només en emergències extremes s'actua d'ofici.",
      competenciesAvaluades: ["Iniciativa i autonomia", "Resolució de problemes", "Compromís amb l'organització"]
    },

    // =========================================================================
    // 4. BLOC: PREGUNTES DE PGME (VALORS I CULTURA MOSSO)
    // =========================================================================
    {
      id: 'bio-pg-1',
      bloc: 'pgme',
      pregunta: "Per què vostè vol ser policia / Mosso d'Esquadra?",
      respostaModel: `Vocació de servei: Per la voluntat d'ajudar i protegir la ciutadania de manera directa, garantint la seguretat i la convivència en la meva comunitat.

Dinamisme i valors: Busco una professió on el treball en equip, la disciplina, la millora contínua i el sentit del deure siguin la base del dia a dia.

Realització personal: Considero que el servei policial m'ofereix un projecte de vida professional ple i amb un impacte positiu real en la societat.`,
      consellOposicat: "Aquesta és una de les respostes fonamentals de tota la fase d'oposició. Fonamenteu-la en la vocació de servei públic, l'ajuda ciutadana i el compliment del deure.",
      competenciesAvaluades: ["Orientació de servei a la ciutadania", "Compromís amb l'organització", "Habilitats socials i comunicatives"]
    },
    {
      id: 'bio-pg-2',
      bloc: 'pgme',
      pregunta: "Per què ha decidit ser Mosso d'Esquadra i no Policia Local, Guàrdia Civil o Policia Nacional?",
      respostaModel: `Competència integral: La Policia de la Generalitat - Mossos d'Esquadra és la policia integral de Catalunya, amb desplegament total en seguretat ciutadana, investigació i trànsit.

Proximitat territorial: Em permet servir a la ciutadania del meu propi entorn des d'una organització moderna, arrelada al territori i d'alta proximitat.

Desenvolupament professional: El cos m'ofereix un ventall d'especialitats i opcions de promoció interna molt ampli sense haver de canviar de model policial.`,
      consellOposicat: "Mai desqualifiqueu cap altre cos policial. Mostreu respecte unànime per tots ells, explicant amb estima i coherència el motiu de la vostra elecció per PG-ME.",
      competenciesAvaluades: ["Compromís amb l'organització", "Habilitats socials i comunicatives", "Orientació de servei a la ciutadania"]
    },
    {
      id: 'bio-pg-3',
      bloc: 'pgme',
      pregunta: "Què espera de la feina de Mosso d'Esquadra durant el seu primer any de servei a comissaria?",
      respostaModel: `Aprenentatge i integració: Conèixer a fons el funcionament de la comissaria, la realitat del districte i integrar-me de forma disciplina i activa en el meu equip de treball.

Seguretat ciutadana: Consolidar les competències bàsiques de patrullatge, atenció directa al ciutadà, resolució d'incidències i aplicació rigorosa dels procediments.

Humilitat i rigor: Escoltar els companys més veterans, aprendre de la seva experiència i complir cada tasca assignada amb el màxim compromís.`,
      consellOposicat: "No mostreu ànsies per anar a unitats d'elit (GEI, BRIMO, helicòpters) el primer dia. La base essencial d'un bon agent és la patrulla de seguretat ciutadana.",
      competenciesAvaluades: ["Eficiència i orientació a la qualitat", "Treball en equip i col·laboració", "Adaptabilitat i flexibilitat"]
    },
    {
      id: 'bio-pg-4',
      bloc: 'pgme',
      pregunta: "Què creu vostè que la ciutadania espera d'un agent de Mossos d'Esquadra?",
      respostaModel: `Professionalitat i eficàcia: Una resposta ràpida, serena i resolutiva davant de qualsevol problema de seguretat o convivència.

Tracte humà i empatia: Una actitud d'escolta, respecte, educació i fermesa, tractant les persones amb la consideració que mereixen en situacions vulnerables.

Exemplaritat: Un comportament ètic impecable, tant de servei com fora d'ell, transmetent confiança i neutralitat.`,
      consellOposicat: "Recordeu que el Codi Ètic de la PGME estableix que la confiança ciutadana és el pilar indispensable de l'eficàcia policial.",
      competenciesAvaluades: ["Orientació de servei a la ciutadania", "Habilitats socials i comunicatives", "Compromís amb l'organització"]
    },
    {
      id: 'bio-pg-5',
      bloc: 'pgme',
      pregunta: "Quina especialitat és la que més li agradaria treballar dins del cos a llarg termini?",
      respostaModel: `Prioritat actual: Ara mateix la meva prioritat absoluta és ser un bon agent de seguretat ciutadana i dominar el servei bàsic a comissaria.

Especialitat futura: A llarg termini, m'atrau l'àrea d'Investigació / Trànsit / Seguretat Ciutadana de Proximitat (tria una segons el teu perfil) per la complexitat analítica i el seguiment dels casos.

Evolució natural: Assumiré l'opció d'especialitzar-me quan tingui l'experiència de carrer necessària i hagi demostrat la meva solidesa en el cos.`,
      consellOposicat: "Demostreu interès per la progressió professional, però deixeu molt clar que esteu 100% compromesos amb la destinació que us assigni el cos.",
      competenciesAvaluades: ["Adaptabilitat i flexibilitat", "Compromís amb l'organització", "Iniciativa i autonomia"]
    },
    {
      id: 'bio-pg-6',
      bloc: 'pgme',
      pregunta: "Què faria si patrullant en un binomi el seu company comet una irregularitat greu o un intent de suborn?",
      respostaModel: `Aturar l'acció: Intervenir immediatament de forma ferma per tallar la conducta il·legal o rebutjar de ple el suborn en el mateix moment.

Imperatiu legal i ètic: Recordar que l'interès públic i el compliment de la llei estan per sobre de qualsevol camaderia o corporativisme.

Rendició de comptes: Informar de forma immediata i detallada al superior jeràrquic del que ha succeït, complint amb el Codi Deontològic i el deure d'agent de l'autoritat.`,
      consellOposicat: "Davant d'una falta ètica o delicte flagrant, la lleialtat és cap a la institució, la ciutadania i la legalitat. Mai dubteu en aquesta resposta.",
      competenciesAvaluades: ["Compromís amb l'organització", "Autogestió i creixement personal", "Autocontrol i gestió de l'estrès"]
    }
  ];

  const [preguntes, setPreguntes] = useState<PreguntaBiograficaItem[]>(preguntesPerDefecte);

  // Carregar preguntes addicionals de Firestore si l'administrador n'ha afegit de noves
  useEffect(() => {
    const carregarPreguntesBBDD = async () => {
      try {
        const [snapDp, snapPer, snapLab, snapPg] = await Promise.all([
          getDocs(query(collection(db, "preguntes_biodata_dades_personals"))),
          getDocs(query(collection(db, "preguntes_biodata_personals"))),
          getDocs(query(collection(db, "preguntes_biodata_laborals"))),
          getDocs(query(collection(db, "preguntes_biodata_pgme")))
        ]);

        const extrets: PreguntaBiograficaItem[] = [];

        snapDp.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-dp-${docSnap.id}`,
              bloc: 'dades_personals',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Dades de context i filiació"],
              docId: docSnap.id
            });
          }
        });

        snapPer.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-per-${docSnap.id}`,
              bloc: 'personals',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Autogestió i creixement personal", "Autocontrol i gestió de l'estrès"],
              docId: docSnap.id
            });
          }
        });

        snapLab.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-lab-${docSnap.id}`,
              bloc: 'laborals',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Treball en equip i col·laboració", "Eficiència i qualitat"],
              docId: docSnap.id
            });
          }
        });

        snapPg.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-pg-${docSnap.id}`,
              bloc: 'pgme',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Orientació de servei a la ciutadania", "Compromís amb l'organització"],
              docId: docSnap.id
            });
          }
        });

        if (extrets.length > 0) {
          // Fusionem preguntes per defecte amb les de la BBDD sense duplicar preguntes amb text idèntic
          const mapPerText = new Map<string, PreguntaBiograficaItem>();
          preguntesPerDefecte.forEach(p => mapPerText.set(p.pregunta.trim().toLowerCase(), p));
          extrets.forEach(p => mapPerText.set(p.pregunta.trim().toLowerCase(), p));
          setPreguntes(Array.from(mapPerText.values()));
        }
      } catch (err) {
        console.warn("Connexió amb Firestore opcional per a preguntes de biogràfic:", err);
      }
    };

    carregarPreguntesBBDD();
  }, []);

  // =========================================================================
  // ESTATS PER A LA GESTIÓ DELS 3 NOUS BLOCS DE CADA TARGETA
  // =========================================================================
  // Estat de l'usuari actual de Firebase Auth
  const [usuari, setUsuari] = useState<FirebaseUser | null>(auth.currentUser);

  // Control de visibilitat dels 2 blocs desplegables (ocults per defecte)
  const [respostesOrientativesObertes, setRespostesOrientativesObertes] = useState<Record<string, boolean>>({});
  const [competenciesObertes, setCompetenciesObertes] = useState<Record<string, boolean>>({});

  // Estat de la resposta de l'alumne (la seva xuleta personal)
  const [respostesAlumnes, setRespostesAlumnes] = useState<Record<string, string>>({});

  // Estat de les competències seleccionades per l'alumne per a cada pregunta (interactiu i guardat a BBDD)
  const [competenciesSeleccionades, setCompetenciesSeleccionades] = useState<Record<string, string[]>>({});

  // Estat del procés de desat a la base de dades (Firestore) per a cada pregunta
  const [estatsGuardat, setEstatsGuardat] = useState<Record<string, 'idle' | 'desant' | 'desat' | 'error'>>({});

  // Carregar respostes personals i competències triades per l'alumne (primer del LocalStorage i després sincronitzat amb Firestore)
  useEffect(() => {
    // 1. Càrrega immediata des de la memòria local del navegador
    const cacheLocal: Record<string, string> = {};
    const cacheCompLocal: Record<string, string[]> = {};
    preguntes.forEach(p => {
      try {
        const textLocal = localStorage.getItem(`oposicat_bio_resposta_${p.id}`);
        if (textLocal) {
          cacheLocal[p.id] = textLocal;
        }
        const compLocal = localStorage.getItem(`oposicat_bio_comp_${p.id}`);
        if (compLocal) {
          const parsed = JSON.parse(compLocal);
          if (Array.isArray(parsed)) {
            cacheCompLocal[p.id] = parsed;
          }
        }
      } catch (e) {
        // Ignorem fallades de memòria privada
      }
    });
    if (Object.keys(cacheLocal).length > 0) {
      setRespostesAlumnes(prev => ({ ...cacheLocal, ...prev }));
    }
    if (Object.keys(cacheCompLocal).length > 0) {
      setCompetenciesSeleccionades(prev => ({ ...cacheCompLocal, ...prev }));
    }

    // 2. Sincronització amb la col·lecció privada de l'alumne a Firestore
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUsuari(u);
      if (u) {
        try {
          const colRef = collection(db, 'usuaris', u.uid, 'respostes_questionari_biografic');
          const snap = await getDocs(colRef);
          const mapaBBDD: Record<string, string> = {};
          const mapaCompBBDD: Record<string, string[]> = {};
          snap.forEach(d => {
            const data = d.data();
            if (data && typeof data.respostaAlumne === 'string') {
              mapaBBDD[d.id] = data.respostaAlumne;
              try {
                localStorage.setItem(`oposicat_bio_resposta_${d.id}`, data.respostaAlumne);
              } catch (e) {
                // Ignore
              }
            }
            if (data && Array.isArray(data.competenciesSeleccionades)) {
              mapaCompBBDD[d.id] = data.competenciesSeleccionades;
              try {
                localStorage.setItem(`oposicat_bio_comp_${d.id}`, JSON.stringify(data.competenciesSeleccionades));
              } catch (e) {
                // Ignore
              }
            }
          });
          if (Object.keys(mapaBBDD).length > 0) {
            setRespostesAlumnes(prev => ({ ...prev, ...mapaBBDD }));
          }
          if (Object.keys(mapaCompBBDD).length > 0) {
            setCompetenciesSeleccionades(prev => ({ ...prev, ...mapaCompBBDD }));
          }
        } catch (err) {
          console.warn("Avís en carregar respostes i competències del qüestionari biogràfic des de Firestore:", err);
        }
      }
    });

    return () => unsub();
  }, [preguntes.length]);

  // Alternar desplegament de la resposta orientativa d'una targeta (oculta per defecte)
  const toggleRespostaOrientativa = (id: string) => {
    setRespostesOrientativesObertes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Alternar desplegament de les competències clau involucrades (ocultes per defecte)
  const toggleCompetencies = (id: string) => {
    setCompetenciesObertes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Actualitzar text de la resposta de l'alumne en temps real
  const actualitzarTextResposta = (id: string, nouText: string) => {
    setRespostesAlumnes(prev => ({
      ...prev,
      [id]: nouText
    }));
    try {
      localStorage.setItem(`oposicat_bio_resposta_${id}`, nouText);
    } catch (e) {
      // Ignore
    }
  };

  // Seleccionar o deseleccionar una competència clau per part de l'alumne
  const toggleCompetenciaAlumne = async (preguntaId: string, competencia: string) => {
    const llistaActual = competenciesSeleccionades[preguntaId] || [];
    const jaExisteix = llistaActual.includes(competencia);
    const novaLlista = jaExisteix
      ? llistaActual.filter(c => c !== competencia)
      : [...llistaActual, competencia];

    setCompetenciesSeleccionades(prev => ({
      ...prev,
      [preguntaId]: novaLlista
    }));

    // Persistència immediata al navegador
    try {
      localStorage.setItem(`oposicat_bio_comp_${preguntaId}`, JSON.stringify(novaLlista));
    } catch (e) {
      // Ignore
    }

    // Persistència a Firestore automàtica al compte de l'alumne
    const user = auth.currentUser || usuari;
    if (user) {
      try {
        const docRef = doc(db, 'usuaris', user.uid, 'respostes_questionari_biografic', preguntaId);
        await setDoc(docRef, {
          preguntaId,
          competenciesSeleccionades: novaLlista,
          actualitzatEl: new Date().toISOString(),
          userId: user.uid
        }, { merge: true });
      } catch (err) {
        console.warn("Avís guardant selecció de competències a Firestore:", err);
      }
    }
  };

  // Desmarcar totes les competències seleccionades d'una pregunta
  const netejarCompetenciesAlumne = async (preguntaId: string) => {
    setCompetenciesSeleccionades(prev => ({
      ...prev,
      [preguntaId]: []
    }));

    try {
      localStorage.setItem(`oposicat_bio_comp_${preguntaId}`, JSON.stringify([]));
    } catch (e) {
      // Ignore
    }

    const user = auth.currentUser || usuari;
    if (user) {
      try {
        const docRef = doc(db, 'usuaris', user.uid, 'respostes_questionari_biografic', preguntaId);
        await setDoc(docRef, {
          preguntaId,
          competenciesSeleccionades: [],
          actualitzatEl: new Date().toISOString(),
          userId: user.uid
        }, { merge: true });
      } catch (err) {
        console.warn("Avís netejant competències a Firestore:", err);
      }
    }
  };

  // Desar la resposta a Firestore i actualitzar estat visual
  const desarResposta = async (preguntaId: string) => {
    const textADesar = respostesAlumnes[preguntaId] || '';
    const compTriades = competenciesSeleccionades[preguntaId] || [];
    setEstatsGuardat(prev => ({ ...prev, [preguntaId]: 'desant' }));

    // Persistència local immediata de seguretat
    try {
      localStorage.setItem(`oposicat_bio_resposta_${preguntaId}`, textADesar);
      localStorage.setItem(`oposicat_bio_comp_${preguntaId}`, JSON.stringify(compTriades));
    } catch (e) {
      // Ignore
    }

    try {
      const user = auth.currentUser || usuari;
      if (user) {
        const docRef = doc(db, 'usuaris', user.uid, 'respostes_questionari_biografic', preguntaId);
        await setDoc(docRef, {
          preguntaId,
          respostaAlumne: textADesar,
          competenciesSeleccionades: compTriades,
          actualitzatEl: new Date().toISOString(),
          userId: user.uid
        }, { merge: true });
      }

      setEstatsGuardat(prev => ({ ...prev, [preguntaId]: 'desat' }));
      setTimeout(() => {
        setEstatsGuardat(prev => ({ ...prev, [preguntaId]: 'idle' }));
      }, 3500);
    } catch (err) {
      console.error("Error desant a Firestore:", err);
      // Fins i tot si falla el servidor temporalment, confirmem l'èxit de la còpia local
      setEstatsGuardat(prev => ({ ...prev, [preguntaId]: 'desat' }));
      setTimeout(() => {
        setEstatsGuardat(prev => ({ ...prev, [preguntaId]: 'idle' }));
      }, 3500);
    }
  };

  // Comprova si una competència de les 10 oficials està involucrada en la pregunta actual
  const comprovarCompetenciaInvolucrada = (compOficial: string, llistaAvaluades?: string[]): boolean => {
    if (!llistaAvaluades || llistaAvaluades.length === 0) return false;
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const cNorm = norm(compOficial);

    return llistaAvaluades.some(av => {
      const aNorm = norm(av);
      if (cNorm === aNorm) return true;
      if (cNorm.includes(aNorm) || aNorm.includes(cNorm)) return true;
      if (cNorm.includes('social') && aNorm.includes('social')) return true;
      if (cNorm.includes('ciutadania') && aNorm.includes('ciutadania')) return true;
      if (cNorm.includes('equip') && aNorm.includes('equip')) return true;
      if (cNorm.includes('adaptabilitat') && aNorm.includes('adaptabilitat')) return true;
      if (cNorm.includes('autocontrol') && aNorm.includes('autocontrol')) return true;
      if (cNorm.includes('autogestio') && aNorm.includes('autogestio')) return true;
      if (cNorm.includes('compromis') && aNorm.includes('compromis')) return true;
      if (cNorm.includes('eficiencia') && (aNorm.includes('eficiencia') || aNorm.includes('qualitat'))) return true;
      if (cNorm.includes('resolucio') && aNorm.includes('resolucio')) return true;
      if (cNorm.includes('iniciativa') && aNorm.includes('iniciativa')) return true;
      return false;
    });
  };

  // Auxiliar per comptar caràcters i paraules
  const comptadorText = (text: string) => {
    const caracters = text.length;
    const paraules = text.trim() ? text.trim().split(/\s+/).length : 0;
    return `${paraules} ${paraules === 1 ? 'paraula' : 'paraules'} · ${caracters} caràcters`;
  };
  const countDadesPersonals = preguntes.filter(p => p.bloc === 'dades_personals').length;
  const countPersonals = preguntes.filter(p => p.bloc === 'personals').length;
  const countLaborals = preguntes.filter(p => p.bloc === 'laborals').length;
  const countPgme = preguntes.filter(p => p.bloc === 'pgme').length;

  // Alternar desplegament d'una targeta
  const toggleTargeta = (id: string) => {
    if (obertes.includes(id)) {
      setObertes(obertes.filter(item => item !== id));
    } else {
      setObertes([...obertes, id]);
    }
  };

  // Desplegar o plegar totes les targetes filtrades
  const desplegarTotes = () => {
    const idsFiltrats = preguntesFiltrades.map(p => p.id);
    if (obertes.length === idsFiltrats.length) {
      setObertes([]);
    } else {
      setObertes(idsFiltrats);
    }
  };

  // Filtrar per bloc i per cerca
  const preguntesFiltrades = preguntes.filter(p => {
    // Filtre per bloc
    if (blocActiu !== 'tots' && p.bloc !== blocActiu) {
      return false;
    }
    // Filtre per text de cerca
    if (cerca.trim()) {
      const queryText = cerca.toLowerCase();
      const matchPregunta = p.pregunta.toLowerCase().includes(queryText);
      const matchResposta = p.respostaModel?.toLowerCase().includes(queryText) || false;
      const matchConsell = p.consellOposicat?.toLowerCase().includes(queryText) || false;
      const matchComp = p.competenciesAvaluades?.some(c => c.toLowerCase().includes(queryText)) || false;
      const matchAlumne = respostesAlumnes[p.id]?.toLowerCase().includes(queryText) || false;
      const matchCompAlumne = (competenciesSeleccionades[p.id] || []).some(c => c.toLowerCase().includes(queryText));
      return matchPregunta || matchResposta || matchConsell || matchComp || matchAlumne || matchCompAlumne;
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 text-left font-sans pb-10">
      
      {/* ========================================================================= */}
      {/* 1. TÍTOL ÚNIC I NET */}
      {/* ========================================================================= */}
      <div className="pt-2 pb-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          ENTÈN I PRACTICA EL QÜESTIONARI BIOGRÀFIC
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* 2. SISTEMA DE PREGUNTES I RESPOSTES (FAQ DIDÀCTIC) */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800/70 pb-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-black text-sm sm:text-base uppercase tracking-wider">
              GUIA RÀPIDA DEL QÜESTIONARI BIOGRÀFIC
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Tot el que necessites saber per la 1 prova de l'examen psicoprofessional en 6 ràpides targetes.
            </p>
          </div>
        </div>

        {/* Llistat de Preguntes i Respostes directes (tots els títols en blau fort unificat) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* FAQ 1: Com és la prova */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              COM ÉS LA PROVA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Prova escrita a desenvolupar de 4 blocs principals.
            </p>
          </div>

          {/* FAQ 2: Quant dura */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              QUANT DURA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Dura 25 minuts.
            </p>
          </div>

          {/* FAQ 3: Què trobaré a l'examen */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              QUÈ TROBARÉ A L'EXAMEN?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              L'examen conté 4 planes. Cada plana conté preguntes relacionades amb cada bloc.
            </p>
          </div>

          {/* FAQ 4: S'avaluen les competències clau */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              EN AQUEST PUNT JA S'AVALUEN LES COMPETÈNCIES CLAU?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              En algunes de les preguntes sí, en altres només és informació per donar context a l'entrevista.
            </p>
          </div>

          {/* FAQ 5: Quins blocs hi ha */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              QUINS BLOCS HI HA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Dades Personals, Àmbit Personal, Trajectòria Laboral i Cultura PG-ME.
            </p>
          </div>

          {/* FAQ 6: On es fa la prova */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              ON ES FA LA PROVA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Normalment i els últims anys s'ha fet a la UAB (Universitat Autònoma de Barcelona) els dies que sortiran publicats al web de la Generalitat.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ELS 4 BLOCS TEMÀTICS D'IGUAL MIDA EN GRAELLA (4 AL COSTAT DE L'ALTRE) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <span className="text-xs sm:text-sm font-black uppercase text-slate-300 tracking-wider">
            SELECCIONA UN BLOC TEMÀTIC QUE EXPLORAR I PRACTICAR :
          </span>
          <button
            onClick={() => setBlocActiu('tots')}
            className={`text-xs font-bold font-mono uppercase px-3.5 py-1.5 rounded-lg transition-all self-start sm:self-auto cursor-pointer ${
              blocActiu === 'tots'
                ? 'bg-[#FFDF00] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
            }`}
          >
            Veure tots ({preguntes.length})
          </button>
        </div>

        {/* Graella de 4 blocs del mateix tamany, un al costat de l'altre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* BLOC 1: DADES PERSONALS */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'dades_personals' ? 'tots' : 'dades_personals')}
            id="btn-bloc-dades-personals"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'dades_personals'
                ? 'bg-purple-950/80 border-purple-400 shadow-xl shadow-purple-950/30 ring-1 ring-purple-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-purple-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-purple-300 transition-colors">
                DADES PERSONALS
              </span>
            </div>
            <span className="text-purple-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              INFORMACIÓ I CONTEXT · {countDadesPersonals} PREGUNTES
            </span>
          </button>

          {/* BLOC 2: PREGUNTES PERSONALS */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'personals' ? 'tots' : 'personals')}
            id="btn-bloc-preguntes-personals"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'personals'
                ? 'bg-blue-950/80 border-cyan-400 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-cyan-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-cyan-300 transition-colors">
                PREGUNTES PERSONALS
              </span>
            </div>
            <span className="text-cyan-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              AUTOCONEIXEMENT I PASSAT · {countPersonals} PREGUNTES
            </span>
          </button>

          {/* BLOC 3: PREGUNTES LABORALS */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'laborals' ? 'tots' : 'laborals')}
            id="btn-bloc-preguntes-laborals"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'laborals'
                ? 'bg-amber-950/80 border-amber-400 shadow-xl shadow-amber-950/30 ring-1 ring-amber-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-amber-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                PREGUNTES LABORALS
              </span>
            </div>
            <span className="text-amber-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              EXPERIÈNCIA I TRAJECTÒRIA · {countLaborals} PREGUNTES
            </span>
          </button>

          {/* BLOC 4: PREGUNTES DE PGME */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'pgme' ? 'tots' : 'pgme')}
            id="btn-bloc-preguntes-pgme"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'pgme'
                ? 'bg-emerald-950/80 border-emerald-400 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-emerald-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-emerald-300 transition-colors">
                PREGUNTES DE PGME
              </span>
            </div>
            <span className="text-emerald-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              VALORS I CULTURA MOSSO · {countPgme} PREGUNTES
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BARRA D'EINES: CERCADOR + BOTÓ PONT PLEGAR/DESPLEGAR */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Cercador ràpid */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cerca per pregunta, consell o concepte clau..."
            className="w-full bg-[#020b18] border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          {cerca && (
            <button
              onClick={() => setCerca('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Botó per desplegar o plegar tot */}
        <button
          onClick={desplegarTotes}
          className="inline-flex items-center justify-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {obertes.length === preguntesFiltrades.length && preguntesFiltrades.length > 0
              ? 'Plegar totes' 
              : 'Desplegar totes'}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. LLISTAT DE TARGETES DE PREGUNTES INTERACTIVES */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        {preguntesFiltrades.map((item) => {
          const estaOberta = obertes.includes(item.id);

          // Determinació d'estil i colors segons el bloc temàtic
          const dotColor = 
            item.bloc === 'dades_personals' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.7)]' :
            item.bloc === 'personals' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]' :
            item.bloc === 'laborals' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]' :
            'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]';

          const badgeText =
            item.bloc === 'dades_personals' ? 'DADES PERSONALS I CONTEXT' :
            item.bloc === 'personals' ? 'ÀMBIT PERSONAL' :
            item.bloc === 'laborals' ? 'TRAJECTÒRIA LABORAL' :
            'CULTURA PG-ME';

          const badgeStyle =
            item.bloc === 'dades_personals' ? 'text-purple-300 bg-purple-500/10 border-purple-400/20' :
            item.bloc === 'personals' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-400/20' :
            item.bloc === 'laborals' ? 'text-amber-400 bg-amber-500/10 border-amber-400/20' :
            'text-emerald-400 bg-emerald-500/10 border-emerald-400/20';

          return (
            <div
              key={item.id}
              className={`bg-[#0c1424] rounded-2xl border transition-all duration-200 shadow-lg ${
                estaOberta 
                  ? 'border-cyan-500/40 shadow-cyan-950/20' 
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Capçalera de la targeta (feta clicable) */}
              <button
                onClick={() => toggleTargeta(item.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                  {/* Punt brillant corporatiu */}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </div>

                    <h3 className="text-white font-extrabold text-sm sm:text-base tracking-wide group-hover:text-cyan-300 transition-colors leading-snug">
                      "{item.pregunta}"
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    estaOberta 
                      ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 rotate-180' 
                      : 'bg-[#020b18] border-slate-800 text-slate-400 group-hover:text-white'
                  }`}>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  </div>
                </div>
              </button>

              {/* Cos desplegable de la targeta */}
              {estaOberta && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-slate-800/80 animate-in fade-in duration-150 space-y-4">
                  
                  {/* ================================================================= */}
                  {/* 1. BLOC: RESPOSTA ORIENTATIVA (Oculta per defecte) */}
                  {/* ================================================================= */}
                  <div className="pt-3.5 space-y-2">
                    <button
                      type="button"
                      onClick={() => toggleRespostaOrientativa(item.id)}
                      className="w-full flex items-center justify-between p-3.5 bg-[#020b18] hover:bg-slate-900/90 border border-cyan-500/25 hover:border-cyan-400/40 rounded-xl transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-cyan-300 block">
                            Resposta orientativa
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Model de referència recomanat per OposiCAT per a la defensa de la pregunta
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500/20 transition-all">
                          {respostesOrientativesObertes[item.id] ? 'Amagar resposta' : 'Fes clic per veure-la'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${
                          respostesOrientativesObertes[item.id] ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </button>

                    {respostesOrientativesObertes[item.id] && (
                      <div className="p-4 sm:p-5 bg-[#020b18] border border-cyan-500/20 rounded-xl text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 animate-in fade-in duration-200 shadow-inner">
                        <FormatadorRespostaModel text={item.respostaModel || ''} />
                        {item.consellOposicat && (
                          <div className="pt-2.5 border-t border-slate-800/80 flex items-start gap-2.5 text-[11.5px] text-amber-300/90 leading-normal not-italic">
                            <span className="font-black text-[#FFDF00] shrink-0 font-mono text-[10px] uppercase px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              Consell Clau
                            </span>
                            <span>{item.consellOposicat}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ================================================================= */}
                  {/* 2. BLOC: COMPETÈNCIES CLAU INVOLUCRADES (Seleccionades per l'alumne) */}
                  {/* ================================================================= */}
                  <div className="space-y-2">
                    {/* Botó capçalera per desplegar les competències */}
                    <button
                      type="button"
                      onClick={() => toggleCompetencies(item.id)}
                      className="w-full flex items-center justify-between p-3.5 bg-[#020b18] hover:bg-slate-900/90 border border-emerald-500/25 hover:border-emerald-400/40 rounded-xl transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block">
                              Competències clau involucrades
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border transition-all ${
                              (competenciesSeleccionades[item.id] || []).length > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-800/80 text-slate-400 border-slate-700/80'
                            }`}>
                              {(competenciesSeleccionades[item.id] || []).length > 0
                                ? `${(competenciesSeleccionades[item.id] || []).length} triades per tu`
                                : 'Tria les teves'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Fes clic per seleccionar quines competències de l'ISPC consideres que avalua el tribunal
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/20 transition-all">
                          {competenciesObertes[item.id] ? 'Amagar competències' : 'Fes clic per triar-les'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${
                          competenciesObertes[item.id] ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </button>

                    {/* Contingut desplegable interactiu */}
                    {competenciesObertes[item.id] && (
                      <div className="p-4 sm:p-5 bg-[#020b18] border border-emerald-500/20 rounded-xl space-y-3.5 animate-in fade-in duration-200 shadow-inner">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <p className="text-xs text-slate-300">
                            Fes clic sobre les competències que consideris que estan involucrades en aquesta pregunta:
                          </p>
                          <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{(competenciesSeleccionades[item.id] || []).length} seleccionades per tu</span>
                          </span>
                        </div>

                        {/* Graella interactiva de 2 columnes amb els 10 botons seleccionables */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {COMPETENCIES_OFICIALS_ISPC.map((comp, idx) => {
                            const triada = (competenciesSeleccionades[item.id] || []).includes(comp);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => toggleCompetenciaAlumne(item.id, comp)}
                                className={`px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all cursor-pointer text-left select-none ${
                                  triada
                                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100 font-bold shadow-sm shadow-emerald-950/40 ring-1 ring-emerald-400/50 hover:bg-emerald-900/60'
                                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/60'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10.5px] font-black transition-colors ${
                                    triada ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {triada ? '✓' : idx + 1}
                                  </span>
                                  <span className="truncate">{comp}</span>
                                </div>
                                {triada ? (
                                  <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-md shrink-0">
                                    Triada
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono text-slate-600 hover:text-slate-400 shrink-0">
                                    Toca per triar
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Peu informatiu de desat i acció de netejar */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                            <span>Les teves competències seleccionades es desen automàticament a la teva fitxa personal.</span>
                          </div>
                          {(competenciesSeleccionades[item.id] || []).length > 0 && (
                            <button
                              type="button"
                              onClick={() => netejarCompetenciesAlumne(item.id)}
                              className="text-[10.5px] text-slate-500 hover:text-rose-400 underline transition-colors cursor-pointer self-end sm:self-auto"
                            >
                              Desmarcar totes
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ================================================================= */}
                  {/* 3. BLOC: RESPOSTA DE L'ALUMNE (La teva xuleta guardada a BBDD) */}
                  {/* ================================================================= */}
                  <div className="p-4 sm:p-5 bg-[#020b18] border border-amber-500/30 rounded-xl space-y-3.5 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                          <PenTool className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                            Resposta de l'alumne
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            La teva xuleta personal per preparar la defensa oral a l'entrevista
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-400 flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        <span>Sincronitzat amb la teva fitxa privada</span>
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      Redacta aquí la resposta que defensaràs a l'entrevista després de treballar-la amb l'equip docent d'OposiCAT. Aquesta serà la teva <strong className="text-amber-300">xuleta oficial</strong> que quedarà guardada al teu compte per repassar quan vulguis.
                    </p>

                    <div className="space-y-2.5">
                      <textarea
                        value={respostesAlumnes[item.id] || ''}
                        onChange={(e) => actualitzarTextResposta(item.id, e.target.value)}
                        rows={4}
                        placeholder="Escriu aquí la teva resposta redactada amb les teves pròpies paraules, situacions reals viscudes i arguments sòlids..."
                        className="w-full bg-[#071120] border border-slate-700/80 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all leading-relaxed resize-y min-h-[105px]"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                        <div className="text-[10.5px] text-slate-400 font-mono flex items-center gap-2">
                          <Bookmark className="w-3.5 h-3.5 text-amber-400/70" />
                          <span>{comptadorText(respostesAlumnes[item.id] || '')}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          {estatsGuardat[item.id] === 'desat' && (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>✓ Resposta desada a la teva fitxa!</span>
                            </span>
                          )}
                          {estatsGuardat[item.id] === 'desant' && (
                            <span className="text-xs font-medium text-amber-300 flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Desant a la base de dades...</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => desarResposta(item.id)}
                            disabled={estatsGuardat[item.id] === 'desant'}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Desar la meva resposta</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {preguntesFiltrades.length === 0 && (
          <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-8 text-center space-y-3">
            <p className="text-slate-400 text-xs">
              No s'ha trobat cap pregunta amb el terme <strong className="text-white">"{cerca}"</strong>.
            </p>
            <button
              onClick={() => {
                setCerca('');
                setBlocActiu('tots');
              }}
              className="text-xs text-cyan-400 hover:underline font-bold uppercase"
            >
              Restablir tots els filtres
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. TARGETA DE CLOENDA DIDÀCTICA: CRIDA A L'ACCIÓ */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#0c1424] to-[#020b18] rounded-2xl border border-[#FFDF00]/25 p-6 sm:p-7 shadow-2xl space-y-5 text-center sm:text-left">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            <h4 className="text-white font-black text-sm sm:text-base uppercase tracking-tight">
              Posa en pràctica el teu Qüestionari Biogràfic amb el Test Biodata o una sessió d'Entrevista Personal.
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Entrena el teu discurs i les teves respostes per arribar a l'entrevista oral amb la màxima seguretat.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Botó 1: Practicar Test Biodata */}
            <button
              id="btn-practicar-biodata-des-de-biografic"
              onClick={() => {
                if (onAnarBiodata) {
                  onAnarBiodata();
                } else {
                  onTornar();
                }
              }}
              className="bg-[#FFDF00] hover:bg-yellow-400 active:scale-95 text-slate-950 font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 cursor-pointer border border-yellow-300/40"
            >
              Practicar Test Biodata
            </button>

            {/* Botó 2: Practicar Entrevista */}
            <button
              id="btn-practicar-entrevista-des-de-biografic"
              onClick={() => {
                if (onAnarEntrevista) {
                  onAnarEntrevista();
                } else {
                  onTornar();
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-blue-600/20 transition-all duration-200 cursor-pointer border border-blue-400/30"
            >
              Practicar Entrevista
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. BOTONS DE NAVEGACIÓ INFERIOR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        <button
          onClick={onTornar}
          className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-cyan-500/40 hover:text-cyan-400 duration-200 cursor-pointer"
          id="btn-tornar-menu-biodata-inferior-biografic"
        >
          <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Tornar a la Prova Biodata</span>
        </button>

        <button
          onClick={onTornarMenuPrincipal}
          className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-slate-400 active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
          id="btn-tornar-menu-principal-inferior-biografic"
        >
          <span>Menú principal</span>
        </button>
      </div>

    </div>
  );
};

