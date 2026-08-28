// Explicació per a no-programadors:
// Aquest fitxer defineix la definició de tipus de dades i àrees clau del test psicotècnic (Biodata) per a OposiCAT.
// Les preguntes ja no estan gravades a foc en el codi de l'aplicació per evitar incoherències, 
// sinó que es carreguen de forma completament directa des de la base de dades Firestore.

export interface RespostaPregunta {
  text: string;
  punts: number; // Puntuació de la competència principal
  multidimensional?: {
    HSC?: number;
    OSC?: number;
    TEC?: number;
    ADF?: number;
    AGE?: number;
    ACP?: number;
    CIO?: number;
    OAQ?: number;
    RDP?: number;
    IAA?: number;
  };
}

export interface PreguntaBiodata {
  id: number;
  enunciat: string;
  competencia: 'HSC' | 'OSC' | 'TEC' | 'ADF' | 'AGE' | 'ACP' | 'CIO' | 'OAQ' | 'RDP' | 'IAA';
  opcions: RespostaPregunta[];
  suspensa?: boolean;
}

export const MAP_COMPETENCIES = [
  { id: 'HSC', nomCurt: 'Habilitats Socials', nom: 'Habilitats socials i comunicatives', descripcio: 'Capacitat d\'expressió clara, empatia i diàleg assertiu en situacions quotidianes i de tensió.', resum: 'Empatia, diàleg i comunicació assertiva' },
  { id: 'OSC', nomCurt: 'Servei Ciutadania', nom: 'Orientació de servei a la ciutadania', descripcio: 'Vocació d\'ajuda, proximitat, empatia i voluntat sincera d\'assistir el ciutadà.', resum: 'Vocació d\'ajuda i proximitat al ciutadà' },
  { id: 'TEC', nomCurt: 'Treball en Equip', nom: 'Treball en equip i col·laboració', descripcio: 'Capacitat per col·laborar de forma activa i cohesionada amb altres membres del cos policial.', resum: 'Cohesió i suport mutu entre companys' },
  { id: 'ADF', nomCurt: 'Adaptabilitat', nom: 'Adaptabilitat i flexibilitat', descripcio: 'Flexibilitat mental i facilitat per afrontar canvis d\'entorn, torns o directrius sobtades.', resum: 'Flexibilitat davant canvis o imprevistos' },
  { id: 'AGE', nomCurt: 'Autocontrol i Estrès', nom: 'Autocontrol i gestió de l\'estrès', descripcio: 'Estabilitat emocional i control de l\'estrès sota pressió o provocació extrema.', resum: 'Mantenir la calma i control sota pressió' },
  { id: 'ACP', nomCurt: 'Autogestió Personal', nom: 'Autogestió i creixement personal', descripcio: 'Autocrítica constructiva, ganes d\'aprendre dels errors i manteniment d\'un alt rendiment.', resum: 'Aprendre d\'errors i superació personal' },
  { id: 'CIO', nomCurt: 'Compromís i Ètica', nom: 'Compromís/Identificació amb l\'organització', descripcio: 'Respecte a l\'estructura jeràrquica, compliment del codi ètic i lleialtat institucional.', resum: 'Ètica policial, jerarquia i lleialtat' },
  { id: 'OAQ', nomCurt: 'Qualitat i Rigor', nom: 'Orientació a la qualitat', descripcio: 'Atenció al detall, compliment estricte dels protocols i perfeccionament de les tasques assignades.', resum: 'Atenció al detall i compliment rigorós' },
  { id: 'RDP', nomCurt: 'Resolució de Problemes', nom: 'Resolució de problemes', descripcio: 'Habilitat per analitzar situacions complexes i trobar solucions eficients i realistes.', resum: 'Anàlisi de conflictes i solucions ràpides' },
  { id: 'IAA', nomCurt: 'Iniciativa i Autonomia', nom: 'Iniciativa i autonomia', descripcio: 'Proactivitat i resolució sense necessitar supervisió constant, actuant amb criteri.', resum: 'Proactivitat sense necessitar supervisió' }
] as const;
