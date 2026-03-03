import {googleSheetScriptUrl} from "./script_key.js";

export const CONFIG = {
    // API Configuration
    googleScriptUrl: googleSheetScriptUrl,
    enableDataCollection: true,
};

// Define attitudes based on the questions
export const ATTITUDES = {
    VIVO_SENZA_AUTO: "Vivo anche senza auto",
    GRETA: "Siamo con Greta!",
    VERDE: "Più verde c'è meglio è",
    PIAZZA: "La piazza è la mia casa",
    FATEMI_DORMIRE: "Fatemi dormire",
    STATUS_QUO: "Lascia stare, perchè cambiare?",
    NON_VIVO_SENZA_AUTO: "Non posso vivere senza auto"
};

export const QUIZ_DATA = {
    title: "Questionario Via Libera 2",

    questions: [
        {
            type: "description_light",
            text: [
                "Ecco alcuni modi che abbiamo testato per avvicinare le persone:",
            ]
        },
        {
            type: "description",
            text: [
                "Ciao, hai 5 minuti per partecipare a un gioco sul tuo quartiere? è anonimo!",
                "",
                "Ciao stiamo mappando i sogni delle persone di Milano su come gestire spazio pubblico della città, ti va di dirci il tuo sogno?",
                "",
                "Ti va di giocare a un gioco sul quartiere?  C’è un regalo alla fine!"
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description_light",
            text: [
                "Ora ti farò alcune domande.",
                "Le risposte restano anonime: non raccogliamo nomi o dati personali.",
                "Useremo tutte le risposte insieme per capire cosa le persone desiderano per gli spazi pubblici della città.",
                "Ok?"
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description_light",
            text: [
                "Immagina di essere il sindaco di Milano.",
                "Ora ti leggo alcune cose che si potrebbero fare in città.",
                "Scegli le 3 più importanti per te, dalla più importante alle altre.",
            ]
        },
        {
            type: "sorting",
            id: "o1",
            text: [
                "- Più verde urbano (alberi, aiuole, orti)",
                "- Incentivare la mobilità sostenibile (piste ciclabili, pedonalizzazioni, ZTL, servizi di sharing)",
                "- Più spazi per la socialità e per le famiglie (giochi, panchine, spazi comunitari, luoghi sicuri)",
                "- Più spazi culturali e per lo sport (eventi, arte urbana, campetti)",
                "- Più parcheggi per auto e moto",
                "- Migliorare la circolazione e la viabilità delle auto (onde verdi, corsie preferenziali per auto/moto)"],
            options: [
                "Più verde urbano",
                "Mobilità sostenibile",
                "Spazi di socialità e famiglie",
                "Spazi culturali e sport",
                "Più parcheggi",
                "Migliorare la circolazione delle auto",
            ],
            max: 3
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description_light",
            text: [
                "Ora ti dirò alcune frasi.",
                "Per ognuna dimmi quanto sei d’accordo, dando un numero da 1 a 10.",
                "1 vuol dire per niente d’accordo.",
                "10 vuol dire completamente d’accordo."
            ]
        },
        {
            id: 'q1',
            attitude: ATTITUDES.VIVO_SENZA_AUTO,
            type: "slider",
            text: "In città troppo spazio è occupato dalle auto.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Per niente<br>d'accordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q2',
            attitude: ATTITUDES.NON_VIVO_SENZA_AUTO,
            type: "slider",
            text: "Molte persone usano l’auto perché i mezzi pubblici funzionano male.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Per niente<br>d'accordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q3',
            attitude: ATTITUDES.GRETA,
            type: "slider",
            text: "Ridurre le auto è importante per combattere il cambiamento climatico.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Per niente<br>d'accordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q4',
            attitude: ATTITUDES.STATUS_QUO,
            type: "slider",
            text: "Mi sta bene che le auto parcheggiate occupino molto spazio nelle strade e sui marciapiedi.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Per niente<br>d'accordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q5',
            attitude: ATTITUDES.VERDE,
            type: "slider",
            text: "Vorrei più verde nel mio quartiere, anche se questo significa perdere qualche parcheggio.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Per niente<br>d'accordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q6',
            attitude: ATTITUDES.FATEMI_DORMIRE,
            type: "slider",
            text: "Mi preoccupa che nuovi spazi dove le persone si incontrano nel mio quartiere possano creare più rumore e confusione.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Per niente<br>d'accordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q7',
            attitude: ATTITUDES.PIAZZA,
            type: "slider",
            text: "Alcuni parcheggi nel mio quartiere potrebbero diventare spazi per incontrarsi o per giocare.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Per niente<br>d'accordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "radio",
            id: "r1",
            text: "Ora ti elenco alcune frasi. Quale senti più vicina a quello che pensi? (Scegli una sola risposta)",
            options: [
                {text: "Limiterei le auto per migliorare la qualità della vita in città", value: "3_1"},
                {text: "Limiterei le auto SOLO se ci fossero buone alternative per muoversi", value: "3_2"},
                {text: "Trovo che le auto siano necessarie per la vita quotidiana", value: "3_3"},
                {text: "Non sento il bisogno di cambiare la situazione attuale", value: "3_4"},
                {text: "Non ho un’opinione precisa a riguardo", value: "3_5"}
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "recording",
            id: "o2",
            max_choices: 3,
            options_number: 7,
            text: [
                "Siamo all’ultima domanda e questa è una domanda aperta.",
                "Qui vorrei raccogliere le tue parole.",
                "[piccola pausa]",
                "Adesso prova a sognare, se vuoi puoi chiudere gli occhi.",
                "Fai un respiro profondo.",
                "Pensa a cosa ci siamo detti in questa conversazione, ma anche a quello che forse non è emerso, e immagina:",
                "Sei nella Milano dei tuoi desideri, proprio quella che vorresti.",
                "Cosa vedi? Cosa è cambiato?",
                "Inizia la tua descrizione con “Mi immagino di…”"
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description",
            text: ["Domande anagrafiche"]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "input",
            id: "eta",
            text: "Età",
            alt: "Preferisco non rispondere",
        },
        {
            type: "radio",
            id: "genere",
            text: "In quale genere ti riconosci?",
            options: [
                {text: "Femminile", value: "6_1"},
                {text: "Maschile", value: "6_2"},
                {text: "Non binario", value: "6_3"},
                {text: "Preferisco non rispondere", value: "6_4"},
            ]
        },
        {
            type: "radio",
            id: "lavoro",
            text: "Qual è la tua situazione lavorativa attuale?",
            options: [
                {text: "Studente", value: "7_1"},
                {text: "Lavoratore dipendente", value: "7_2"},
                {text: "Lavoratore autonomo / Libero Professionista", value: "7_3"},
                {text: "In cerca di occupazione", value: "7_4"},
                {text: "Pensionato", value: "7_5"},
                {text: "Altro", value: "7_6"},
                {text: "Preferisco non rispondere", value: "7_7"},
            ]
        },
        {
            type: "option",
            id: "o3",
            max_choices: 2,
            options_number: 8,
            text: "Quali mezzi di trasporto usi di più? (Max 2 scelte)",
            options: [
                {text: "Auto", value: "8_1"},
                {text: "Bici", value: "8_2"},
                {text: "Mezzi pubblici", value: "8_3"},
                {text: "A piedi", value: "8_4"},
                {text: "Moto / Scooter", value: "8_5"},
                {text: "Taxi", value: "8_6"},
                {text: "Monopattino", value: "8_7"},
                {text: "Altro", value: "8_8"},
            ]
        },
        {
            type: "input",
            id: "cap",
            text: "CAP di residenza",
            alt: "Preferisco non rispondere",
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description",
            text: "Ora vediamo i risultati!"
        }
    ],

    archetypes: [
          {
            "name_m": "L'ecociclista",
            "name_f": "L'ecociclista",
            "name_n": "L'ecociclista",
            "short_description_m": "Vivi la città in modo leggero: ogni pedalata è una scelta politica.",
            "short_description_f": "Vivi la città in modo leggero: ogni pedalata è una scelta politica.",
            "short_description_n": "Vivi la città in modo leggero: ogni pedalata è una scelta politica.",
            "description_m": "Vivi la città in modo leggero, in bici o a piedi, credendo che la libertà non stia nel possedere ma nel muoversi senza lasciare tracce. Per te, la città ideale è fatta di aria pulita, verde accessibile e percorsi sicuri per tutti. Come ecociclista, unisci la concretezza del gesto quotidiano con un forte senso etico: ogni pedalata è una scelta politica, ogni strada liberata dalle auto un piccolo atto di libertà collettiva.",
            "description_f": "Vivi la città in modo leggero, in bici o a piedi, credendo che la libertà non stia nel possedere ma nel muoversi senza lasciare tracce. Per te, la città ideale è fatta di aria pulita, verde accessibile e percorsi sicuri per tutti. Come ecociclista, unisci la concretezza del gesto quotidiano con un forte senso etico: ogni pedalata è una scelta politica, ogni strada liberata dalle auto un piccolo atto di libertà collettiva.",
            "description_n": "Vivi la città in modo leggero, in bici o a piedi, credendo che la libertà non stia nel possedere ma nel muoversi senza lasciare tracce. Per te, la città ideale è fatta di aria pulita, verde accessibile e percorsi sicuri per tutti. Come ecociclista, unisci la concretezza del gesto quotidiano con un forte senso etico: ogni pedalata è una scelta politica, ogni strada liberata dalle auto un piccolo atto di libertà collettiva.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "Il pedone socievole",
            "name_f": "La pedona socievole",
            "name_n": "Lə pedonə socievole",
            "short_description_m": "Difendi le panchine e gli spazi pubblici come luoghi di comunità.",
            "short_description_f": "Difendi le panchine e gli spazi pubblici come luoghi di comunità.",
            "short_description_n": "Difendi le panchine e gli spazi pubblici come luoghi di comunità.",
            "description_m": "Ami la vita di quartiere e camminare senza fretta. Per te la città è fatta di incontri, chiacchiere, bar all'angolo e bambini che giocano. Credi che la socialità spontanea sia la base di una città sana e felice. Sei il primo a difendere le panchine e gli spazi pubblici come luoghi di comunità.",
            "description_f": "Ami la vita di quartiere e camminare senza fretta. Per te la città è fatta di incontri, chiacchiere, bar all'angolo e bambini che giocano. Credi che la socialità spontanea sia la base di una città sana e felice. Sei la prima a difendere le panchine e gli spazi pubblici come luoghi di comunità.",
            "description_n": "Ami la vita di quartiere e camminare senza fretta. Per te la città è fatta di incontri, chiacchiere, bar all'angolo e bambini che giocano. Credi che la socialità spontanea sia la base di una città sana e felice. Sei lə primə a difendere le panchine e gli spazi pubblici come luoghi di comunità.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il visionario di quartiere",
            "name_f": "La visionaria di quartiere",
            "name_n": "Lə visionariə di quartiere",
            "short_description_m": "Sei pragmatico sognatore: ogni cambiamento inizia dal basso, un isolato alla volta.",
            "short_description_f": "Sei pragmatica sognatrice: ogni cambiamento inizia dal basso, un isolato alla volta.",
            "short_description_n": "Sei pragmaticə sognatorə: ogni cambiamento inizia dal basso, un isolato alla volta.",
            "description_m": "Immagini una Milano più bella, verde e umana. Hai idee, energia e il desiderio di condividere progetti concreti: orti, giardini diffusi, strade scolastiche, cortili aperti. Non sei attivista puro, ma pragmatico sognatore: sai che ogni cambiamento inizia dal basso e si costruisce insieme, un isolato alla volta.",
            "description_f": "Immagini una Milano più bella, verde e umana. Hai idee, energia e il desiderio di condividere progetti concreti: orti, giardini diffusi, strade scolastiche, cortili aperti. Non sei attivista pura, ma pragmatica sognatrice: sai che ogni cambiamento inizia dal basso e si costruisce insieme, un isolato alla volta.",
            "description_n": "Immagini una Milano più bella, verde e umana. Hai idee, energia e il desiderio di condividere progetti concreti: orti, giardini diffusi, strade scolastiche, cortili aperti. Non sei attivista purə, ma pragmaticə sognatorə: sai che ogni cambiamento inizia dal basso e si costruisce insieme, un isolato alla volta.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.VERDE"]
          },
          {
            "name_m": "L'automobilista illuminato",
            "name_f": "L'automobilista illuminata",
            "name_n": "L'automobilista illuminatə",
            "short_description_m": "Sei consapevole delle tue contraddizioni, impegnato a ridurle passo dopo passo.",
            "short_description_f": "Sei consapevole delle tue contraddizioni, impegnata a ridurle passo dopo passo.",
            "short_description_n": "Sei consapevole delle tue contraddizioni, impegnatə a ridurle passo dopo passo.",
            "description_m": "Usi l'auto ma riconosci che qualcosa deve cambiare. Partecipi a progetti di riduzione dell'impatto ambientale e sperimenti alternative come il car sharing o il telelavoro. Sei il ponte tra due mondi: consapevole delle proprie contraddizioni, ma sinceramente impegnato a ridurle passo dopo passo.",
            "description_f": "Usi l'auto ma riconosci che qualcosa deve cambiare. Partecipi a progetti di riduzione dell'impatto ambientale e sperimenti alternative come il car sharing o il telelavoro. Sei il ponte tra due mondi: consapevole delle proprie contraddizioni, ma sinceramente impegnata a ridurle passo dopo passo.",
            "description_n": "Usi l'auto ma riconosci che qualcosa deve cambiare. Partecipi a progetti di riduzione dell'impatto ambientale e sperimenti alternative come il car sharing o il telelavoro. Sei il ponte tra due mondi: consapevole delle proprie contraddizioni, ma sinceramente impegnatə a ridurle passo dopo passo.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "L'amante del verde quieto",
            "name_f": "L'amante del verde quieto",
            "name_n": "L'amante del verde quieto",
            "short_description_m": "Sogni una città più verde e meno rumorosa, con giardini silenziosi.",
            "short_description_f": "Sogni una città più verde e meno rumorosa, con giardini silenziosi.",
            "short_description_n": "Sogni una città più verde e meno rumorosa, con giardini silenziosi.",
            "description_m": "Sogni una città più verde e meno rumorosa. Ami il profumo degli alberi, i giardini silenziosi e gli spazi curati. Temi che la vivacità urbana diventi caos. Vuoi più natura, ordine, e rispetto dei ritmi lenti della vita di quartiere.",
            "description_f": "Sogni una città più verde e meno rumorosa. Ami il profumo degli alberi, i giardini silenziosi e gli spazi curati. Temi che la vivacità urbana diventi caos. Vuoi più natura, ordine, e rispetto dei ritmi lenti della vita di quartiere.",
            "description_n": "Sogni una città più verde e meno rumorosa. Ami il profumo degli alberi, i giardini silenziosi e gli spazi curati. Temi che la vivacità urbana diventi caos. Vuoi più natura, ordine, e rispetto dei ritmi lenti della vita di quartiere.",
            "base": ["ATTITUDES.VERDE", "ATTITUDES.FATEMI_DORMIRE"]
          },
          {
            "name_m": "L'estroverso zen",
            "name_f": "L'estroversa zen",
            "name_n": "L'estroversə zen",
            "short_description_m": "Desideri vicinanza, ma anche silenzio e armonia: un giardino condiviso.",
            "short_description_f": "Desideri vicinanza, ma anche silenzio e armonia: un giardino condiviso.",
            "short_description_n": "Desideri vicinanza, ma anche silenzio e armonia: un giardino condiviso.",
            "description_m": "Vivi la socialità come un gesto misurato. Desideri vicinanza, ma anche silenzio e armonia. La tua città ideale è un giardino condiviso dove si può stare insieme senza disturbarsi. Accetti i cambiamenti solo se portano equilibrio: credi nella bellezza delle piccole relazioni e delle cose fatte con cura.",
            "description_f": "Vivi la socialità come un gesto misurato. Desideri vicinanza, ma anche silenzio e armonia. La tua città ideale è un giardino condiviso dove si può stare insieme senza disturbarsi. Accetti i cambiamenti solo se portano equilibrio: credi nella bellezza delle piccole relazioni e delle cose fatte con cura.",
            "description_n": "Vivi la socialità come un gesto misurato. Desideri vicinanza, ma anche silenzio e armonia. La tua città ideale è un giardino condiviso dove si può stare insieme senza disturbarsi. Accetti i cambiamenti solo se portano equilibrio: credi nella bellezza delle piccole relazioni e delle cose fatte con cura.",
            "base": ["ATTITUDES.FATEMI_DORMIRE", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "L'ambientalista selettivo",
            "name_f": "L'ambientalista selettiva",
            "name_n": "L'ambientalista selettivə",
            "short_description_m": "Sei pragmatico: appoggi le cause ambientali ragionevoli, senza sacrificare la qualità della vita.",
            "short_description_f": "Sei pragmatica: appoggi le cause ambientali ragionevoli, senza sacrificare la qualità della vita.",
            "short_description_n": "Sei pragmaticə: appoggi le cause ambientali ragionevoli, senza sacrificare la qualità della vita.",
            "description_m": "Sei sensibile ai temi ambientali, ma dipende dai singoli casi. Appoggi le cause che ritieni ragionevoli e praticabili, evitando quelle che consideri infattibili. Sei un cittadino pragmatico: vuoi contribuire al cambiamento, ma con misura e senza sacrificare la qualità della vita quotidiana.",
            "description_f": "Sei sensibile ai temi ambientali, ma dipende dai singoli casi. Appoggi le cause che ritieni ragionevoli e praticabili, evitando quelle che consideri infattibili. Sei una cittadina pragmatica: vuoi contribuire al cambiamento, ma con misura e senza sacrificare la qualità della vita quotidiana.",
            "description_n": "Sei sensibile ai temi ambientali, ma dipende dai singoli casi. Appoggi le cause che ritieni ragionevoli e praticabili, evitando quelle che consideri infattibili. Sei unə cittadinə pragmaticə: vuoi contribuire al cambiamento, ma con misura e senza sacrificare la qualità della vita quotidiana.",
            "base": ["ATTITUDES.GRETA", "ATTITUDES.FATEMI_DORMIRE"]
          },
          {
            "name_m": "Il coltivatore della socialità",
            "name_f": "La coltivatrice della socialità",
            "name_n": "Lə coltivatorə della socialità",
            "short_description_m": "Coltivi insieme gli spazi pubblici e le relazioni, catalizzatore di cittadinanza attiva.",
            "short_description_f": "Coltivi insieme gli spazi pubblici e le relazioni, catalizzatrice di cittadinanza attiva.",
            "short_description_n": "Coltivi insieme gli spazi pubblici e le relazioni, catalizzatorə di cittadinanza attiva.",
            "description_m": "Credi che la città fiorisca solo se la si coltiva insieme. Ami prenderti cura degli spazi pubblici, organizzare feste di quartiere, piantare alberi e ortaggi condivisi. Sei il cuore della cittadinanza attiva: pratichi la sostenibilità non solo come principio, ma anche come catalizzatore di relazioni positive.",
            "description_f": "Credi che la città fiorisca solo se la si coltiva insieme. Ami prenderti cura degli spazi pubblici, organizzare feste di quartiere, piantare alberi e ortaggi condivisi. Sei il cuore della cittadinanza attiva: pratichi la sostenibilità non solo come principio, ma anche come catalizzatrice di relazioni positive.",
            "description_n": "Credi che la città fiorisca solo se la si coltiva insieme. Ami prenderti cura degli spazi pubblici, organizzare feste di quartiere, piantare alberi e ortaggi condivisi. Sei il cuore della cittadinanza attiva: pratichi la sostenibilità non solo come principio, ma anche come catalizzatorə di relazioni positive.",
            "base": ["ATTITUDES.VERDE", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "L'automobilista combattuto",
            "name_f": "L'automobilista combattuta",
            "name_n": "L'automobilista combattutə",
            "short_description_m": "Sei in equilibrio tra desiderio di comfort e consapevolezza ambientale.",
            "short_description_f": "Sei in equilibrio tra desiderio di comfort e consapevolezza ambientale.",
            "short_description_n": "Sei in equilibrio tra desiderio di comfort e consapevolezza ambientale.",
            "description_m": "Usi quotidianamente l'auto e vorresti conservare i parcheggi esistenti, ma desideri anche una città più verde e curata. Sei consapevole dell'impatto ambientale ma fai fatica a cambiare abitudini. Ti muovi in equilibrio tra il desiderio di comfort personale e la consapevolezza di dover fare la tua parte. Potresti diventare un alleato del cambiamento se coinvolto con empatia e soluzioni concrete.",
            "description_f": "Usi quotidianamente l'auto e vorresti conservare i parcheggi esistenti, ma desideri anche una città più verde e curata. Sei consapevole dell'impatto ambientale ma fai fatica a cambiare abitudini. Ti muovi in equilibrio tra il desiderio di comfort personale e la consapevolezza di dover fare la tua parte. Potresti diventare un'alleata del cambiamento se coinvolta con empatia e soluzioni concrete.",
            "description_n": "Usi quotidianamente l'auto e vorresti conservare i parcheggi esistenti, ma desideri anche una città più verde e curata. Sei consapevole dell'impatto ambientale ma fai fatica a cambiare abitudini. Ti muovi in equilibrio tra il desiderio di comfort personale e la consapevolezza di dover fare la tua parte. Potresti diventare unə alleatə del cambiamento se coinvoltə con empatia e soluzioni concrete.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.VERDE"]
          },
          {
            "name_m": "L'estroverso combattuto",
            "name_f": "L'estroversa combattuta",
            "name_n": "L'estroversə combattutə",
            "short_description_m": "Vuoi luoghi di socialità, ma non sotto casa: ami la vita di quartiere, temi il rumore.",
            "short_description_f": "Vuoi luoghi di socialità, ma non sotto casa: ami la vita di quartiere, temi il rumore.",
            "short_description_n": "Vuoi luoghi di socialità, ma non sotto casa: ami la vita di quartiere, temi il rumore.",
            "description_m": "Vuoi luoghi di socialità, ma non sotto casa tua. Ami la vita di quartiere ma temi il rumore e il disordine. Rappresenti bene le tensioni urbane: desiderio di relazione e paura del disturbo. Perciò, hai bisogno di spazi differenziati, per momenti vivi e momenti quieti.",
            "description_f": "Vuoi luoghi di socialità, ma non sotto casa tua. Ami la vita di quartiere ma temi il rumore e il disordine. Rappresenti bene le tensioni urbane: desiderio di relazione e paura del disturbo. Perciò, hai bisogno di spazi differenziati, per momenti vivi e momenti quieti.",
            "description_n": "Vuoi luoghi di socialità, ma non sotto casa tua. Ami la vita di quartiere ma temi il rumore e il disordine. Rappresenti bene le tensioni urbane: desiderio di relazione e paura del disturbo. Perciò, hai bisogno di spazi differenziati, per momenti vivi e momenti quieti.",
            "base": ["ATTITUDES.FATEMI_DORMIRE", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il tradizionalista silenzioso",
            "name_f": "La tradizionalista silenziosa",
            "name_n": "Lə tradizionalista silenziosə",
            "short_description_m": "La quiete è la tua priorità; temi l'imprevisto e la perdita di controllo.",
            "short_description_f": "La quiete è la tua priorità; temi l'imprevisto e la perdita di controllo.",
            "short_description_n": "La quiete è la tua priorità; temi l'imprevisto e la perdita di controllo.",
            "description_m": "La quiete è la tua priorità. Per te la città è casa solo se è tranquilla e familiare. Hai paura che il cambiamento possa compromettere l'equilibrio raggiunto. Non sei necessariamente contrario a tutto, ma temi l'imprevisto e la perdita di controllo. Convincerti richiede fiducia e risultati concreti.",
            "description_f": "La quiete è la tua priorità. Per te la città è casa solo se è tranquilla e familiare. Hai paura che il cambiamento possa compromettere l'equilibrio raggiunto. Non sei necessariamente contraria a tutto, ma temi l'imprevisto e la perdita di controllo. Convincerti richiede fiducia e risultati concreti.",
            "description_n": "La quiete è la tua priorità. Per te la città è casa solo se è tranquilla e familiare. Hai paura che il cambiamento possa compromettere l'equilibrio raggiunto. Non sei necessariamente contrariə a tutto, ma temi l'imprevisto e la perdita di controllo. Convincerti richiede fiducia e risultati concreti.",
            "base": ["ATTITUDES.FATEMI_DORMIRE", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "L'ecologista prudente",
            "name_f": "L'ecologista prudente",
            "name_n": "L'ecologista prudente",
            "short_description_m": "Apprezzi il verde senza rivoluzioni, preferisci piccoli miglioramenti graduali.",
            "short_description_f": "Apprezzi il verde senza rivoluzioni, preferisci piccoli miglioramenti graduali.",
            "short_description_n": "Apprezzi il verde senza rivoluzioni, preferisci piccoli miglioramenti graduali.",
            "description_m": "Apprezzi il verde, ma vuoi ottenerlo senza rivoluzioni. Preferisci piccoli miglioramenti graduali alle trasformazioni radicali. Hai bisogno di tempo per valutare eventuali cambiamenti, ma li sostieni con fermezza se vedi che funzionano e non alterano il tuo comfort.",
            "description_f": "Apprezzi il verde, ma vuoi ottenerlo senza rivoluzioni. Preferisci piccoli miglioramenti graduali alle trasformazioni radicali. Hai bisogno di tempo per valutare eventuali cambiamenti, ma li sostieni con fermezza se vedi che funzionano e non alterano il tuo comfort.",
            "description_n": "Apprezzi il verde, ma vuoi ottenerlo senza rivoluzioni. Preferisci piccoli miglioramenti graduali alle trasformazioni radicali. Hai bisogno di tempo per valutare eventuali cambiamenti, ma li sostieni con fermezza se vedi che funzionano e non alterano il tuo comfort.",
            "base": ["ATTITUDES.VERDE", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "L'automobilista di sobborgo",
            "name_f": "L'automobilista di sobborgo",
            "name_n": "L'automobilista di sobborgo",
            "short_description_m": "Guidi per necessità, non per orgoglio; non sopporti il disordine.",
            "short_description_f": "Guidi per necessità, non per orgoglio; non sopporti il disordine.",
            "short_description_n": "Guidi per necessità, non per orgoglio; non sopporti il disordine.",
            "description_m": "Guidi per necessità, non per orgoglio. Non sopporti gli schiamazzi e il disordine, ma il rumore del traffico non ti disturba. Il tuo attaccamento all'auto è soprattutto pratico: se trovassi alternative fattibili, potresti cambiare abitudini.",
            "description_f": "Guidi per necessità, non per orgoglio. Non sopporti gli schiamazzi e il disordine, ma il rumore del traffico non ti disturba. Il tuo attaccamento all'auto è soprattutto pratico: se trovassi alternative fattibili, potresti cambiare abitudini.",
            "description_n": "Guidi per necessità, non per orgoglio. Non sopporti gli schiamazzi e il disordine, ma il rumore del traffico non ti disturba. Il tuo attaccamento all'auto è soprattutto pratico: se trovassi alternative fattibili, potresti cambiare abitudini.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.FATEMI_DORMIRE"]
          },
          {
            "name_m": "Il tradizionalista a quattro ruote",
            "name_f": "La tradizionalista a quattro ruote",
            "name_n": "Lə tradizionalista a quattro ruote",
            "short_description_m": "L'auto è parte della tua identità; vedi ogni riduzione di sosta come perdita di libertà.",
            "short_description_f": "L'auto è parte della tua identità; vedi ogni riduzione di sosta come perdita di libertà.",
            "short_description_n": "L'auto è parte della tua identità; vedi ogni riduzione di sosta come perdita di libertà.",
            "description_m": "L'auto è parte della tua identità. La città deve adattarsi alle esigenze di chi guida, non il contrario. Vedi ogni riduzione di sosta o corsia come una perdita di libertà. Provi nostalgia per la città del passato, in cui le auto potevano andare e parcheggiare ovunque.",
            "description_f": "L'auto è parte della tua identità. La città deve adattarsi alle esigenze di chi guida, non il contrario. Vedi ogni riduzione di sosta o corsia come una perdita di libertà. Provi nostalgia per la città del passato, in cui le auto potevano andare e parcheggiare ovunque.",
            "description_n": "L'auto è parte della tua identità. La città deve adattarsi alle esigenze di chi guida, non il contrario. Vedi ogni riduzione di sosta o corsia come una perdita di libertà. Provi nostalgia per la città del passato, in cui le auto potevano andare e parcheggiare ovunque.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "L'automobilista da bar",
            "name_f": "L'automobilista da bar",
            "name_n": "L'automobilista da bar",
            "short_description_m": "Sei conviviale e pragmatico: la macchina è estensione dello spazio sociale.",
            "short_description_f": "Sei conviviale e pragmatica: la macchina è estensione dello spazio sociale.",
            "short_description_n": "Sei conviviale e pragmaticə: la macchina è estensione dello spazio sociale.",
            "description_m": "Conviviale, ironico, pragmatico. Ami il bar, l'auto, la chiacchiera. La macchina è per te un'estensione dello spazio sociale. Non sei contro l'ambientalismo, ma difendi la libertà di ognunə di vivere la città a modo proprio. Potresti cambiare mezzo solo se ti permettesse di andare al bar comodamente.",
            "description_f": "Conviviale, ironica, pragmatica. Ami il bar, l'auto, la chiacchiera. La macchina è per te un'estensione dello spazio sociale. Non sei contro l'ambientalismo, ma difendi la libertà di ognunə di vivere la città a modo proprio. Potresti cambiare mezzo solo se ti permettesse di andare al bar comodamente.",
            "description_n": "Conviviale, ironicə, pragmaticə. Ami il bar, l'auto, la chiacchiera. La macchina è per te un'estensione dello spazio sociale. Non sei contro l'ambientalismo, ma difendi la libertà di ognunə di vivere la città a modo proprio. Potresti cambiare mezzo solo se ti permettesse di andare al bar comodamente.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il socievole \"zero sbatti\"",
            "name_f": "La socievole \"zero sbatti\"",
            "name_n": "Lə socievole \"zero sbatti\"",
            "short_description_m": "Ami la compagnia, ma non la fatica di costruire: maggioranza silenziosa.",
            "short_description_f": "Ami la compagnia, ma non la fatica di costruire: maggioranza silenziosa.",
            "short_description_n": "Ami la compagnia, ma non la fatica di costruire: maggioranza silenziosa.",
            "description_m": "Partecipi agli eventi solo se invitato. Ami la compagnia, ma non la fatica di costruire qualcosa di nuovo. Rappresenti la maggioranza silenziosa: osservi, commenti, ma non ami esporti. Partecipi solo se ti senti coinvolto emotivamente dalla causa.",
            "description_f": "Partecipi agli eventi solo se invitata. Ami la compagnia, ma non la fatica di costruire qualcosa di nuovo. Rappresenti la maggioranza silenziosa: osservi, commenti, ma non ami esporti. Partecipi solo se ti senti coinvolta emotivamente dalla causa.",
            "description_n": "Partecipi agli eventi solo se invitatə. Ami la compagnia, ma non la fatica di costruire qualcosa di nuovo. Rappresenti la maggioranza silenziosa: osservi, commenti, ma non ami esporti. Partecipi solo se ti senti coinvoltə emotivamente dalla causa.",
            "base": ["ATTITUDES.STATUS_QUO", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il riformista cauto",
            "name_f": "La riformista cauta",
            "name_n": "Lə riformista cautə",
            "short_description_m": "Credi nel cambiamento ma chiedi competenza e gradualità.",
            "short_description_f": "Credi nel cambiamento ma chiedi competenza e gradualità.",
            "short_description_n": "Credi nel cambiamento ma chiedi competenza e gradualità.",
            "description_m": "Credi che il cambiamento sia giusto, ma diffidi delle soluzioni semplicistiche. Chiedi competenza e gradualità. Sei un interlocutore prezioso: se conquistato, diventi sostenitore solido e costruttivamente critico dei progetti urbani.",
            "description_f": "Credi che il cambiamento sia giusto, ma diffidi delle soluzioni semplicistiche. Chiedi competenza e gradualità. Sei un'interlocutrice preziosa: se conquistata, diventi sostenitrice solida e costruttivamente critica dei progetti urbani.",
            "description_n": "Credi che il cambiamento sia giusto, ma diffidi delle soluzioni semplicistiche. Chiedi competenza e gradualità. Sei un'interlocutorə preziosə: se conquistatə, diventi sostenitorə solidə e costruttivamente criticə dei progetti urbani.",
            "base": ["ATTITUDES.STATUS_QUO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "L'automobilista sincero",
            "name_f": "L'automobilista sincera",
            "name_n": "L'automobilista sincerə",
            "short_description_m": "Sostieni la sostenibilità ma non rinunci al volante: contraddizione inevitabile.",
            "short_description_f": "Sostieni la sostenibilità ma non rinunci al volante: contraddizione inevitabile.",
            "short_description_n": "Sostieni la sostenibilità ma non rinunci al volante: contraddizione inevitabile.",
            "description_m": "Sostieni il concetto di sostenibilità, ma non sei pronto a rinunciare al volante. A volte ti senti in colpa, ma credi anche che questa contraddizione sia inevitabile. Valuti le alternative, ma solo se le reputi credibili e se non ti fanno sentire di aver perso qualcosa.",
            "description_f": "Sostieni il concetto di sostenibilità, ma non sei pronta a rinunciare al volante. A volte ti senti in colpa, ma credi anche che questa contraddizione sia inevitabile. Valuti le alternative, ma solo se le reputi credibili e se non ti fanno sentire di aver perso qualcosa.",
            "description_n": "Sostieni il concetto di sostenibilità, ma non sei prontə a rinunciare al volante. A volte ti senti in colpa, ma credi anche che questa contraddizione sia inevitabile. Valuti le alternative, ma solo se le reputi credibili e se non ti fanno sentire di aver perso qualcosa.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "L'ecologista inaspettato",
            "name_f": "L'ecologista inaspettata",
            "name_n": "L'ecologista inaspettatə",
            "short_description_m": "Ti muovi in modo sostenibile per abitudine, non per principio.",
            "short_description_f": "Ti muovi in modo sostenibile per abitudine, non per principio.",
            "short_description_n": "Ti muovi in modo sostenibile per abitudine, non per principio.",
            "description_m": "Non usi l'auto, ma non ami quando i politici parlano di ecologia. Ti muovi in modo sostenibile per abitudine o convenienza, non per una questione di principio. Anche se non ti definisci un ecologista, fai bene alla città con le tue scelte.",
            "description_f": "Non usi l'auto, ma non ami quando i politici parlano di ecologia. Ti muovi in modo sostenibile per abitudine o convenienza, non per una questione di principio. Anche se non ti definisci un'ecologista, fai bene alla città con le tue scelte.",
            "description_n": "Non usi l'auto, ma non ami quando i politici parlano di ecologia. Ti muovi in modo sostenibile per abitudine o convenienza, non per una questione di principio. Anche se non ti definisci un'ecologista, fai bene alla città con le tue scelte.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "Il minimalista urbano",
            "name_f": "La minimalista urbana",
            "name_n": "Lə minimalistə urbanə",
            "short_description_m": "Senza auto ma senza caos: la tua città ideale è sostenibile e silenziosa.",
            "short_description_f": "Senza auto ma senza caos: la tua città ideale è sostenibile e silenziosa.",
            "short_description_n": "Senza auto ma senza caos: la tua città ideale è sostenibile e silenziosa.",
            "description_m": "Vivi la città in silenzio e senza auto: non ti mancano i motori, ma non cerchi nemmeno la piazza animata. Il tuo ideale è la strada percorribile a piedi, ordinata e tranquilla, dove la sostenibilità non significa festeggiare ma respirare. Non sei contro il cambiamento, ma vuoi che avvenga senza stravolgere la quiete del quartiere. Il verde ti piace, purché sia silenzioso.",
            "description_f": "Vivi la città in silenzio e senza auto: non ti mancano i motori, ma non cerchi nemmeno la piazza animata. Il tuo ideale è la strada percorribile a piedi, ordinata e tranquilla, dove la sostenibilità non significa festeggiare ma respirare. Non sei contro il cambiamento, ma vuoi che avvenga senza stravolgere la quiete del quartiere. Il verde ti piace, purché sia silenzioso.",
            "description_n": "Vivi la città in silenzio e senza auto: non ti mancano i motori, ma non cerchi nemmeno la piazza animata. Il tuo ideale è la strada percorribile a piedi, ordinata e tranquilla, dove la sostenibilità non significa festeggiare ma respirare. Non sei contro il cambiamento, ma vuoi che avvenga senza stravolgere la quiete del quartiere. Il verde ti piace, purché sia silenzioso.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.FATEMI_DORMIRE"]
          },
          {
            "name_m": "L’automobilista riflessivo",
            "name_f": "L’automobilista riflessiva",
            "name_n": "L’automobilista riflessivə",
            "short_description_m": "A volte l'auto ti sembra inutile, altre irrinunciabile: sei nel mezzo, e forse è la posizione più onesta.",
            "short_description_f": "A volte l'auto ti sembra inutile, altre irrinunciabile: sei nel mezzo, e forse è la posizione più onesta.",
            "short_description_n": "A volte l'auto ti sembra inutile, altre irrinunciabile: sei nel mezzo, e forse è la posizione più onesta.",
            "description_m": "Non sai bene da che parte stare, e forse è la posizione più onesta di tutte. A volte l'auto ti sembra inutile, altre volte irrinunciabile. Conosci i problemi che crea in città, ma non riesci del tutto a immaginarne l'assenza. Sei nel mezzo di una transizione che non hai ancora completato: né automobilista convinto né paladino della mobilità sostenibile. Il cambiamento potrebbe partire da te, se qualcosa ti desse la spinta giusta.",
            "description_f": "Non sai bene da che parte stare, e forse è la posizione più onesta di tutte. A volte l'auto ti sembra inutile, altre volte irrinunciabile. Conosci i problemi che crea in città, ma non riesci del tutto a immaginarne l'assenza. Sei nel mezzo di una transizione che non hai ancora completato: né automobilista convinta né paladina della mobilità sostenibile. Il cambiamento potrebbe partire da te, se qualcosa ti desse la spinta giusta.",
            "description_n": "Non sai bene da che parte stare, e forse è la posizione più onesta di tutte. A volte l'auto ti sembra inutile, altre volte irrinunciabile. Conosci i problemi che crea in città, ma non riesci del tutto a immaginarne l'assenza. Sei nel mezzo di una transizione che non hai ancora completato: né automobilistə convintə né paladinə della mobilità sostenibile. Il cambiamento potrebbe partire da te, se qualcosa ti desse la spinta giusta.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.NON_VIVO_SENZA_AUTO"]
          },
          {
            "name_m": "L'ecopioniere",
            "name_f": "L'ecopioniera",
            "name_n": "L'ecopionierə",
            "short_description_m": "Verde e clima per te sono la stessa urgenza: più alberi, meno auto, zero compromessi.",
            "short_description_f": "Verde e clima per te sono la stessa urgenza: più alberi, meno auto, zero compromessi.",
            "short_description_n": "Verde e clima per te sono la stessa urgenza: più alberi, meno auto, zero compromessi.",
            "description_m": "Per te verde e clima sono due facce della stessa medaglia. Vuoi più alberi, più parchi, meno CO₂ e meno auto: non è solo estetica, è urgenza. Ogni aiuola conquistata allo spazio stradale è un piccolo atto politico, ogni zona pedonalizzata un passo verso la città che immagini. Sei tra i profili più coerenti: ciò che pensi corrisponde a ciò che chiedi, e lo fai con convinzione e senso di responsabilità collettiva.",
            "description_f": "Per te verde e clima sono due facce della stessa medaglia. Vuoi più alberi, più parchi, meno CO₂ e meno auto: non è solo estetica, è urgenza. Ogni aiuola conquistata allo spazio stradale è un piccolo atto politico, ogni zona pedonalizzata un passo verso la città che immagini. Sei tra i profili più coerenti: ciò che pensi corrisponde a ciò che chiedi, e lo fai con convinzione e senso di responsabilità collettiva.",
            "description_n": "Per te verde e clima sono due facce della stessa medaglia. Vuoi più alberi, più parchi, meno CO₂ e meno auto: non è solo estetica, è urgenza. Ogni aiuola conquistata allo spazio stradale è un piccolo atto politico, ogni zona pedonalizzata un passo verso la città che immagini. Sei tra i profili più coerenti: ciò che pensi corrisponde a ciò che chiedi, e lo fai con convinzione e senso di responsabilità collettiva.",
            "base": ["ATTITUDES.VERDE", "ATTITUDES.GRETA"]
          }
        ]
};
