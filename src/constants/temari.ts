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
        "1. L’antiguitat a Catalunya",
        "2. La Catalunya romana",
        "3. El naixement de Catalunya",
        "4. La Catalunya feudal (s. XI-XII)",
        "5. L’expansió catalanoaragonesa (s. XIII-XIV)",
        "6. La crisi de la baixa edat mitjana (s. XIV i XV)",
        "7. Catalunya en la monarquia hispànica i la Guerra dels Segadors (s. XVI-XVII)",
        "8. La Guerra de Successió i l’Onze de Setembre",
        "9. Les transformacions del segle XVIII"
      ]
    },
    {
      titol: "Història de Catalunya (part II)",
      subtemes: [
        "1. El segle XIX: la crisi de l'Antic Règim i la construcció de l'Estat liberal",
        "2. Catalunya, la industrialització i l'obrerisme",
        "3. La restauració borbònica i el catalanisme polític",
        "4. El primer terç del segle XX (1898-1931)",
        "5. La República i la Guerra Civil",
        "6. La dictadura franquista",
        "7. La Transició i la recuperació de l'autonomia",
        "8. La Catalunya del segle XXI"
      ]
    },
    {
      titol: "Història de la policia a Catalunya",
      subtemes: [
        "1. Les forces de seguretat i la seva història",
        "2. L'origen dels Mossos d'Esquadra",
        "3. Transformacions policials durant el segle XIX",
        "4. La policia durant les primeres dècades del segle XX",
        "5. La policia i la democràcia"
      ]
    },
    {
      titol: "Àmbit sociolingüístic",
      subtemes: [
        "1. Història de la llengua",
        "2. Varietats lingüístiques",
        "3. La llengua aranesa",
        "4. Noves versions de la Gramàtica de la llengua catalana i de l’Ortografia catalana"
      ]
    },
    {
      titol: "Marc geogràfic de Catalunya",
      subtemes: [
        "1. Situació i divisió administrativa",
        "2. El relleu",
        "3. Els climes a Catalunya",
        "4. La xarxa hidrogràfica",
        "5. La vegetació",
        "6. La població"
      ]
    },
    {
      titol: "Entorn social a Catalunya",
      subtemes: [
        "1. La migració a Catalunya i fluxos migratoris",
        "2. Les polítiques públiques en matèria d’immigració",
        "3. Models d’integració i marcs de convivència en la societat multicultural",
        "4. Les polítiques públiques en matèria d’igualtat d’oportunitats",
        "5. Els serveis socials a Catalunya"
      ]
    },
    {
      titol: "Les tecnologies de la informació en el segle XXI",
      subtemes: [
        "1. La societat del coneixement i les tecnologies de la informació. Internet i la Internet de les coses (IoT)",
        "2. Efectes de les tecnologies de la informació i la comunicació (TIC)",
        "3. Seguretat de la informació",
        "4. L'administració electrònica. Signatura electrònica",
        "5. Comunicació i control públic: espais de seguretat i alarmes socials"
      ]
    }
  ],
  B: [
    {
      titol: "L'Estatut d'autonomia de Catalunya (EAC)",
      subtemes: [
        "1. Antecedents històrics i naturalesa jurídica",
        "2. Contingut i estructura",
        "3. Els drets, els deures i els principis rectors",
        "4. Les competències de la Generalitat de Catalunya",
        "5. La competència en matèria de seguretat pública"
      ]
    },
    {
      titol: "Les institucions polítiques de Catalunya",
      subtemes: [
        "1. La Generalitat de Catalunya",
        "2. El Parlament de Catalunya",
        "3. La Presidència de la Generalitat de Catalunya",
        "4. El Govern i l'Administració de la Generalitat de Catalunya",
        "5. Altres institucions estatutàries"
      ]
    },
    {
      titol: "L'ordenament jurídic de l'Estat",
      subtemes: [
        "1. L'ordenament jurídic",
        "2. La Constitució espanyola",
        "3. La llei",
        "4. Les normes amb rang de llei",
        "5. El reglament",
        "6. Els tractats internacionals"
      ]
    },
    {
      titol: "Els drets humans i els drets constitucionals",
      subtemes: [
        "1. Les declaracions de drets humans",
        "2. Els drets fonamentals i les llibertats públiques",
        "3. La titularitat dels drets constitucionals",
        "4. Els drets constitucionals relacionats amb el procés penal",
        "5. Les garanties normatives",
        "6. Les garanties institucionals: el Defensor del Poble",
        "7. Les garanties jurisdiccionals",
        "8. La suspensió dels drets constitucionals"
      ]
    },
    {
      titol: "Les institucions polítiques de l'Estat",
      subtemes: [
        "1. Les Corts Generals",
        "2. El Govern",
        "3. La Corona",
        "4. Altres institucions de l'Estat"
      ]
    },
    {
      titol: "Els òrgans jurisdiccionals",
      subtemes: [
        "1. Poder judicial i potestat jurisdiccional",
        "2. El Consell General del Poder Judicial",
        "3. El Ministeri Fiscal",
        "4. El Tribunal Constitucional"
      ]
    },
    {
      titol: "L'organització territorial de l'Estat",
      subtemes: [
        "1. Els models d'organització territorial",
        "2. El model territorial a la Constitució espanyola de 1978",
        "3. Les comunitats autònomes",
        "4. Els municipis",
        "5. Les províncies",
        "6. Les comarques",
        "7. Les vegueries"
      ]
    },
    {
      titol: "La Unió Europea",
      subtemes: [
        "1. Origen històric de la Unió Europea",
        "2. L’ordenament jurídic comunitari: dret comunitari originari i dret derivat",
        "3. Institucions comunitàries"
      ]
    }
  ],
  C: [
    {
      titol: "Les competències de la Generalitat en matèria de seguretat",
      subtemes: [
        "1. Definició de competència",
        "2. La competència en matèria de seguretat"
      ]
    },
    {
      titol: "El Departament d’Interior i Seguretat Pública",
      subtemes: [
        "1. Funcions del Departament d’Interior i Seguretat Pública",
        "2. Estructura del Departament d’Interior i Seguretat Pública",
        "3. Funcions i estructura de la Direcció General de la Policia",
        "4. La Policia de la Generalitat - Mossos d’Esquadra",
        "5. L’Institut de Seguretat Pública de Catalunya",
        "6. El Servei Català de Trànsit",
        "7. Centre d’Atenció i Gestió de Trucades d’Urgència 112 Catalunya"
      ]
    },
    {
      titol: "La coordinació policial",
      subtemes: [
        "1. El concepte de coordinació policial",
        "2. La coordinació amb les forces i cossos de seguretat de l’Estat. La coordinació amb les policies locals de Catalunya",
        "3. Els òrgans de coordinació establerts per la Llei 4/2003",
        "4. La cooperació policial internacional: Interpol i Europol",
        "5. Els acords internacionals en matèria de seguretat. El sistema d’informació Schengen (SIS)"
      ]
    },
    {
      titol: "El marc legal de la seguretat a Catalunya",
      subtemes: [
        "1. La Llei orgànica 2/1986 de forces i cossos de seguretat (principis)",
        "2. Llei 10/1994 de la Policia de la Generalitat - Mossos d'Esquadra",
        "3. La Llei 16/1991 de les policies locals de Catalunya"
      ]
    },
    {
      titol: "El Codi deontològic policial",
      subtemes: [
        "1. La deontologia policial",
        "2. El Codi europeu d'ètica de la policia",
        "3. El Codi d'ètica de la Policia de Catalunya"
      ]
    }
  ]
};
