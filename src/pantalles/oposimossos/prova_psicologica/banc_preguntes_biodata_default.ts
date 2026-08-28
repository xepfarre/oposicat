// Explicació per a no-programadors:
// Aquest fitxer conté el banc complet de 80 preguntes oficials de referència per al simulacre del Test Biodata.
// Està estructurat de manera que cadascuna de les 10 competències clau del perfil policial de Mossos d'Esquadra
// compta amb 8 preguntes situacionals realistes i 3 opcions de resposta (A, B, C) amb puntuació ponderada.
// Si la base de dades Firestore té noves preguntes carregades, l'aplicació prioritzarà les de la xarxa;
// en cas contrari, aquest fitxer garanteix que l'alumne sempre pugui realitzar el simulacre complet de 80 preguntes sense fallades.

import { PreguntaBiodata } from './preguntes_biodata';

export const BANC_80_PREGUNTES_BIODATA: PreguntaBiodata[] = [
  // =========================================================================
  // 1. HABILITATS SOCIALS I COMUNICATIVES (HSC) - Preguntes 1 a 8
  // =========================================================================
  {
    id: 1,
    competencia: 'HSC',
    enunciat: "Durant una intervenció al carrer, un ciutadà s'adreça a tu molt alterat i cridant perquè considera que la policia actua injustament amb una altra persona. Com reacciones?",
    opcions: [
      { text: "Mantingues la calma, utilitzes un to serè i ferm, i l'escoltes breument abans d'explicar el motiu de l'actuació per rebaixar la tensió.", punts: 1 },
      { text: "L'ignores completament per no perdre el temps i continues fent la teva feina sense donar-li cap tipus d'explicació.", punts: 0 },
      { text: "Li aixeques la veu d'immediat i l'adverteixes que si no calla serà sancionat per desobediència greu.", punts: -1 }
    ]
  },
  {
    id: 2,
    competencia: 'HSC',
    enunciat: "Quan has de comunicar una mala notícia a una família (per exemple, un accident greu), quina és la teva prioritat?",
    opcions: [
      { text: "Mostrar màxima empatia, respecte i claredat en el llenguatge, oferint suport continu i assegurant que han entès les primeres passes.", punts: 1 },
      { text: "Donar les dades tècniques de forma molt ràpida per acabar la conversa com més aviat millor i evitar el contacte emocional.", punts: 0 },
      { text: "Demanar a un altre company que ho faci perquè és una situació incòmoda que prefereixes no afrontar.", punts: -1 }
    ]
  },
  {
    id: 3,
    competencia: 'HSC',
    enunciat: "En una reunió d'equip, un company no està d'acord amb la teva proposta operativa i l'expressa de forma una mica brusca. Què fas?",
    opcions: [
      { text: "Escoltes els seus arguments amb atenció, demanes aclariments sense posar-te a la defensiva i busques punts de consens per a l'equip.", punts: 1 },
      { text: "T'hi enfrontes directament davant de tothom amb el mateix to per no perdre autoritat davant dels companys.", punts: -1 },
      { text: "Calles, però decideixes no tornar a col·laborar amb ell en futurs serveis.", punts: 0 }
    ]
  },
  {
    id: 4,
    competencia: 'HSC',
    enunciat: "Has de recollir la denúncia d'una persona estrangera que té dificultats importants per expressar-se en català o castellà. Quina és la teva actitud?",
    opcions: [
      { text: "Posa paciència, fas servir suport visual, traducció o eines oficials i adaptes el teu vocabulari per assegurar la comprensió mútua.", punts: 1 },
      { text: "Li dius que torni un altre dia amb un acompanyant que sàpiga parlar l'idioma correctament.", punts: -1 },
      { text: "Emplenes la denúncia ràpidament amb el que creus que ha volgut dir sense verificar-ho.", punts: 0 }
    ]
  },
  {
    id: 5,
    competencia: 'HSC',
    enunciat: "Com definiries la teva capacitat per negociar i desactivar situacions de conflicte interpersonal?",
    opcions: [
      { text: "Bona: tinc facilitat per escoltar les dues parts, transmetre tranquil·litat i trobar solucions proporcionades a la situació.", punts: 1 },
      { text: "Regular: prefereixo que d'altres portin la veu cantant en situacions tenses.", punts: 0 },
      { text: "Directa: considero que les normes s'han d'imposar sempre sense necessitat de dialogar.", punts: -1 }
    ]
  },
  {
    id: 6,
    competencia: 'HSC',
    enunciat: "Si observes que un ciutadà està espantat en presència de la dotació policial, com procedeixes?",
    opcions: [
      { text: "Adoptes una postura propera i professional, explicant que la policia està allà per garantir la seva seguretat.", punts: 1 },
      { text: "No hi dones cap importància, ja que és normal que la gent tingui respecte al cos policial.", punts: 0 },
      { text: "El mires de forma desafiant per comprovar si té alguna cosa a amagar.", punts: -1 }
    ]
  },
  {
    id: 7,
    competencia: 'HSC',
    enunciat: "En una intervenció conjunta amb altres cossos de seguretat o emergències, com gestiones la comunicació?",
    opcions: [
      { text: "Amb respecte absolut als protocols de coordinació, transmetent missatges clars, concisos i contrastats.", punts: 1 },
      { text: "Intentant imposar el criteri propi per sobre dels altres serveis sense consultar.", punts: -1 },
      { text: "Esperant que siguin ells qui demanin informació sense oferir-la proactivament.", punts: 0 }
    ]
  },
  {
    id: 8,
    competencia: 'HSC',
    enunciat: "Quan reps crítiques constructives per part d'un cap de torn sobre com has redactat una minuta policial:",
    opcions: [
      { text: "Les acceptes amb agraïment, demanes recomanacions concretes i corregeixes el document d'immediat.", punts: 1 },
      { text: "Et justifiques dient que no tenies temps i que no és tan important la redacció.", punts: 0 },
      { text: "T'ofens i consideres que el cap té alguna mania personal contra tu.", punts: -1 }
    ]
  },

  // =========================================================================
  // 2. ORIENTACIÓ DE SERVEI A LA CIUTADANIA (OSC) - Preguntes 9 a 16
  // =========================================================================
  {
    id: 9,
    competencia: 'OSC',
    enunciat: "Un ciutadà d'edat avançada s'apropa a la comissaria visiblement desorientat per fer una consulta administrativa que no correspon a Mossos:",
    opcions: [
      { text: "L'atens amb calidesa, l'orientes amb claredat sobre on ha d'anar i, si cal, l'ajudes a contactar amb el servei corresponent.", punts: 1 },
      { text: "Li dius secament que allò no és competència de la policia i que busqui a internet.", punts: -1 },
      { text: "Li dones un fulletó ràpid sense mirar-lo gaire als ulls.", punts: 0 }
    ]
  },
  {
    id: 10,
    competencia: 'OSC',
    enunciat: "Què representa per a tu la vocació de servei públic policial?",
    opcions: [
      { text: "Un compromís ètic constant de protegir els drets i llibertats dels ciutadans amb vocació d'ajuda i justícia social.", punts: 1 },
      { text: "Una feina estable amb un sou fix i bons horaris de torn.", punts: -1 },
      { text: "Una posició d'autoritat per sobre de la resta de ciutadans.", punts: -1 }
    ]
  },
  {
    id: 11,
    competencia: 'OSC',
    enunciat: "Estàs a punt d'acabar el teu torn de treball i arriba una persona vulnerable sol·licitant auxili o una informació urgent:",
    opcions: [
      { text: "L'atens amb la màxima dedicació el temps necessari o fas un traspàs impecable i detallat al torn entrant per no deixar-la desemparada.", punts: 1 },
      { text: "Marxes sense dir res perquè la teva jornada laboral ja ha acabat estrictament.", punts: -1 },
      { text: "L'atens amb pressa i de mala gana deixant palès que fas hores de més.", punts: 0 }
    ]
  },
  {
    id: 12,
    competencia: 'OSC',
    enunciat: "Com valores l'atenció a la diversitat cultural i social existent a Catalunya en la tasca policial?",
    opcions: [
      { text: "Com un eix fonamental: cal conèixer i respectar la pluralitat social per oferir un servei proper, inclusiu i efectiu.", punts: 1 },
      { text: "Com un aspecte secundari que sovint dificulta l'aplicació estricta de la llei.", punts: 0 },
      { text: "No crec que la policia hagi d'adaptar-se a la diversitat, sinó a l'inrevés.", punts: -1 }
    ]
  },
  {
    id: 13,
    competencia: 'OSC',
    enunciat: "Si un veí es queixa repetidament d'un problema de soroll al barri que no arriba a ser delicte greu:",
    opcions: [
      { text: "Comprèn la seva angoixa, li expliques les vies administratives i de mediació, i intentes fer comprovacions en la patrulla.", punts: 1 },
      { text: "Li dius que no molesti la policia per temes de convivència menors.", punts: -1 },
      { text: "Anotes la queixa per complir el tràmit sense cap intenció de donar-li seguiment.", punts: 0 }
    ]
  },
  {
    id: 14,
    competencia: 'OSC',
    enunciat: "Davant d'una persona que pateix una crisi d'ansietat en la via pública:",
    opcions: [
      { text: "Actues amb serenitat, crees un entorn segur protegint la seva intimitat i sol·licites suport sanitari immediatament.", punts: 1 },
      { text: "Esperant que s'espavili sola abans d'acostar-t'hi.", punts: -1 },
      { text: "Li demanes la documentació de forma contundent abans de preocupar-te pel seu estat de salut.", punts: 0 }
    ]
  },
  {
    id: 15,
    competencia: 'OSC',
    enunciat: "Consideres que el tracte als ciutadans ha de canviar segons el seu nivell socioeconòmic o origen?",
    opcions: [
      { text: "No, absolutament tothom mereix el mateix tracte digne, equitatiu i professional d'acord amb els drets humans.", punts: 1 },
      { text: "En algunes ocasions sí, segons la zona on es patrulli.", punts: -1 },
      { text: "Només es deu respecte a aquells ciutadans que col·laboren activament.", punts: 0 }
    ]
  },
  {
    id: 16,
    competencia: 'OSC',
    enunciat: "Quan un usuari et felicita sincerament per la feina feta durant un servei:",
    opcions: [
      { text: "Agraeixes les seves paraules amb humilitat i fas extensiva la felicitació a la resta de l'equip de la comissaria.", punts: 1 },
      { text: "T'enorgulleixes pensant que ets el millor agent de la comissaria.", punts: 0 },
      { text: "Li dius que no cal que et digui res perquè no t'interessa la seva opinió.", punts: -1 }
    ]
  },

  // =========================================================================
  // 3. TREBALL EN EQUIP I COL·LABORACIÓ (TEC) - Preguntes 17 a 24
  // =========================================================================
  {
    id: 17,
    competencia: 'TEC',
    enunciat: "Durant un dispositiu policial ampli, t'assignen una tasca de suport logístic menys visible que la d'altres companys:",
    opcions: [
      { text: "L'executes amb el màxim rigor i professionalitat, entenent que cada peça de l'engranatge és vital per a l'èxit de l'operatiu.", punts: 1 },
      { text: "Et queixes obertament perquè consideres que mereixies un rol més protagonista.", punts: -1 },
      { text: "La fas amb desgana perquè ningú s'adonarà de la teva feina.", punts: 0 }
    ]
  },
  {
    id: 18,
    competencia: 'TEC',
    enunciat: "Si detectes que un company de patrulla està passant per un mal moment personal que afecta lleugerament la seva concentració:",
    opcions: [
      { text: "Parles amb ell amb discreció, li ofereixes suport, redobles la teva atenció durant el servei i l'animes a buscar ajuda si cal.", punts: 1 },
      { text: "El critiques a l'esquena davant de la resta de la plantilla per deixar-lo en evidència.", punts: -1 },
      { text: "No fas res; cadascú ha de solucionar els seus problemes personals pel seu compte.", punts: 0 }
    ]
  },
  {
    id: 19,
    competencia: 'TEC',
    enunciat: "Quan s'aconsegueix un èxit policial destacat en una investigació en què has participat amb altres agents:",
    opcions: [
      { text: "Destaques el mèrit col·lectiu i la bona coordinació de tot el grup de treball.", punts: 1 },
      { text: "Intentes atribuir-te la major part del mèrit davant dels comandaments.", punts: -1 },
      { text: "No comentes res perquè no et preocupen els resultats dels altres.", punts: 0 }
    ]
  },
  {
    id: 20,
    competencia: 'TEC',
    enunciat: "Com actues si durant un servei estàs en desacord amb una decisió tàctica menor del teu binomi?",
    opcions: [
      { text: "Doneu suport a la decisió en el moment crític per mantenir la unitat d'acció, i en acabar el servei en debatiu les millores.", punts: 1 },
      { text: "Discuteixes la decisió a crits davant dels ciutadans presents per demostrar que tens raó.", punts: -1 },
      { text: "Passes d'ell i fas cadascú la seva guerra pel seu compte.", punts: 0 }
    ]
  },
  {
    id: 21,
    competencia: 'TEC',
    enunciat: "Si t'incorpores a un grup de treball ja consolidat on no coneixes a ningú:",
    opcions: [
      { text: "Mostres humilitat, predisposició a aprendre les seves dinàmiques i voluntat d'aportar positivament des del primer dia.", punts: 1 },
      { text: "Intentes canviar totes les normes del grup des del principi per imposar la teva manera de fer.", punts: -1 },
      { text: "T'aïlles i evites qualsevol interacció social fora del servei estrictament obligatori.", punts: 0 }
    ]
  },
  {
    id: 22,
    competencia: 'TEC',
    enunciat: "En cas que un company cometi un error involuntari en un informe administratiu que tu pots corregir abans de lliurar-lo:",
    opcions: [
      { text: "L'avises amb companyonia, l'ajudes a revisar-lo i col·laboreu perquè el document surti perfecte.", punts: 1 },
      { text: "Deixes que el lliuri amb l'error per veure com el renyen els caps.", punts: -1 },
      { text: "El corregeixes sense dir-li res però te n'apuntes el mèrit.", punts: 0 }
    ]
  },
  {
    id: 23,
    competencia: 'TEC',
    enunciat: "Com valores la transmissió de coneixements dels agents veterans cap a les noves promocions?",
    opcions: [
      { text: "Com una font d'aprenentatge imprescindible que cal respectar i aprofitar per al creixement professional.", punts: 1 },
      { text: "Com una pèrdua de temps perquè els procediments antics ja no serveixen.", punts: -1 },
      { text: "Depèn de si l'agent veterà em cau bé o no.", punts: 0 }
    ]
  },
  {
    id: 24,
    competencia: 'TEC',
    enunciat: "Per a tu, quin és el principal valor d'un bon binomi policial?",
    opcions: [
      { text: "La confiança cega mútua, la comunicació no verbal i la protecció recíproca en qualsevol circumstància.", punts: 1 },
      { text: "Poder fer torns per descansar mentre l'altre condueix.", punts: -1 },
      { text: "Tenir algú a qui culpar si les coses surten malament.", punts: -1 }
    ]
  },

  // =========================================================================
  // 4. ADAPTABILITAT I FLEXIBILITAT (ADF) - Preguntes 25 a 32
  // =========================================================================
  {
    id: 25,
    competencia: 'ADF',
    enunciat: "Degut a una emergència greu de protecció civil, et canvien el quadrant horari i el lloc de destí de forma sobtada:",
    opcions: [
      { text: "T'adaptes de seguida amb actitud positiva i sentit del deure, reorganitzant la teva vida personal de la millor manera possible.", punts: 1 },
      { text: "Poses excuses mèdiques o personals per evitar haver d'acudir al nou destí.", punts: -1 },
      { text: "Vas a la feina queixant-te durant tot el dia i disminuint el teu rendiment.", punts: 0 }
    ]
  },
  {
    id: 26,
    competencia: 'ADF',
    enunciat: "S'implanta un nou sistema informàtic de gestió de denúncies que requereix aprendre procediments nous:",
    opcions: [
      { text: "Mostres curiositat i proactivitat, participes a les sessions formatives i practiques fins a dominar l'eina.", punts: 1 },
      { text: "Te'n queixes constantment i continues intentant fer les coses pel sistema antic.", punts: -1 },
      { text: "Esperant que els companys facin les denúncies per tu per no haver d'aprendre.", punts: 0 }
    ]
  },
  {
    id: 27,
    competencia: 'ADF',
    enunciat: "Durant un patrullatge rutinari, la sala de comandament (112) activa un codi d'emergència que trenca la planificació del dia:",
    opcions: [
      { text: "Canvies ràpidament el xip mental, focalitzes l'atenció en la nova prioritat i actues segons el protocol d'urgència.", punts: 1 },
      { text: "Et bloqueixes o mostres resistència a abandonar el que estaves fent.", punts: -1 },
      { text: "Trigues a respondre per veure si una altra dotació s'encarrega del servei.", punts: 0 }
    ]
  },
  {
    id: 28,
    competencia: 'ADF',
    enunciat: "Com gestiones el treball en entorns canviants amb informació incompleta o ambigua?",
    opcions: [
      { text: "Mantingues la calma, analitzes les dades disponibles, valores riscos i prens decisions prudents adaptades a l'evolució.", punts: 1 },
      { text: "Prendre decisions temeràries sense avaluar els riscos.", punts: -1 },
      { text: "Incapacitat d'actuar fins a tenir el 100% de la informació confirmada.", punts: 0 }
    ]
  },
  {
    id: 29,
    competencia: 'ADF',
    enunciat: "Si et reassignen a una unitat amb tasques molt diferents a les que estaves acostumat (per exemple, de trànsit a seguretat ciutadana):",
    opcions: [
      { text: "Ho prens com una gran oportunitat de desenvolupament integral com a policia i t'hi impliques a fons.", punts: 1 },
      { text: "Consideres que és un càstig i mostres desídia a les noves funcions.", punts: -1 },
      { text: "Només fas el mínim estricte esperant poder tornar a la teva zona de confort.", punts: 0 }
    ]
  },
  {
    id: 30,
    competencia: 'ADF',
    enunciat: "Quan has de conviure amb companys de patrulla amb caràcters o punts de vista personals molt diferents als teus:",
    opcions: [
      { text: "Separes allò personal d'allò professional, mantens una convivència respectuosa i busques el bé del servei.", punts: 1 },
      { text: "Provoques discussions per intentar convèncer-los que la teva visió és l'única vàlida.", punts: -1 },
      { text: "Crees un ambient incòmode i et negues a parlar-hi durant el torn.", punts: 0 }
    ]
  },
  {
    id: 31,
    competencia: 'ADF',
    enunciat: "Davant d'una situació meteorològica extrema (neu, temporals, inundacions) durant un servei:",
    opcions: [
      { text: "Adoptes mesures de seguretat addicionals, adaptes la conducció i estàs disponible per auxiliar allà on calgui.", punts: 1 },
      { text: "Et refugies a la comissaria i evites sortir al carrer mentre faci mal temps.", punts: -1 },
      { text: "Conduir sense precaució ignorant les advertències meteorològiques.", punts: -1 }
    ]
  },
  {
    id: 32,
    competencia: 'ADF',
    enunciat: "Com reacciones quan els plans operatius prèviament establerts fracassen per circumstàncies imprevistes?",
    opcions: [
      { text: "Avaluem ràpidament alternatives (pla B), reassignem prioritats i continuem l'acció amb serenitat.", punts: 1 },
      { text: "Et desesperes i abandones la missió donant-la per perduda.", punts: -1 },
      { text: "Culpes els altres membres de l'equip sense buscar solucions.", punts: -1 }
    ]
  },

  // =========================================================================
  // 5. AUTOCONTROL I GESTIÓ DE L'ESTRÈS (AGE) - Preguntes 33 a 40
  // =========================================================================
  {
    id: 33,
    competencia: 'AGE',
    enunciat: "Durant una manifestació o servei d'ordre públic, un grup de persones comença a insultar-te greument i de manera directa:",
    opcions: [
      { text: "Mantingues una postura de fermesa i serenitat absoluta, ignorant les provocacions verbals i actuant només segons ordres del cap.", punts: 1 },
      { text: "Respon als insults amb paraules igualment ofensives per defensar el teu honor personal.", punts: -1 },
      { text: "Carregues pel teu compte sense esperar les instruccions del comandament.", punts: -1 }
    ]
  },
  {
    id: 34,
    competencia: 'AGE',
    enunciat: "Com gestioneu la pressió acumulada després d'una jornada de treball especialment dura i tensa?",
    opcions: [
      { text: "Fent esport, descansant, compartint temps de qualitat amb la família i utilitzant tècniques saludables de desconnexió.", punts: 1 },
      { text: "Consumint alcohol o altres substàncies per oblidar el que ha passat durant el dia.", punts: -1 },
      { text: "Pagant la frustració amb les persones del teu entorn domèstic.", punts: -1 }
    ]
  },
  {
    id: 35,
    competencia: 'AGE',
    enunciat: "Davant d'un accident greu de trànsit amb víctimes atrapades i escena caòtica, quina és la teva reacció inicial?",
    opcions: [
      { text: "Controlar el pols, assegurar la zona per evitar nous accidents, demanar recursos sanitaris i iniciar el triatge amb calma.", punts: 1 },
      { text: "Deixar-te portar pel pànic i quedar immobilitzat sense saber què fer.", punts: -1 },
      { text: "Començar a cridar i traspassar nervis a la resta de testimonis.", punts: 0 }
    ]
  },
  {
    id: 36,
    competencia: 'AGE',
    enunciat: "Si durant una detenció la persona oposa resistència física activa i violenta:",
    opcions: [
      { text: "Aplica les tècniques de reducció proporcional, congruents i oportunes segons els protocols oficials de contenció.", punts: 1 },
      { text: "Fas un ús excessiu i desmesurat de la força mogut per la ràbia del moment.", punts: -1 },
      { text: "Et retires deixant el teu company sol davant de l'agressor.", punts: -1 }
    ]
  },
  {
    id: 37,
    competencia: 'AGE',
    enunciat: "Quan sents que estàs arribant al teu límit emocional o de fatiga en un servei prolongat:",
    opcions: [
      { text: "Ho comuniques amb maduresa al teu company o superior per fer relleus segurs i no comprometre l'operatiu.", punts: 1 },
      { text: "T'ho calles per por al que pensin de tu fins que acabes cometent una errada greu.", punts: 0 },
      { text: "Abandones el lloc de servei sobtadament sense avisar ningú.", punts: -1 }
    ]
  },
  {
    id: 38,
    competencia: 'AGE',
    enunciat: "Com valores la teva tolerància a la frustració quan una investigació de mesos no dóna els fruits esperats?",
    opcions: [
      { text: "Alta: entenc que en la tasca policial hi ha factors no controlables; analitzo els aprenentatges i continuo endavant.", punts: 1 },
      { text: "Baixa: em desmotivo ràpidament i perdo l'interès per la meva professió.", punts: -1 },
      { text: "Busco algun culpable per descarregar la meva decepció.", punts: 0 }
    ]
  },
  {
    id: 39,
    competencia: 'AGE',
    enunciat: "Si un sospitós et desafia amb la mirada o et fa comentaris burlescs mentre l'estàs identificant:",
    opcions: [
      { text: "Mantinc la professionalitat estricta, realitzo la identificació segons normativa sense immutar-me i finalitzo el tràmit.", punts: 1 },
      { text: "Li retinc la documentació més temps del necessari com a represàlia per la seva actitud.", punts: -1 },
      { text: "L'amenaço amb inventar-me una sanció per fer-li por.", punts: -1 }
    ]
  },
  {
    id: 40,
    competencia: 'AGE',
    enunciat: "En situacions de perill imminent amb arma blanca o de foc:",
    opcions: [
      { text: "Mantens la concentració, busques cobertura, protegeixes a tercers i apliques els principis d'oportunitat, congruència i proporcionalitat.", punts: 1 },
      { text: "Dispares indiscriminadament sense avaluar l'entorn ni les persones innocents presents.", punts: -1 },
      { text: "Fuges corrent sense avisar la sala ni protegir el ciutadà.", punts: -1 }
    ]
  },

  // =========================================================================
  // 6. AUTOGESTIÓ I CREIXEMENT PERSONAL (ACP) - Preguntes 41 a 48
  // =========================================================================
  {
    id: 41,
    competencia: 'ACP',
    enunciat: "Quan reconeixes que has comès una errada en un procediment policial que ningú més ha vist:",
    opcions: [
      { text: "L'assumeixes amb integritat, la informes al superior per esmenar-la i aprens de l'experiència per no repetir-la.", punts: 1 },
      { text: "L'amagues o intentes falsificar documents perquè ningú se n'assabenti mai.", punts: -1 },
      { text: "Si algú la descobreix, culpes el teu company de torn.", punts: -1 }
    ]
  },
  {
    id: 42,
    competencia: 'ACP',
    enunciat: "Quina importància té per a tu la formació contínua durant tota la teva carrera policial?",
    opcions: [
      { text: "Fonamental: el dret, la societat i les tecnologies evolucionen ràpidament i un bon policia ha d'actualitzar-se constantment.", punts: 1 },
      { text: "Poca: un cop superada l'oposició i l'escola de policia (ISPC) ja no cal estudiar més.", punts: -1 },
      { text: "Només faig cursos si em donen dies lliures o punts per cobrar més.", punts: 0 }
    ]
  },
  {
    id: 43,
    competencia: 'ACP',
    enunciat: "Com valores el teu nivell d'autocrítica sobre els teus punts forts i les teves àrees de millora?",
    opcions: [
      { text: "Sóc conscient de les meves fortaleses i treballo de manera constant i honesta en les meves febleses.", punts: 1 },
      { text: "Considero que ja ho sé tot i que no tinc cap aspecte a millorar.", punts: -1 },
      { text: "Em centro només en allò que faig malament, cosa que em genera inseguretat permanent.", punts: 0 }
    ]
  },
  {
    id: 44,
    competencia: 'ACP',
    enunciat: "Com gestiones el teu temps i la preparació de les teves tasques abans d'iniciar un servei?",
    opcions: [
      { text: "Arribo amb temps suficient, reviso l'equipament, m'informo de les novetats del torn anterior i planifico el servei.", punts: 1 },
      { text: "Arribo sempre just o tard, agafant el material sense comprovar si funciona.", punts: -1 },
      { text: "Espero que sigui el meu company qui prepari tot el material del vehicle.", punts: 0 }
    ]
  },
  {
    id: 45,
    competencia: 'ACP',
    enunciat: "Davant d'un fracàs personal o laboral en el passat (com suspendre una convocatòria anterior):",
    opcions: [
      { text: "He analitzat què va fallar, he redoblat l'esforç amb perseverança i he tornat més ben preparat i madur.", punts: 1 },
      { text: "Em vaig rendir durant molt de temps pensant que el sistema estava manipulat en contra meu.", punts: -1 },
      { text: "No vaig canviar res de la meva preparació perquè crec que va ser només mala sort.", punts: 0 }
    ]
  },
  {
    id: 46,
    competencia: 'ACP',
    enunciat: "Com mantens el teu estat de salut física i mental de cara a les exigències de la professió policial?",
    opcions: [
      { text: "Amb un entrenament regular, alimentació equilibrada, descans adequat i hàbits de vida saludables.", punts: 1 },
      { text: "Només entreno els mesos previs a les proves físiques de l'oposició.", punts: 0 },
      { text: "No em cuido perquè considero que la condició física no és important un cop ets funcionari.", punts: -1 }
    ]
  },
  {
    id: 47,
    competencia: 'ACP',
    enunciat: "Quan observes que un company més jove o amb menys experiència té una habilitat tècnica superior a la teva:",
    opcions: [
      { text: "Ho reconeixes amb naturalitat, li demanes consell i aprofites per aprendre d'ell.", punts: 1 },
      { text: "Sents enveja i intentes desacreditar la seva feina davant dels altres.", punts: -1 },
      { text: "Fas veure que no t'importa i evites el contacte amb ell.", punts: 0 }
    ]
  },
  {
    id: 48,
    competencia: 'ACP',
    enunciat: "Quin objectiu tens a llarg termini dins del Cos de Mossos d'Esquadra?",
    opcions: [
      { text: "Evolucionar professionalment, adquirir experiència en seguretat ciutadana i especialitzar-me per servir millor a la societat.", punts: 1 },
      { text: "Aconseguir el lloc on es treballi menys i es tingui menys responsabilitat possible.", punts: -1 },
      { text: "No tinc cap pla, aniré deixant passar els anys per inèrcia.", punts: 0 }
    ]
  },

  // =========================================================================
  // 7. COMPROMÍS I IDENTIFICACIÓ AMB L'ORGANITZACIÓ (CIO) - Preguntes 49 a 56
  // =========================================================================
  {
    id: 49,
    competencia: 'CIO',
    enunciat: "Què significa per a tu portar l'uniforme del Cos de Mossos d'Esquadra?",
    opcions: [
      { text: "Un honor i una responsabilitat immensa: representa les institucions de Catalunya i el compromís ètic amb tots els ciutadans.", punts: 1 },
      { text: "Una disfressa de feina que només serveix per complir l'horari laboral.", punts: -1 },
      { text: "Un símbol d'immunitat per fer el que em doni la gana sense conseqüències.", punts: -1 }
    ]
  },
  {
    id: 50,
    competencia: 'CIO',
    enunciat: "Si sents que un conegut fa comentaris greument falsos o difamatoris sobre el Cos de Mossos a les xarxes socials:",
    opcions: [
      { text: "Defenses la feina honesta i professional del cos amb arguments serens i objectius, sense caure en provocacions.", punts: 1 },
      { text: "T'hi sumes fent mofa per quedar bé amb el teu grup d'amics.", punts: -1 },
      { text: "Els amenaces amb sancions o agressions físiques per callar-los.", punts: -1 }
    ]
  },
  {
    id: 51,
    competencia: 'CIO',
    enunciat: "Com valores la disciplina i el respecte a la cadena de comandament en una organització policial?",
    opcions: [
      { text: "Com un pilar estructural indispensable per a l'eficàcia, la coordinació operativa i la seguretat de tothom.", punts: 1 },
      { text: "Com una imposició militar antiga que no hauria d'existir en un cos modern.", punts: -1 },
      { text: "Respecto les ordres només si estic d'acord amb el criteri del cap.", punts: -1 }
    ]
  },
  {
    id: 52,
    competencia: 'CIO',
    enunciat: "Davant d'una ordre directa d'un comandament superior que no és il·legal però que tu hauries executat d'una altra manera:",
    opcions: [
      { text: "L'executes amb diligència i lleialtat, podent expressar el teu punt de vista tècnic en el moment i canal oportú.", punts: 1 },
      { text: "Desobeeixes obertament davant de la resta d'agents del torn.", punts: -1 },
      { text: "Fas veure que la compleixes però fas el contrari d'amagat.", punts: -1 }
    ]
  },
  {
    id: 53,
    competencia: 'CIO',
    enunciat: "Quin coneixement i respecte tens envers el Codi Ètic de la Policia de Catalunya?",
    opcions: [
      { text: "Plenament compromès: considero que els valors ètics han de regir tant la vida professional com la conducta cívica privada.", punts: 1 },
      { text: "Crec que el codi ètic és només un document teòric sense aplicació pràctica al carrer.", punts: -1 },
      { text: "Mentre no em descobreixin, no crec que calgui complir cap codi ètic.", punts: -1 }
    ]
  },
  {
    id: 54,
    competencia: 'CIO',
    enunciat: "Si et trobes fora de servei i ets testimoni directe d'un delicte flagrant greu amb perill per a les persones:",
    opcions: [
      { text: "Intervens adoptant les mesures de seguretat necessàries, t'identifiques com a policia, avises immediatament al 112 i protegis les víctimes.", punts: 1 },
      { text: "Mires cap a una altra banda perquè no estàs en horari remunerat de servei.", punts: -1 },
      { text: "Graves l'escena amb el mòbil per pujar-la a xarxes socials.", punts: -1 }
    ]
  },
  {
    id: 55,
    competencia: 'CIO',
    enunciat: "Com tractes la informació confidencial o les dades policials a les quals tens accés pel teu càrrec?",
    opcions: [
      { text: "Amb secret professional estricte i màxima reserva, consultant bases de dades només per motius estrictament laborals justificats.", punts: 1 },
      { text: "Fent consultes per curiositat personal sobre amics, familiars o persones conegudes.", punts: -1 },
      { text: "Compartint informació d'atestats o fotos d'actuacions amb grups de missatgeria privada.", punts: -1 }
    ]
  },
  {
    id: 56,
    competencia: 'CIO',
    enunciat: "Per a tu, quin paper té la neutralitat política i religiosa en l'exercici de la funció policial?",
    opcions: [
      { text: "És un principi innegociable: la policia ha de ser imparcial, objectiva i defensora de la legalitat vigent per a tothom.", punts: 1 },
      { text: "Crec que la policia pot afavorir determinats col·lectius segons la seva ideologia.", punts: -1 },
      { text: "No crec que sigui possible mantenir la neutralitat quan s'actua al carrer.", punts: 0 }
    ]
  },

  // =========================================================================
  // 8. ORIENTACIÓ A LA QUALITAT (OAQ) - Preguntes 57 a 64
  // =========================================================================
  {
    id: 57,
    competencia: 'OAQ',
    enunciat: "Quan has de confeccionar un atestat policial complex amb múltiples diligències i testimonis:",
    opcions: [
      { text: "Treballes amb màxim detall, precisió cronològica, claredat jurídica i ortogràfica, revisant-lo abans de traslladar-lo al jutjat.", punts: 1 },
      { text: "El redactes de qualsevol manera i amb faltes per enviar-lo ràpidament i treure-te'l de sobre.", punts: -1 },
      { text: "Deixes que el faci el teu company sencer sense col·laborar.", punts: 0 }
    ]
  },
  {
    id: 58,
    competencia: 'OAQ',
    enunciat: "En custodiar i preservar una cadena de custòdia d'indicis o proves en un escenari delictiu:",
    opcions: [
      { text: "Aplica de manera impecable el protocol de precinte, registre i documentació per garantir la validesa judicial de les proves.", punts: 1 },
      { text: "Manipules els objectes sense guants ni cura perquè no creus que sigui tan important.", punts: -1 },
      { text: "Deixes els objectes abandonats al maleter del cotxe patrulla sense precintar.", punts: -1 }
    ]
  },
  {
    id: 59,
    competencia: 'OAQ',
    enunciat: "Com mantens l'estat del vehicle patrulla i l'armament oficial assignat?",
    opcions: [
      { text: "Neteja, revisió diària dels nivells i de la seguretat de les armes, informant immediatament de qualsevol desperfecte.", punts: 1 },
      { text: "Descurança total, deixant escombraries a l'interior i sense netejar mai l'arma reglamentària.", punts: -1 },
      { text: "Només el reviso si el cap em passa revista obligatòria.", punts: 0 }
    ]
  },
  {
    id: 60,
    competencia: 'OAQ',
    enunciat: "Si t'adones que has omès involuntàriament una dada rellevant en una denúncia ja tramitada:",
    opcions: [
      { text: "Elabores d'immediat una diligència d'ampliació per esmenar l'omissió i garantir la màxima precisió dels fets.", punts: 1 },
      { text: "No dius res confiant que ningú al jutjat s'adonarà de la dada que falta.", punts: -1 },
      { text: "Esperant que sigui el ciutadà qui torni a queixar-se per arreglar-ho.", punts: 0 }
    ]
  },
  {
    id: 61,
    competencia: 'OAQ',
    enunciat: "Com valores l'excel·lència en la imatge pública que transmet una patrulla de Mossos:",
    opcions: [
      { text: "Com un reflex directe del respecte institucional: uniformitat impecable, postura professional i actitud vigilant.", punts: 1 },
      { text: "M'és igual: l'important és anar còmode encara que sembli poc professional.", punts: -1 },
      { text: "Mentre no em renyin, porto l'uniforme de qualsevol manera.", punts: 0 }
    ]
  },
  {
    id: 62,
    competencia: 'OAQ',
    enunciat: "Davant d'una tasca administrativa rutinària que es repeteix moltes vegades al dia:",
    opcions: [
      { text: "Mantingues el mateix rigor i atenció als detalls a la primera que a la darrera per evitar errors mecànics.", punts: 1 },
      { text: "M'avorreixo i començo a saltar-me passos obligatoris per acabar abans.", punts: -1 },
      { text: "La faig amb els ulls clucs sense comprovar res del que escric.", punts: -1 }
    ]
  },
  {
    id: 63,
    competencia: 'OAQ',
    enunciat: "Quan reps un informe elaborat per un altre servei que conté incongruències manifestes:",
    opcions: [
      { text: "Ho verifiques amb tacte i professionalitat amb el redactor abans d'incorporar-lo per garantir la qualitat del conjunt.", punts: 1 },
      { text: "El dones per bo sense llegir-lo per no tenir feina extra.", punts: 0 },
      { text: "L'estires a la paperera sense avisar ningú.", punts: -1 }
    ]
  },
  {
    id: 64,
    competencia: 'OAQ',
    enunciat: "Què fas quan acabes un servei abans de l'hora prevista?",
    opcions: [
      { text: "Aprofites per posar al dia informes pendents, netejar i revisar el material o oferir suport a altres dotacions actives.", punts: 1 },
      { text: "T'amagues amb el cotxe per mirar el telèfon mòbil durant hores.", punts: -1 },
      { text: "Marxes cap a casa abans d'hora sense permís.", punts: -1 }
    ]
  },

  // =========================================================================
  // 9. RESOLUCIÓ DE PROBLEMES (RDP) - Preguntes 65 a 72
  // =========================================================================
  {
    id: 65,
    competencia: 'RDP',
    enunciat: "Arribes a un incident on dues parts ofereixen versions totalment oposades sobre una baralla sense testimonis immediats:",
    opcions: [
      { text: "Separes les parts, busques càmeres de seguretat, indicis físics i testimonis als voltants per reconstruir els fets amb lògica.", punts: 1 },
      { text: "Dones la raó a la persona que et sembli més simpàtica sense investigar res més.", punts: -1 },
      { text: "Marxes sense actuar dient que no pots fer res si no s'avenen.", punts: -1 }
    ]
  },
  {
    id: 66,
    competencia: 'RDP',
    enunciat: "Durant una persecució en vehicle, el sospitós entra en un carrer de vianants amb gran afluència de nens i famílies:",
    opcions: [
      { text: "Ponderes els riscos, prioritzeu la seguretat dels ciutadans, reduïu la velocitat i coordineu un tancament perimetral amb altres dotacions.", punts: 1 },
      { text: "Acceleres al màxim per encalçar-lo sense importar el perill d'atropellament de tercers.", punts: -1 },
      { text: "Dispares a les rodes enmig de la gentada.", punts: -1 }
    ]
  },
  {
    id: 67,
    competencia: 'RDP',
    enunciat: "Com abordes problemes complexos on no hi ha un protocol específic detallat?",
    opcions: [
      { text: "Analitzant els principis generals del dret, la seguretat de les persones i aplicant el sentit comú i la proporcionalitat.", punts: 1 },
      { text: "Bloquejant-te i negant-te a actuar fins que algú et doni una solució mastegada.", punts: 0 },
      { text: "Actuant de manera impulsiva sense mesurar les conseqüències.", punts: -1 }
    ]
  },
  {
    id: 68,
    competencia: 'RDP',
    enunciat: "Si durant una detenció un grup de ciutadans hostils envolta la vostra patrulla dificultant la sortida del vehicle:",
    opcions: [
      { text: "Sol·licites suport urgent a la sala (112), mantens la calma tancant portes i busques la ruta d'evacuació més segura sense caure en provocacions.", punts: 1 },
      { text: "Baixes del vehicle disparant a l'aire de forma descontrolada.", punts: -1 },
      { text: "Alliberes el detingut immediatament per por a les represàlies.", punts: -1 }
    ]
  },
  {
    id: 69,
    competencia: 'RDP',
    enunciat: "Quan t'enfrontes a múltiples avisos simultanis en un torn amb pocs recursos policials disponibles:",
    opcions: [
      { text: "Prioritzes els incidents segons la gravetat i el risc imminent per a la vida o integritat física de les persones.", punts: 1 },
      { text: "Ateneu els avisos per ordre d'arribada sense discriminar la gravetat.", punts: 0 },
      { text: "Decidiu atendre l'avís que estigui més a prop de la cafeteria.", punts: -1 }
    ]
  },
  {
    id: 70,
    competencia: 'RDP',
    enunciat: "Com valores la capacitat d'anticipació i prevenció enfront de la simple reacció policial?",
    opcions: [
      { text: "La prevenció i l'anticipació són la millor eina: evitar que es produeixi el delicte és molt més efectiu que haver de lamentar danys.", punts: 1 },
      { text: "La policia només ha d'actuar quan el delicte ja s'ha consumat.", punts: -1 },
      { text: "La prevenció és una pèrdua de temps inútil.", punts: -1 }
    ]
  },
  {
    id: 71,
    competencia: 'RDP',
    enunciat: "Davant d'una fuita de gas en un immoble amb gent gran a l'interior i bombers encara en camí:",
    opcions: [
      { text: "Avises la sala, talles el trànsit, inicies l'evacuació de forma organitzada sense utilitzar timbres elèctrics i amb màxima precaució.", punts: 1 },
      { text: "Entres amb una cigarreta encesa a comprovar la fuita.", punts: -1 },
      { text: "T'esperes de braços creuats fora de l'edifici sense avisar cap veí.", punts: -1 }
    ]
  },
  {
    id: 72,
    competencia: 'RDP',
    enunciat: "Si el sistema de comunicacions per ràdio (Rescat) deixa de funcionar durant un dispositiu:",
    opcions: [
      { text: "Utilitzes canals alternatius previstos (telefonia corporativa, missatgeria segura, punts de trobada física) per mantenir el contacte.", punts: 1 },
      { text: "Abandones l'operatiu sense avisar ningú.", punts: -1 },
      { text: "Comences a cridar per megafonia sense control.", punts: 0 }
    ]
  },

  // =========================================================================
  // 10. INICIATIVA I AUTONOMIA (IAA) - Preguntes 73 a 80
  // =========================================================================
  {
    id: 73,
    competencia: 'IAA',
    enunciat: "Durant el patrullatge preventiu detectes un vehicle estacionat amb les portes obertes i objectes de valor a la vista en una zona fosca:",
    opcions: [
      { text: "Pren la iniciativa de comprovar la matrícula, inspeccionar els voltants i contactar amb el propietari per prevenir un robatori.", punts: 1 },
      { text: "Passes de llarg perquè ningú t'ha ordenat específicament mirar aquell vehicle.", punts: -1 },
      { text: "Te'n rius de la badada del propietari sense fer res.", punts: 0 }
    ]
  },
  {
    id: 74,
    competencia: 'IAA',
    enunciat: "Com actues quan detectes una millora operativa en la distribució del material de la comissaria?",
    opcions: [
      { text: "Elabores una proposta estructurada i la presentes al teu cap de torn per avaluar la seva implementació.", punts: 1 },
      { text: "Te la calles perquè consideres que no és la teva responsabilitat millorar les coses.", punts: 0 },
      { text: "Canvies tot el material de lloc pel teu compte sense avisar la resta de companys.", punts: -1 }
    ]
  },
  {
    id: 75,
    competencia: 'IAA',
    enunciat: "En una situació d'urgència on el teu comandament no està disponible per problemes de cobertura:",
    opcions: [
      { text: "Prens la decisió operativa necessària amb criteri professional, proporcionalitat i responsabilitat, informant tan aviat com es restableixi el contacte.", punts: 1 },
      { text: "No fas absolutament res i deixes que la situació degeneri.", punts: -1 },
      { text: "Fas el primer que se't passa pel cap sense pensar en la legalitat.", punts: -1 }
    ]
  },
  {
    id: 76,
    competencia: 'IAA',
    enunciat: "Com definiries la teva proactivitat durant el servei ordinari de carrer?",
    opcions: [
      { text: "Alta: observo constantment l'entorn, busco conductes sospitoses, interacciono amb veïns i comerciants i mantinc una actitud vigilant activa.", punts: 1 },
      { text: "Passiva: només em moc si la sala de comandament em dóna un avís directe.", punts: 0 },
      { text: "Nul·la: busco la manera de passar el torn desapercebut.", punts: -1 }
    ]
  },
  {
    id: 77,
    competencia: 'IAA',
    enunciat: "Si observes que un comerciant té dubtes sobre com reforçar la seguretat del seu local després d'una onada de furts al barri:",
    opcions: [
      { text: "T'apropes amb iniciativa, li ofereixes consells de seguretat ciutadana i li facilites el contacte amb l'oficina de relacions amb la comunitat.", punts: 1 },
      { text: "Li dius que contracti seguretat privada si té por.", punts: -1 },
      { text: "Evites parlar-hi per no haver de donar explicacions.", punts: 0 }
    ]
  },
  {
    id: 78,
    competencia: 'IAA',
    enunciat: "Davant d'un canvi legislatiu recent que afecta directament les intervencions al carrer:",
    opcions: [
      { text: "T'informes i llegeixes la nova normativa amb autonomia abans d'iniciar el proper servei per tenir clar el marc legal.", punts: 1 },
      { text: "Esperant que algú t'ho expliqui en un passadís d'aquí a uns mesos.", punts: 0 },
      { text: "Ignores la llei i continues actuant com sempre.", punts: -1 }
    ]
  },
  {
    id: 79,
    competencia: 'IAA',
    enunciat: "Quan acabes una actuació policial i detectes que el ciutadà afectat té dubtes sobre els tràmits posteriors:",
    opcions: [
      { text: "Prendre la iniciativa d'explicar-li amb calma les passes a seguir (cites, asseguradores, jutjat) per deixar-lo tranquil i orientat.", punts: 1 },
      { text: "Marxes sense dir res perquè la intervenció tècnica ja està finalitzada.", punts: 0 },
      { text: "Li dius que s'espavili sol.", punts: -1 }
    ]
  },
  {
    id: 80,
    competencia: 'IAA',
    enunciat: "Com a futur membre del Cos de Mossos d'Esquadra, com entens la responsabilitat d'actuar amb criteri propi?",
    opcions: [
      { text: "Com una capacitat imprescindible d'aplicar la llei amb seny, justícia, ètica i autonomia, assumint sempre les conseqüències dels teus actes.", punts: 1 },
      { text: "Com la llibertat de fer el que vulgui sense haver de donar explicacions a ningú.", punts: -1 },
      { text: "Com una càrrega que preferiria que assumissin sempre els altres.", punts: 0 }
    ]
  }
];
