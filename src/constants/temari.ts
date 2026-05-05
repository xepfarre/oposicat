/**
 * Dades de tots els temes i sub-temes de l'oposició de Mossos d'Esquadra (Convocatòria 2025-2026).
 * Aquestes dades s'utilitzen per generar les llistes i els milestones de progrés.
 */

export interface Subtema {
  titol: string;
}

export interface Tema {
  id: string;
  titol: string;
  subtemes: string[];
}

export const TEMARI_DETALL = {
  A: [
    {
      titol: "Història de Catalunya (part I)",
      subtemes: [
        "L'antiguitat a Catalunya",
        "La Catalunya romana",
        "La formació i l'expansió de Catalunya (segles VIII-XIII)",
        "La crisi de la baixa edat mitjana (segles XIV-XV)",
        "Catalunya a l'època moderna (segles XVI-XVII)",
        "La guerra de Successió i l'Onze de Setembre",
        "L'economia al segle XVIII",
        "La cultura a l'edat mitjana i moderna",
        "Les transformacions del segle XVIII"
      ]
    },
    {
      titol: "Història de Catalunya (part II)",
      subtemes: [
        "El segle XIX: la crisi de l'Antic Règim i la construcció de l'Estat liberal",
        "Catalunya, la industrialització i l'obrerisme",
        "La restauració borbònica i el catalanisme polític",
        "El primer terç del segle XX (1898-1931)",
        "La República i la Guerra Civil",
        "La dictadura franquista",
        "La Transició i la recuperació de l'autonomia",
        "La Catalunya del segle XXI"
      ]
    },
    {
      titol: "Història de la policia a Catalunya",
      subtemes: [
        "Les forces de seguretat i la seva història",
        "L'origen dels Mossos d'Esquadra",
        "Transformacions policials durant el segle XIX",
        "La policia durant les primeres dècades del segle XX",
        "La policia i la democràcia"
      ]
    },
    {
      titol: "Àmbit sociolingüístic",
      subtemes: [
        "Història de la llengua",
        "Varietats lingüístiques",
        "La llengua aranesa",
        "Noves versions de la Gramàtica de la llengua catalana i de l'Ortografia catalana"
      ]
    },
    {
      titol: "Marc geogràfic de Catalunya",
      subtemes: [
        "Situació i divisió administrativa",
        "El relleu",
        "Els climes a Catalunya",
        "La xarxa hidrogràfica",
        "La vegetació",
        "La població"
      ]
    },
    {
      titol: "Entorn social a Catalunya",
      subtemes: [
        "La migració a Catalunya i fluxos migratoris",
        "Les polítiques públiques en matèria d'immigració",
        "Models d'integració i marcs de convivència en la societat multicultural",
        "Les polítiques públiques en matèria d'igualtat d'oportunitats",
        "Els serveis socials a Catalunya"
      ]
    },
    {
      titol: "Les tecnologies de la informació en el segle XXI",
      subtemes: [
        "La societat del coneixement i les tecnologies de la informació. Internet i la Internet de les coses (IoT)",
        "Efectes de les tecnologies de la informació i la comunicació (TIC)",
        "Seguretat de la informació",
        "L'administració electrònica. Signatura electrònica",
        "Comunicació i control públic: espais de seguretat i alarmes socials"
      ]
    }
  ],
  B: [
    {
      titol: "L'Estatut d'autonomia de Catalunya (EAC)",
      subtemes: [
        "Antecedents històrics i naturalesa jurídica",
        "Contingut i estructura",
        "Els drets, els deures i els principis rectors",
        "Les competències de la Generalitat de Catalunya",
        "La competència en matèria de seguretat pública establerta a l'Estatut d'autonomia de Catalunya"
      ]
    },
    {
      titol: "Les institucions polítiques de Catalunya",
      subtemes: [
        "La Generalitat de Catalunya",
        "El Parlament de Catalunya",
        "La Presidència de la Generalitat de Catalunya",
        "El Govern i l'Administració de la Generalitat de Catalunya",
        "Altres institucions estatutàries"
      ]
    },
    {
      titol: "L'ordenament jurídic de l'Estat",
      subtemes: [
        "L'ordenament jurídic",
        "La Constitució espanyola",
        "La llei",
        "Les normes amb rang de llei",
        "El reglament",
        "Els tractats internacionals"
      ]
    },
    {
      titol: "Els drets humans i els drets constitucionals",
      subtemes: [
        "Les declaracions de drets humans",
        "Els drets fonamentals i les llibertats públiques",
        "La titularitat dels drets constitucionals",
        "Els drets constitucionals relacionats amb el procés penal",
        "Les garanties normatives",
        "Les garanties institucionals: el Defensor del Poble",
        "Les garanties jurisdiccionals",
        "La suspensió dels drets constitucionals"
      ]
    },
    {
      titol: "Les institucions polítiques de l'Estat",
      subtemes: [
        "Les Corts Generals",
        "El Govern",
        "La Corona",
        "Altres institucions de l'Estat"
      ]
    },
    {
      titol: "Els òrgans jurisdiccionals. Poder judicial i Tribunal Constitucional",
      subtemes: [
        "Poder judicial i potestat jurisdiccional",
        "El Consell General del Poder Judicial",
        "El Ministeri Fiscal",
        "El Tribunal Constitucional"
      ]
    },
    {
      titol: "L'organització territorial de l'Estat",
      subtemes: [
        "Els models d'organització territorial",
        "El model territorial a la Constitució espanyola de 1978",
        "Les comunitats autònomes",
        "Els municipis",
        "Les províncies",
        "Les comarques",
        "Les vegueries"
      ]
    },
    {
      titol: "La Unió Europea",
      subtemes: [
        "Origen històric de la Unió Europea",
        "L'ordenament jurídic comunitari: dret comunitari originari i dret derivat",
        "Institucions comunitàries"
      ]
    }
  ],
  C: [
    {
      titol: "Les competències de la Generalitat en matèria de seguretat",
      subtemes: [
        "Definició de competència",
        "La competència en matèria de seguretat"
      ]
    },
    {
      titol: "El Departament d'Interior i Seguretat Pública",
      subtemes: [
        "Funcions del Departament d'Interior i Seguretat Pública",
        "Estructura del Departament d'Interior i Seguretat Pública",
        "Funcions i estructura de la Direcció General de la Policia",
        "La Policia de la Generalitat - Mossos d'Esquadra",
        "L'Institut de Seguretat Pública de Catalunya",
        "El Servei Català de Trànsit",
        "Centre d'Atenció i Gestió de Trucades d'Urgència 112 Catalunya"
      ]
    },
    {
      titol: "La coordinació policial",
      subtemes: [
        "El concepte de coordinació policial",
        "La coordinació amb les forces i cossos de seguretat de l'Estat. La coordinació amb les policies locals de Catalunya",
        "Els òrgans de coordinació establerts per la Llei 4/2003, de 7 d'abril, d'ordenació del sistema de seguretat pública de Catalunya",
        "La cooperació policial internacional: Interpol i Europol",
        "Els acords internacionals en matèria de seguretat. El sistema d'informació Schengen (SIS)"
      ]
    },
    {
      titol: "El marc legal de la seguretat",
      subtemes: [
        "La Llei orgànica 2/1986, de 13 de març, de forces i cossos de seguretat. Principis bàsics d'actuació",
        "Llei 10/1994, d'11 de juliol, de la Policia de la Generalitat - Mossos d'Esquadra. Funcions, àmbit territorial d'actuació i estructura",
        "La Llei 16/1991, de 10 de juliol, de les policies locals de Catalunya. Funcions"
      ]
    },
    {
      titol: "El Codi deontològic policial",
      subtemes: [
        "La deontologia policial",
        "El Codi europeu d'ètica de la policia",
        "Acord GOV/25/2015, de 24 de febrer, pel qual s'aprova el Codi d'ètica de la Policia de Catalunya"
      ]
    }
  ]
};
