import React, { useState } from "react";
import { db } from "../../lib/firebase";
import { 
  collectionGroup, 
  collection, 
  getDocs, 
  query, 
  limit, 
  startAfter, 
  DocumentData, 
  QueryDocumentSnapshot 
} from "firebase/firestore";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

// ============================================================================
// COMPONENT: BotoExportarExcelPreguntes
// Explicació per a no-programadors:
// Aquest component afegeix un botó segur i de NOMÉS LECTURA al Banc de Preguntes.
// Quan un administrador hi fa clic, l'aplicació connecta amb la base de dades Firestore,
// descarrega una còpia de totes les preguntes oficials de la teoria (sense tocar ni alterar res),
// les endreça en columnes i descarrega automàticament un fitxer de full de càlcul .xlsx (Excel).
// També mostra a sota el recompte exacte de preguntes per comprovar que no se'n perdi cap.
// ============================================================================

interface PropsBotoExportarExcelPreguntes {
  // El rol de l'usuari que ha iniciat sessió (per exemple: admin_master, admin, etc.)
  userRol?: string;
  // Els permisos granulars atorgats a aquest perfil
  userPermisos?: Record<string, boolean>;
  // Llista de preguntes que ja estan carregades a la pantalla com a referència
  preguntesCarregades?: any[];
  // Si la interfície està en mode fosc o clar
  darkMode?: boolean;
}

export default function BotoExportarExcelPreguntes({
  userRol,
  userPermisos,
  preguntesCarregades = [],
  darkMode = false
}: PropsBotoExportarExcelPreguntes) {
  // Estat per indicar si s'està descarregant i generant l'Excel
  const [exportant, setExportant] = useState(false);
  // Estat per guardar el missatge amb el recompte de preguntes exportades
  const [missatgeRecompte, setMissatgeRecompte] = useState<string | null>(null);
  // Estat per mostrar un error detallat si Firestore o els permisos fallen
  const [errorExportacio, setErrorExportacio] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // CONDICIÓ DE SEGURETAT: Només visible per a rols d'administració
  // Explicació per a no-programadors:
  // Si l'usuari no és administrador (és a dir, no té rol 'admin_master', 'admin'
  // o el permís 'gestioPreguntesTeoria'), aquest botó directament no es dibuixa a la pantalla.
  // --------------------------------------------------------------------------
  const esAdministrador = 
    userRol === "admin_master" || 
    userRol === "admin" || 
    Boolean(userPermisos?.gestioPreguntesTeoria) || 
    Boolean(userRol && userRol.toLowerCase().includes("admin"));

  if (!esAdministrador) {
    return null;
  }

  // --------------------------------------------------------------------------
  // FUNCIÓ: Netajar i protegir cadenes de text contra injecció de fórmules Excel
  // Explicació per a no-programadors:
  // Si una pregunta comença amb caràcters com '=', '+', '-' o '@', l'Excel podria
  // interpretar-la com una fórmula matemàtica i donar error. Aquesta funció garanteix
  // que tot es tracti com a text pur, respectant accents catalans, cometes i salts de línia.
  // --------------------------------------------------------------------------
  const prepararTextSegur = (text: any): string => {
    if (text === null || text === undefined) return "";
    let cadena = String(text);
    // Si comença amb símbols de fórmula matemàtica, afegim un apòstrof al davant
    // perquè Excel l'interpreti estrictament com a text net.
    if (/^[=+@-]/.test(cadena)) {
      cadena = "'" + cadena;
    }
    return cadena;
  };

  // --------------------------------------------------------------------------
  // FUNCIÓ: Convertir l'índex o lletra de resposta correcta al format A / B / C / D
  // Explicació per a no-programadors:
  // A la base de dades la resposta correcta sovint es guarda com a número (0 per la A,
  // 1 per la B, 2 per la C, 3 per la D). Aquesta funció la tradueix sempre a la lletra oficial.
  // --------------------------------------------------------------------------
  const formatarRespostaCorrecta = (correcta: any): string => {
    if (correcta === 0 || correcta === "0" || correcta === "A" || correcta === "a") return "A";
    if (correcta === 1 || correcta === "1" || correcta === "B" || correcta === "b") return "B";
    if (correcta === 2 || correcta === "2" || correcta === "C" || correcta === "c") return "C";
    if (correcta === 3 || correcta === "3" || correcta === "D" || correcta === "d") return "D";
    if (typeof correcta === "number" && correcta >= 0 && correcta <= 25) {
      return String.fromCharCode(65 + correcta);
    }
    return prepararTextSegur(correcta);
  };

  // --------------------------------------------------------------------------
  // FUNCIÓ: Formatar la data de creació de Firestore a text llegible
  // Explicació per a no-programadors:
  // Firestore desa les dates en format especial (Timestamp). Aquesta funció
  // la converteix a una data estàndard en format text (ex: 2026-03-30 14:22:00).
  // --------------------------------------------------------------------------
  const formatarDataCreacio = (dataObj: any): string => {
    if (!dataObj) return "";
    try {
      if (typeof dataObj.toDate === "function") {
        return dataObj.toDate().toISOString().replace("T", " ").substring(0, 19);
      }
      if (dataObj.seconds) {
        return new Date(dataObj.seconds * 1000).toISOString().replace("T", " ").substring(0, 19);
      }
      if (typeof dataObj === "string" || typeof dataObj === "number") {
        const d = new Date(dataObj);
        if (!isNaN(d.getTime())) {
          return d.toISOString().replace("T", " ").substring(0, 19);
        }
        return String(dataObj);
      }
    } catch {
      return "";
    }
    return "";
  };

  // --------------------------------------------------------------------------
  // FUNCIÓ PRINCIPAL: Descarregar preguntes i generar el fitxer .xlsx
  // Explicació per a no-programadors:
  // 1. Fa una petició de NOMÉS LECTURA a Firestore per obtenir totes les preguntes.
  // 2. Si la col·lecció té moltes preguntes, les llegeix amb paginació en paquets.
  // 3. Organitza les columnes exactes demanades.
  // 4. Construeix el full de càlcul i activa la descàrrega al navegador.
  // 5. Mostra el missatge amb el recompte exacte de preguntes.
  // --------------------------------------------------------------------------
  const handleExportarExcel = async () => {
    setExportant(true);
    setErrorExportacio(null);
    setMissatgeRecompte(null);

    try {
      // Mapa per guardar les preguntes sense duplicar per ID
      const preguntesMap = new Map<string, any>();

      // PAS 1: Llegim les preguntes noves de la col·lecció group 'preguntes_codificades'
      // Fem servir paginació en blocs de 200 per garantir que si la base de dades creix
      // no es talli cap registre.
      let ultimDocSnapshot: QueryDocumentSnapshot<DocumentData> | null = null;
      let hiHaMesPagines = true;
      const midaLot = 200;

      while (hiHaMesPagines) {
        let consulta = ultimDocSnapshot
          ? query(collectionGroup(db, "preguntes_codificades"), startAfter(ultimDocSnapshot), limit(midaLot))
          : query(collectionGroup(db, "preguntes_codificades"), limit(midaLot));

        const snapshot = await getDocs(consulta);
        if (snapshot.empty) {
          hiHaMesPagines = false;
        } else {
          snapshot.docs.forEach((d) => {
            preguntesMap.set(d.id, { id: d.id, fullPath: d.ref.path, ...d.data() });
          });
          ultimDocSnapshot = snapshot.docs[snapshot.docs.length - 1];
          // Si hem rebut menys preguntes que el límit del lot, vol dir que hem arribat al final
          if (snapshot.docs.length < midaLot) {
            hiHaMesPagines = false;
          }
        }
      }

      // PAS 2: Llegim les preguntes de la col·lecció històrica 'examens/mossos/preguntes'
      // que també formen part del banc de preguntes existent de l'aplicació.
      try {
        const snapAntigues = await getDocs(collection(db, "examens/mossos/preguntes"));
        snapAntigues.docs.forEach((d) => {
          if (!preguntesMap.has(d.id)) {
            preguntesMap.set(d.id, { id: d.id, fullPath: d.ref.path, ...d.data() });
          }
        });
      } catch (errAntigues) {
        console.warn("Avís en llegir examens/mossos/preguntes (pot estar buida o no requerida):", errAntigues);
      }

      // Si per qualsevol motiu de xarxa les peticions directes retornen menys preguntes
      // que les que ja teníem en memòria al tauler, afegim les que falten des de preguntesCarregades.
      preguntesCarregades.forEach((p) => {
        if (p?.id && !preguntesMap.has(p.id)) {
          preguntesMap.set(p.id, p);
        }
      });

      const llistaFinal = Array.from(preguntesMap.values());
      const totalBBDD = llistaFinal.length;

      // PAS 3: Construïm les files seguint l'ordre i els noms de columna exactes demanats:
      // 1. id_document
      // 2. enunciat
      // 3. opcio_A
      // 4. opcio_B
      // 5. opcio_C
      // 6. opcio_D
      // 7. resposta_correcta (A/B/C/D)
      // 8. feedback
      // 9. bloc
      // 10. tema
      // 11. capitol
      // 12. data_creacio
      const filesExcel = llistaFinal.map((p) => {
        const opcions = Array.isArray(p.opcions) ? p.opcions : [];
        return {
          id_document: prepararTextSegur(p.id),
          enunciat: prepararTextSegur(p.pregunta || p.enunciat || ""),
          opcio_A: prepararTextSegur(opcions[0] || ""),
          opcio_B: prepararTextSegur(opcions[1] || ""),
          opcio_C: prepararTextSegur(opcions[2] || ""),
          opcio_D: prepararTextSegur(opcions[3] || ""),
          resposta_correcta: formatarRespostaCorrecta(p.correcta),
          feedback: prepararTextSegur(p.explicacio || p.feedback || ""),
          bloc: prepararTextSegur(p.ambit || p.bloc || ""),
          tema: p.tema !== undefined ? prepararTextSegur(p.tema) : "",
          capitol: p.capitol !== undefined ? prepararTextSegur(p.capitol) : "",
          data_creacio: formatarDataCreacio(p.createdAt || p.data_creacio)
        };
      });

      // PAS 4: Creem el llibre de treball (Workbook) i el full (Worksheet) amb la llibreria xlsx
      const worksheet = XLSX.utils.json_to_sheet(filesExcel, {
        header: [
          "id_document",
          "enunciat",
          "opcio_A",
          "opcio_B",
          "opcio_C",
          "opcio_D",
          "resposta_correcta",
          "feedback",
          "bloc",
          "tema",
          "capitol",
          "data_creacio"
        ]
      });

      // Definim amplades generoses per a les columnes perquè cap text es vegi tallat
      worksheet["!cols"] = [
        { wch: 24 }, // id_document
        { wch: 60 }, // enunciat
        { wch: 35 }, // opcio_A
        { wch: 35 }, // opcio_B
        { wch: 35 }, // opcio_C
        { wch: 35 }, // opcio_D
        { wch: 18 }, // resposta_correcta
        { wch: 50 }, // feedback
        { wch: 10 }, // bloc
        { wch: 10 }, // tema
        { wch: 10 }, // capitol
        { wch: 22 }  // data_creacio
      ];

      // Forcem que totes les cel·les es guardin amb format text pur ('s') per preservar caràcters UTF-8 i salts de línia
      Object.keys(worksheet).forEach((clau) => {
        if (!clau.startsWith("!")) {
          const cela = worksheet[clau];
          if (cela && typeof cela === "object") {
            cela.t = "s"; // 's' significa Tipus Text (String) a l'especificació d'Excel
          }
        }
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Preguntes Teoria");

      // Nom del fitxer amb la data d'avui per tenir un registre clar
      const nomFitxer = `preguntes_mossos_teoria_${new Date().toISOString().substring(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, nomFitxer);

      // PAS 5: Mostrem el missatge de recompte sol·licitat
      const missatge = `S'han exportat ${filesExcel.length} preguntes de ${totalBBDD} a la base de dades`;
      setMissatgeRecompte(missatge);
    } catch (err: any) {
      console.error("Error durant l'exportació a Excel:", err);

      // Condició 7: Gestió clara dels errors de permisos de Firestore
      if (err?.code === "permission-denied" || err?.message?.includes("Missing or insufficient permissions")) {
        setErrorExportacio(
          "Permisos insuficients de Firestore: Les regles de seguretat ('firestore.rules') o el teu rol actual no autoritzen la lectura massiva de la col·lecció 'preguntes_codificades'. Si us plau, revisa els permisos del teu rol a la Gestió de Rols."
        );
      } else {
        setErrorExportacio(
          `S'ha produït un error en llegir de la base de dades: ${err?.message || "Error desconegut"}.`
        );
      }
    } finally {
      setExportant(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {/* BOTÓ D'EXPORTACIÓ */}
      <button
        type="button"
        onClick={handleExportarExcel}
        disabled={exportant}
        className={`px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
          exportant
            ? "opacity-60 cursor-not-allowed bg-slate-200 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
            : darkMode
            ? "bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800 text-emerald-400 hover:text-emerald-300"
            : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800"
        }`}
        title="Descarrega un fitxer Excel .xlsx amb totes les preguntes de la teoria guardades a Firestore"
      >
        {exportant ? (
          <>
            <Loader2 size={14} className="animate-spin text-emerald-500" />
            <span>Exportant preguntes a Excel...</span>
          </>
        ) : (
          <>
            <FileSpreadsheet size={14} className="text-emerald-500" />
            <span>Exportar preguntes a Excel</span>
            <Download size={12} className="opacity-70" />
          </>
        )}
      </button>

      {/* MISSATGE AMB EL RECOMPTE EXIGIT: "S'han exportat X preguntes de Y a la base de dades" */}
      {missatgeRecompte && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide ${
          darkMode ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
        }`}>
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <span>{missatgeRecompte}</span>
        </div>
      )}

      {/* MISSATGE D'ERROR EN CAS DE FALLIDA DE PERMISOS O BBDD */}
      {errorExportacio && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-[10px] font-bold max-w-md ${
          darkMode ? "bg-red-950/60 text-red-300 border border-red-800/60" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-black uppercase tracking-wider text-[9px] text-red-400">Avís de lectura Firestore:</span>
            <span className="leading-relaxed">{errorExportacio}</span>
          </div>
        </div>
      )}
    </div>
  );
}
