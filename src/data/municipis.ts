/**
 * BASE DE DADES DE CATALUNYA
 * Organitzada per Província -> Comarca -> Municipis
 * Segons les dades facilitades per l'usuari.
 */
export const DATA_CATALUNYA: Record<string, Record<string, string[]>> = {
  "Barcelona": {
    "Alt Penedès": [
      "Avinyonet del Penedès", "Cabanyes, les", "Castellet i la Gornal", "Castellví de la Marca",
      "Font-rubí", "Gelida", "Granada, la", "Mediona", "Olèrdola", "Olesa de Bonesvalls",
      "Pacs del Penedès", "Pla del Penedès, el", "Pontons", "Puigdàlber", "Sant Cugat Sesgarrigues",
      "Sant Llorenç d'Hortons", "Sant Martí Sarroca", "Sant Pere de Riudebitlles",
      "Sant Quintí de Mediona", "Sant Sadurní d'Anoia", "Santa Fe del Penedès",
      "Santa Margarida i els Monjos", "Subirats", "Torrelavit", "Torrelles de Foix",
      "Vilafranca del Penedès", "Vilobí del Penedès"
    ],
    "Anoia": [
      "Argençola", "Bellprat", "Bruc, el", "Cabrera d'Anoia", "Calaf", "Calonge de Segarra",
      "Capellades", "Carme", "Castellfollit de Riubregós", "Castellolí", "Copons",
      "Hostalets de Pierola, els", "Igualada", "Jorba", "Llacuna, la", "Masquefa",
      "Montmaneu", "Òdena", "Orpí", "Piera", "Pobla de Claramunt, la", "Prats de Rei, els",
      "Pujalt", "Rubió", "Sant Martí de Tous", "Sant Martí Sesgueioles", "Sant Pere Sallavinera",
      "Santa Margarida de Montbui", "Santa Maria de Miralles", "Torre de Claramunt, la",
      "Vallbona d'Anoia", "Veciana", "Vilanova del Camí"
    ],
    "Bages": [
      "Aguilar de Segarra", "Artés", "Avinyó", "Balsareny", "Callús", "Cardona",
      "Castellbell i el Vilar", "Castellfollit del Boix", "Castellgalí", "Castellnou de Bages",
      "Fonollosa", "Gaià", "Manresa", "Marganell", "Monistrol de Montserrat", "Mura",
      "Navarcles", "Navàs", "Pont de Vilomara i Rocafort, el", "Rajadell", "Sallent",
      "Sant Fruitós de Bages", "Sant Joan de Vilatorrada", "Sant Mateu de Bages",
      "Sant Salvador de Guardiola", "Sant Vicenç de Castellet", "Santpedor", "Súria", "Talamanca"
    ],
    "Baix Llobregat": [
      "Abrera", "Begues", "Castelldefels", "Castellví de Rosanes", "Cervelló", "Collbató",
      "Corbera de Llobregat", "Cornellà de Llobregat", "Esparreguera", "Esplugues de Llobregat",
      "Gavà", "Martorell", "Molins de Rei", "Olesa de Montserrat", "Pallejà",
      "Palma de Cervelló, la", "Papiol, el", "Prat de Llobregat, el", "Sant Andreu de la Barca",
      "Sant Boi de Llobregat", "Sant Climent de Llobregat", "Sant Esteve Sesrovires",
      "Sant Feliu de Llobregat", "Sant Joan Despí", "Sant Just Desvern", "Sant Vicenç dels Horts",
      "Santa Coloma de Cervelló", "Torrelles de Llobregat", "Vallirana", "Viladecans"
    ],
    "Barcelonès": [
      "Badalona", "Barcelona", "Hospitalet de Llobregat, l'", "Sant Adrià de Besòs",
      "Santa Coloma de Gramenet"
    ],
    "Berguedà": [
      "Avià", "Bagà", "Berga", "Borredà", "Capolat", "Casserres", "Castell de l'Areny",
      "Castellar de n'Hug", "Castellar del Riu", "Cercs", "Espunyola, l'", "Fígols",
      "Gironella", "Gisclareny", "Guardiola de Berguedà", "Montclar", "Montmajor",
      "Nou de Berguedà, la", "Olvan", "Pobla de Lillet, la", "Puig-reig", "Quar, la",
      "Sagàs", "Saldes", "Sant Jaume de Frontanyà", "Sant Julià de Cerdanyola",
      "Santa Maria de Merlès", "Vallcebre", "Vilada", "Viver i Serrateix"
    ],
    "Garraf": [
      "Canyelles", "Cubelles", "Olivella", "Sant Pere de Ribes", "Sitges", "Vilanova i la Geltrú"
    ],
    "Maresme": [
      "Alella", "Arenys de Mar", "Arenys de Munt", "Argentona", "Cabrera de Mar", "Cabrils",
      "Caldes d'Estrac", "Calella", "Canet de Mar", "Dosrius", "Malgrat de Mar", "Masnou, el",
      "Mataró", "Montgat", "Òrrius", "Palafolls", "Pineda de Mar", "Premià de Dalt",
      "Premià de Mar", "Sant Andreu de Llavaneres", "Sant Cebrià de Vallalta",
      "Sant Iscle de Vallalta", "Sant Pol de Mar", "Sant Vicenç de Montalt", "Santa Susanna",
      "Teià", "Tiana", "Tordera", "Vilassar de Dalt", "Vilassar de Mar"
    ],
    "Moianès": [
      "Calders", "Castellcir", "Castellterçol", "Collsuspina", "Estany, l'", "Granera",
      "Moià", "Monistrol de Calders", "Sant Quirze Safaja", "Santa Maria d'Oló"
    ],
    "Osona": [
      "Aiguafreda", "Balenyà", "Brull, el", "Calldetenes", "Centelles", "Esquirol, l'",
      "Folgueroles", "Gurb", "Malla", "Manlleu", "Masies de Roda, les", "Masies de Voltregà, les",
      "Montesquiu", "Muntanyola", "Orís", "Roda de Ter", "Rupit i Pruit",
      "Sant Agustí de Lluçanès", "Sant Bartomeu del Grau", "Sant Boi de Lluçanès",
      "Sant Hipòlit de Voltregà", "Sant Julià de Vilatorta", "Sant Martí de Centelles",
      "Sant Pere de Torelló", "Sant Quirze de Besora", "Sant Sadurní d'Osormort",
      "Sant Vicenç de Torelló", "Santa Cecília de Voltregà", "Santa Eugènia de Berga",
      "Santa Eulàlia de Riuprimer", "Santa Maria de Besora", "Seva", "Sora", "Taradell",
      "Tavèrnoles", "Tavertet", "Tona", "Torelló", "Vic", "Vilanova de Sau"
    ],
    "Vallès Occidental": [
      "Badia del Vallès", "Barberà del Vallès", "Castellar del Vallès", "Castellbisbal",
      "Cerdanyola del Vallès", "Gallifa", "Matadepera", "Montcada i Reixac",
      "Palau-solità i Plegamans", "Polinyà", "Rellinars", "Ripollet", "Rubí", "Sabadell",
      "Sant Cugat del Vallès", "Sant Llorenç Savall", "Sant Quirze del Vallès",
      "Santa Perpètua de Mogoda", "Sentmenat", "Terrassa", "Ullastrell", "Vacarisses",
      "Viladecavalls"
    ],
    "Vallès Oriental": [
      "Ametlla del Vallès, l'", "Bigues i Riells del Fai", "Caldes de Montbui", "Campins",
      "Canovelles", "Cànoves i Samalús", "Cardedeu", "Figaró-Montmany", "Fogars de Montclús",
      "Franqueses del Vallès, les", "Garriga, la", "Granollers", "Gualba", "Llagosta, la",
      "Lliçà d'Amunt", "Lliçà de Vall", "Llinars del Vallès", "Martorelles",
      "Mollet del Vallès", "Montmeló", "Montornès del Vallès", "Montseny", "Parets del Vallès",
      "Roca del Vallès, la", "Sant Antoni de Vilamajor", "Sant Celoni",
      "Sant Esteve de Palautordera", "Sant Feliu de Codines", "Sant Fost de Campsentelles",
      "Sant Pere de Vilamajor", "Santa Eulàlia de Ronçana", "Santa Maria de Martorelles",
      "Santa Maria de Palautordera", "Tagamanent", "Vallgorguina", "Vallromanes",
      "Vilalba Sasserra", "Vilanova del Vallès"
    ],
    "Lluçanès": [
      "Alpens", "Lluçà", "Olost", "Oristà", "Perafita", "Prats de Lluçanès",
      "Sant Martí d'Albars", "Sobremunt"
    ]
  },
  "Girona": {
    "Alt Empordà": [
      "Agullana", "Albanyà", "Armentera, l'", "Avinyonet de Puigventós", "Bàscara", "Biure",
      "Boadella i les Escaules", "Borrassà", "Cabanelles", "Cabanes", "Cadaqués", "Cantallops",
      "Capmany", "Castelló d'Empúries", "Cistella", "Colera", "Darnius", "Escala, l'",
      "Espolla", "Far d'Empordà, el", "Figueres", "Fortià", "Garrigàs", "Garriguella",
      "Jonquera, la", "Lladó", "Llançà", "Llers", "Maçanet de Cabrenys", "Masarac i Vilarnadal",
      "Mollet de Peralada", "Navata", "Ordis", "Palau de Santa Eulàlia", "Palau-saverdera",
      "Pau", "Pedret i Marzà", "Peralada", "Pont de Molins", "Pontós", "Port de la Selva, el",
      "Portbou", "Rabós", "Riumors", "Roses", "Sant Climent Sescebes", "Sant Llorenç de la Muga",
      "Sant Miquel de Fluvià", "Sant Mori", "Sant Pere Pescador", "Santa Llogaia d'Àlguema",
      "Saus, Camallera i Llampaies", "Selva de Mar, la", "Siurana", "Terrades",
      "Torroella de Fluvià", "Vajol, la", "Ventalló", "Vila-sacra", "Vilabertran", "Viladamat",
      "Vilafant", "Vilajuïga", "Vilamacolum", "Vilamalla", "Vilamaniscle", "Vilanant", "Vilaür"
    ],
    "Baix Empordà": [
      "Albons", "Begur", "Bellcaire d'Empordà", "Bisbal d'Empordà, la", "Calonge i Sant Antoni",
      "Castell d'Aro, Platja d'Aro i s'Agaró", "Colomers", "Corçà",
      "Cruïlles, Monells i Sant Sadurní de l'Heura", "Foixà", "Fontanilles", "Forallac",
      "Garrigoles", "Gualta", "Jafre", "Mont-ras", "Palafrugell", "Palamós", "Palau-sator",
      "Pals", "Parlavà", "Pera, la", "Regencós", "Rupià", "Serra de Daró",
      "Tallada d'Empordà, la", "Torrent", "Torroella de Montgrí", "Ullà", "Ullastret",
      "Ultramort", "Vall-llobrega", "Verges", "Vilopriu"
    ],
    "Cerdanya": [
      "Alp", "Bolvir", "Das", "Fontanals de Cerdanya", "Ger", "Guils de Cerdanya", "Isòvol",
      "Meranges", "Puigcerdà", "Urús"
    ],
    "Garrotxa": [
      "Argelaguer", "Besalú", "Beuda", "Castellfollit de la Roca", "Maià de Montcal", "Mieres",
      "Montagut i Oix", "Olot", "Planes d'Hostoles, les", "Preses, les", "Riudaura",
      "Sales de Llierca", "Sant Aniol de Finestres", "Sant Feliu de Pallerols", "Sant Ferriol",
      "Sant Jaume de Llierca", "Sant Joan les Fonts", "Santa Pau", "Tortellà",
      "Vall d'en Bas, la", "Vall de Bianya, la"
    ],
    "Gironès": [
      "Aiguaviva", "Bescanó", "Bordils", "Campllong", "Canet d'Adri", "Cassà de la Selva",
      "Celrà", "Cervià de Ter", "Flaçà", "Fornells de la Selva", "Girona", "Juià", "Llagostera",
      "Llambilles", "Madremanya", "Quart", "Salt", "Sant Andreu Salou", "Sant Gregori",
      "Sant Joan de Mollet", "Sant Jordi Desvalls", "Sant Julià de Ramis", "Sant Martí de Llémena",
      "Sant Martí Vell", "Sarrià de Ter", "Vilablareix", "Viladasens"
    ],
    "Pla de l'Estany": [
      "Banyoles", "Camós", "Cornellà del Terri", "Crespià", "Esponellà", "Fontcoberta",
      "Palol de Revardit", "Porqueres", "Sant Miquel de Campmajor", "Serinyà", "Vilademuls"
    ],
    "Ripollès": [
      "Campdevànol", "Campelles", "Camprodon", "Gombrèn", "Llanars", "Llosses, les", "Molló",
      "Ogassa", "Pardines", "Planoles", "Queralbs", "Ribes de Freser", "Ripoll",
      "Sant Joan de les Abadesses", "Sant Pau de Segúries", "Setcases", "Toses",
      "Vallfogona de Ripollès", "Vilallonga de Ter"
    ],
    "Selva": [
      "Amer", "Anglès", "Arbúcies", "Blanes", "Breda", "Brunyola i Sant Martí Sapresa",
      "Caldes de Malavella", "Cellera de Ter, la", "Hostalric", "Lloret de Mar",
      "Maçanet de la Selva", "Massanes", "Osor", "Riells i Viabrea", "Riudarenes",
      "Riudellots de la Selva", "Sant Feliu de Buixalleu", "Sant Hilari Sacalm",
      "Sant Julià del Llor i Bonmatí", "Santa Coloma de Farners", "Sils", "Susqueda",
      "Tossa de Mar", "Vidreres", "Vilobí d'Onyar"
    ]
  },
  "Lleida": {
    "Alta Ribagorça": [
      "Pont de Suert, el", "Vall de Boí, la", "Vilaller"
    ],
    "Alt Urgell": [
      "Alàs i Cerc", "Arsèguel", "Bassella", "Cabó", "Cava", "Coll de Nargó", "Estamariu",
      "Fígols i Alinyà", "Josa i Tuixén", "Montferrer i Castellbò", "Oliana", "Organyà",
      "Peramola", "Pont de Bar, el", "Ribera d'Urgellet", "Seu d'Urgell, la",
      "Valls d'Aguilar, les", "Valls de Valira, les", "Vansa i Fórnols, la"
    ],
    "Aran": [
      "Arres", "Bausen", "Bòrdes, Es", "Bossòst", "Canejan", "Les", "Naut Aran",
      "Vielha e Mijaran", "Vilamòs"
    ],
    "Cerdanya": [
      "Bellver de Cerdanya", "Lles de Cerdanya", "Montellà i Martinet", "Prats i Sansor",
      "Prullans", "Riu de Cerdanya"
    ],
    "Garrigues": [
      "Albagés, l'", "Albi, l'", "Arbeca", "Bellaguarda", "Borges Blanques, les", "Bovera",
      "Castelldans", "Cervià de les Garrigues", "Cogul, el", "Espluga Calba, l'", "Floresta, la",
      "Fulleda", "Granadella, la", "Granyena de les Garrigues", "Juncosa", "Juneda",
      "Omellons, els", "Pobla de Cérvoles, la", "Puiggròs", "Soleràs, el", "Tarrés",
      "Torms, els", "Vilosell, el", "Vinaixa"
    ],
    "Noguera": [
      "Àger", "Albesa", "Algerri", "Alòs de Balaguer", "Artesa de Segre",
      "Avellanes i Santa Linya, les", "Balaguer", "Baronia de Rialb, la", "Bellcaire d'Urgell",
      "Bellmunt d'Urgell", "Cabanabona", "Camarasa", "Castelló de Farfanya", "Cubells",
      "Foradada", "Ivars de Noguera", "Menàrguens", "Montgai", "Oliola", "Os de Balaguer",
      "Penelles", "Ponts", "Preixens", "Sentiu de Sió, la", "Térmens", "Tiurana",
      "Torrelameu", "Vallfogona de Balaguer", "Vilanova de l'Aguda", "Vilanova de Meià"
    ],
    "Pallars Jussà": [
      "Abella de la Conca", "Castell de Mur", "Conca de Dalt", "Gavet de la Conca",
      "Isona i Conca Dellà", "Llimiana", "Pobla de Segur, la", "Salàs de Pallars",
      "Sant Esteve de la Sarga", "Sarroca de Bellera", "Senterada", "Talarn",
      "Torre de Cabdella, la", "Tremp"
    ],
    "Pallars Sobirà": [
      "Alins", "Alt Àneu", "Baix Pallars", "Espot", "Esterri d'Àneu", "Esterri de Cardós",
      "Farrera", "Guingueta d'Àneu, la", "Lladorre", "Llavorsí", "Rialp", "Soriguera",
      "Sort", "Tírvia", "Vall de Cardós"
    ],
    "Pla d'Urgell": [
      "Barbens", "Bell-lloc d'Urgell", "Bellvís", "Castellnou de Seana", "Fondarella",
      "Golmés", "Ivars d'Urgell", "Linyola", "Miralcamp", "Mollerussa", "Palau d'Anglesola, el",
      "Poal, el", "Sidamon", "Torregrossa", "Vila-sana", "Vilanova de Bellpuig"
    ],
    "Segarra": [
      "Cervera", "Estaràs", "Granyanella", "Granyena de Segarra", "Guissona", "Ivorra",
      "Massoteres", "Montoliu de Segarra", "Montornès de Segarra", "Oluges, les",
      "Plans de Sió, els", "Ribera d'Ondara", "Sanaüja", "Sant Guim de Freixenet",
      "Sant Guim de la Plana", "Sant Ramon", "Talavera", "Tarroja de Segarra",
      "Torrefeta i Florejacs"
    ],
    "Segrià": [
      "Aitona", "Alamús, els", "Albatàrrec", "Alcanó", "Alcarràs", "Alcoletge", "Alfarràs",
      "Alfés", "Alguaire", "Almacelles", "Almatret", "Almenar", "Alpicat", "Artesa de Lleida",
      "Aspa", "Benavent de Segrià", "Corbins", "Gimenells i el Pla de la Font",
      "Granja d'Escarp, la", "Llardecans", "Lleida", "Maials", "Massalcoreig", "Montoliu de Lleida",
      "Portella, la", "Puigverd de Lleida", "Rosselló", "Sarroca de Lleida", "Seròs", "Soses",
      "Sudanell", "Sunyer", "Torre-serona", "Torrebesses", "Torrefarrera", "Torres de Segre",
      "Vilanova de la Barca", "Vilanova de Segrià"
    ],
    "Solsonès": [
      "Biosca", "Castellar de la Ribera", "Clariana de Cardener", "Coma i la Pedra, la",
      "Guixers", "Lladurs", "Llobera", "Molsosa, la", "Navès", "Odèn", "Olius",
      "Pinell de Solsonès", "Pinós", "Riner", "Sant Llorenç de Morunys", "Solsona", "Torà"
    ],
    "Urgell": [
      "Agramunt", "Anglesola", "Belianes", "Bellpuig", "Castellserà", "Ciutadilla",
      "Fuliola, la", "Guimerà", "Maldà", "Nalec", "Omells de na Gaia, els", "Ossó de Sió",
      "Preixana", "Puigverd d'Agramunt", "Sant Martí de Riucorb", "Tàrrega", "Tornabous",
      "Vallbona de les Monges", "Verdú", "Vilagrassa"
    ]
  },
  "Tarragona": {
    "Alt Camp": [
      "Aiguamúrcia", "Alcover", "Alió", "Bràfim", "Cabra del Camp", "Figuerola del Camp",
      "Garidells, els", "Masó, la", "Milà, el", "Mont-ral", "Montferri", "Nulles",
      "Pla de Santa Maria, el", "Pont d'Armentera, el", "Puigpelat", "Querol", "Riba, la",
      "Rodonyà", "Rourell, el", "Vallmoll", "Valls", "Vila-rodona", "Vilabella"
    ],
    "Baix Camp": [
      "Albiol, l'", "Aleixar, l'", "Alforja", "Almoster", "Arbolí", "Argentera, l'",
      "Borges del Camp, les", "Botarell", "Cambrils", "Capafonts", "Castellvell del Camp",
      "Colldejou", "Duesaigües", "Febró, la", "Maspujols", "Mont-roig del Camp",
      "Montbrió del Camp", "Prades", "Pratdip", "Reus", "Riudecanyes", "Riudecols", "Riudoms",
      "Selva del Camp, la", "Vandellòs i l'Hospitalet de l'Infant", "Vilanova d'Escornalbou",
      "Vilaplana", "Vinyols i els Arcs"
    ],
    "Baix Ebre": [
      "Aldea, l'", "Aldover", "Alfara de Carles", "Ametlla de Mar, l'", "Ampolla, l'",
      "Benifallet", "Camarles", "Deltebre", "Paüls", "Perelló, el", "Roquetes", "Tivenys",
      "Tortosa", "Xerta"
    ],
    "Baix Penedès": [
      "Albinyana", "Arboç, l'", "Banyeres del Penedès", "Bellvei", "Bisbal del Penedès, la",
      "Bonastre", "Calafell", "Cunit", "Llorenç del Penedès", "Masllorenç", "Montmell, el",
      "Sant Jaume dels Domenys", "Santa Oliva", "Vendrell, el"
    ],
    "Conca de Barberà": [
      "Barberà de la Conca", "Blancafort", "Conesa", "Espluga de Francolí, l'", "Forès",
      "Llorac", "Montblanc", "Passanant i Belltall", "Piles, les", "Pira", "Pontils",
      "Rocafort de Queralt", "Santa Coloma de Queralt", "Sarral", "Savallà del Comtat",
      "Senan", "Solivella", "Vallclara", "Vallfogona de Riucorb", "Vilanova de Prades",
      "Vilaverd", "Vimbodí i Poblet"
    ],
    "Montsià": [
      "Alcanar", "Amposta", "Freginals", "Galera, la", "Godall", "Mas de Barberans",
      "Masdenverge", "Ràpita, la", "Sant Jaume d'Enveja", "Santa Bàrbara", "Sénia, la",
      "Ulldecona"
    ],
    "Priorat": [
      "Bellmunt del Priorat", "Bisbal de Montsant, la", "Cabacés", "Capçanes",
      "Cornudella de Montsant", "Falset", "Figuera, la", "Gratallops", "Guiamets, els",
      "Lloar, el", "Marçà", "Margalef", "Masroig, el", "Molar, el", "Morera de Montsant, la",
      "Poboleda", "Porrera", "Pradell de la Teixeta", "Torre de Fontaubella, la",
      "Torroja del Priorat", "Ulldemolins", "Vilella Alta, la", "Vilella Baixa, la"
    ],
    "Ribera d'Ebre": [
      "Ascó", "Benissanet", "Flix", "Garcia", "Ginestar", "Miravet", "Móra d'Ebre",
      "Móra la Nova", "Palma d'Ebre, la", "Rasquera", "Riba-roja d'Ebre", "Tivissa",
      "Torre de l'Espanyol, la", "Vinebre"
    ],
    "Tarragonès": [
      "Altafulla", "Canonja, la", "Catllar, el", "Constantí", "Creixell", "Morell, el",
      "Nou de Gaià, la", "Pallaresos, els", "Perafort", "Pobla de Mafumet, la",
      "Pobla de Montornès, la", "Renau", "Riera de Gaià, la", "Roda de Berà", "Salomó",
      "Salou", "Secuita, la", "Tarragona", "Torredembarra", "Vespella de Gaià", "Vila-seca",
      "Vilallonga del Camp"
    ],
    "Terra Alta": [
      "Arnes", "Batea", "Bot", "Caseres", "Corbera d'Ebre", "Fatarella, la", "Gandesa",
      "Horta de Sant Joan", "Pinell de Brai, el", "Pobla de Massaluca, la", "Prat de Comte",
      "Vilalba dels Arcs"
    ]
  }
};
