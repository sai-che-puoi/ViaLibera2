import {googleSheetScriptUrl} from "./script_key.js";

export const CONFIG = {
    // API Configuration
    googleScriptUrl: googleSheetScriptUrl,
    enableDataCollection: true,
};

// Define attitudes based on the questions  
const ATTITUDES = {
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
                "\"Ora ti farò alcune domande. Le risposte restano anonime: non raccogliamo nomi o dati personali. Useremo tutte le risposte insieme per capire cosa le persone desiderano per gli spazi pubblici della città. Ok?\""
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description_light",
            text: [
                "\"Ora ti dirò alcune frasi.",
                "Per ognuna dimmi quanto sei d’accordo, dando un numero da 1 a 10. 1 vuol dire per niente d’accordo. 10 vuol dire completamente d’accordo..\""
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
            type: "description",
            text: ["Domande Immaginative"]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description_light",
            text: [
                "\"Immagina di essere il sindaco di Milano. Ora ti leggo alcune cose che si potrebbero fare in città. Scegli le 3 più importanti per te, dalla più importante alle altre.\"",
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
            type: "recording",
            id: "o2",
            max_choices: 3,
            options_number: 7,
            text: [
                "Ok adesso prova a sognare, se vuoi puoi chiudere gli occhi.",
                "Fai un respiro profondo.",
                "Pensa a cosa ci siamo detti in questa conversazione, ma anche a quello che forse non è emerso, e immagina:",
                "Sei nella Milano dei tuoi desideri, proprio quella che vorresti.",
                "Cosa vedi?  Cosa è cambiato?",
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
            type: "description",
            text: ["Grazie per il tempo che ci hai dedicato!",
                "Intanto se vuoi puoi usare questo QR code per andare a leggere di più sul progetto e sul tuo profilo di sognatore/trice e su tutti gli altri che stiamo mappando.",
                "Fra qualche settimana qui troverai anche il risultato di tutta la nostra ricerca.",
                "Grazie per la disponibilità e buona giornata!"
           ]
        }
    ],

    archetypes: [
        {
            name: "Gli Ecociclisti",
            description: "Vivono bene senza auto, amano il verde e respirare meglio.",
            base: [ATTITUDES.VIVO_SENZA_AUTO, ATTITUDES.VERDE]
        },
        {
            name: "I Socialpedoni",
            description: "Amano muoversi a piedi o in bici e incontrare gente sotto casa.",
            base: [ATTITUDES.VIVO_SENZA_AUTO, ATTITUDES.PIAZZA]
        },
        {
            name: "Gli Zen del cortile",
            description: "Camminano o pedalano ma vogliono silenzio e calma nel quartiere.",
            base: [ATTITUDES.VIVO_SENZA_AUTO, ATTITUDES.FATEMI_DORMIRE]
        },
        {
            name: "I Rivoluzionari gentili",
            description: "Ambientalisti convinti, sostengono la trasformazione urbana.",
            base: [ATTITUDES.VIVO_SENZA_AUTO, ATTITUDES.GRETA]
        },
        {
            name: "Gli Indifferenti mobili",
            description: "Non usano l'auto ma non vedono motivo per cambiare altro.",
            base: [ATTITUDES.VIVO_SENZA_AUTO, ATTITUDES.STATUS_QUO]
        },
        {
            name: "Gli Autoverdi",
            description: "Amano alberi e ombra, ma non rinunciano al parcheggio sotto casa.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.VERDE]
        },
        {
            name: "I Baristi del cofano",
            description: "Vogliono chiacchierare in piazza ma con la macchina lì vicino.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.PIAZZA]
        },
        {
            name: "Gli Automiti",
            description: "Dipendono dall'auto ma odiano il casino sotto casa.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.FATEMI_DORMIRE]
        },
        {
            name: "I Contraddittori verdi",
            description: "Parlano di sostenibilità ma non sanno vivere senza auto.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.GRETA]
        },
        {
            name: "I Tradizionalisti a quattro ruote",
            description: "Vogliono che tutto resti com'è, soprattutto i parcheggi.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.STATUS_QUO]
        },
        {
            name: "I Giardinieri sociali",
            description: "Verde e convivialità: l'ideale è chiacchierare all'ombra di un albero.",
            base: [ATTITUDES.VERDE, ATTITUDES.PIAZZA]
        },
        {
            name: "Gli Amanti del verde quieto",
            description: "Vogliono piante e natura, ma non rumore e movida.",
            base: [ATTITUDES.VERDE, ATTITUDES.FATEMI_DORMIRE]
        },
        {
            name: "Gli Ecopionieri",
            description: "Credono nel verde come leva per il cambiamento climatico.",
            base: [ATTITUDES.VERDE, ATTITUDES.GRETA]
        },
        {
            name: "I Verdi prudenti",
            description: "Vogliono più alberi ma non rivoluzioni urbanistiche.",
            base: [ATTITUDES.VERDE, ATTITUDES.STATUS_QUO]
        },
        {
            name: "I Contraddittori da cortile",
            description: "Amano la vita di quartiere, ma solo se non fa rumore.",
            base: [ATTITUDES.PIAZZA, ATTITUDES.FATEMI_DORMIRE]
        },
        {
            name: "I Visionari di quartiere",
            description: "Sognano città vivibili, piazze piene e auto lontane.",
            base: [ATTITUDES.PIAZZA, ATTITUDES.GRETA]
        },
        {
            name: "Gli Apatici socievoli",
            description: "Vorrebbero spazi vivi ma senza cambiare troppe abitudini.",
            base: [ATTITUDES.PIAZZA, ATTITUDES.STATUS_QUO]
        },
        {
            name: "Gli Ambientalisti selettivi",
            description: "A favore del verde e del clima, ma non del rumore dei bambini.",
            base: [ATTITUDES.FATEMI_DORMIRE, ATTITUDES.GRETA]
        },
        {
            name: "I Conservatori del silenzio",
            description: "Vogliono pace, parcheggio e nessuna novità.",
            base: [ATTITUDES.FATEMI_DORMIRE, ATTITUDES.STATUS_QUO]
        },
        {
            name: "Gli Scettici riformisti",
            description: "A parole progressisti, ma di fatto temono i cambiamenti.",
            base: [ATTITUDES.GRETA, ATTITUDES.STATUS_QUO]
        },
        {
            name: "I Paradossali del volante",
            description: "Dicono di non usare l'auto, ma non riescono a farne a meno.",
            base: [ATTITUDES.VIVO_SENZA_AUTO, ATTITUDES.NON_VIVO_SENZA_AUTO]
        }
    ],
     archetypes_new: [
          {
            "name_m": "L'ecociclista",
            "name_f": "L'ecociclista",
            "name_n": "L'ecociclista",
            "description_m": "Vivi la città in modo leggero, in bici o a piedi, credendo che la libertà non stia nel possedere ma nel muoversi senza lasciare tracce. Per te, la città ideale è fatta di aria pulita, verde accessibile e percorsi sicuri per tutti. Come ecociclista, unisci la concretezza del gesto quotidiano con un forte senso etico: ogni pedalata è una scelta politica, ogni strada liberata dalle auto un piccolo atto di libertà collettiva.",
            "description_f": "Vivi la città in modo leggero, in bici o a piedi, credendo che la libertà non stia nel possedere ma nel muoversi senza lasciare tracce. Per te, la città ideale è fatta di aria pulita, verde accessibile e percorsi sicuri per tutti. Come ecociclista, unisci la concretezza del gesto quotidiano con un forte senso etico: ogni pedalata è una scelta politica, ogni strada liberata dalle auto un piccolo atto di libertà collettiva.",
            "description_n": "Vivi la città in modo leggero, in bici o a piedi, credendo che la libertà non stia nel possedere ma nel muoversi senza lasciare tracce. Per te, la città ideale è fatta di aria pulita, verde accessibile e percorsi sicuri per tutti. Come ecociclista, unisci la concretezza del gesto quotidiano con un forte senso etico: ogni pedalata è una scelta politica, ogni strada liberata dalle auto un piccolo atto di libertà collettiva.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "Il pedone socievole",
            "name_f": "La pedona socievole",
            "name_n": "Lə pedonə socievole",
            "description_m": "Ami la vita di quartiere e camminare senza fretta. Per te la città è fatta di incontri, chiacchiere, bar all'angolo e bambini che giocano. Credi che la socialità spontanea sia la base di una città sana e felice. Sei il primo a difendere le panchine e gli spazi pubblici come luoghi di comunità.",
            "description_f": "Ami la vita di quartiere e camminare senza fretta. Per te la città è fatta di incontri, chiacchiere, bar all'angolo e bambini che giocano. Credi che la socialità spontanea sia la base di una città sana e felice. Sei la prima a difendere le panchine e gli spazi pubblici come luoghi di comunità.",
            "description_n": "Ami la vita di quartiere e camminare senza fretta. Per te la città è fatta di incontri, chiacchiere, bar all'angolo e bambini che giocano. Credi che la socialità spontanea sia la base di una città sana e felice. Sei lə primə a difendere le panchine e gli spazi pubblici come luoghi di comunità.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il rivoluzionario gentile",
            "name_f": "La rivoluzionaria gentile",
            "name_n": "Lə rivoluzionariə gentile",
            "description_m": "Idealista ma empatico, vuoi cambiare la città senza creare muri tra chi è pronto e chi no. Credi che la trasformazione ecologica sia possibile convincendo tuttə. Sei un cittadino attivo che partecipa a iniziative di quartiere e progetti ambientali, senza perdere il sorriso e la capacità di dialogare anche con chi la pensa diversamente.",
            "description_f": "Idealista ma empatica, vuoi cambiare la città senza creare muri tra chi è pronto e chi no. Credi che la trasformazione ecologica sia possibile convincendo tuttə. Sei una cittadina attiva che partecipa a iniziative di quartiere e progetti ambientali, senza perdere il sorriso e la capacità di dialogare anche con chi la pensa diversamente.",
            "description_n": "Idealista ma empaticə, vuoi cambiare la città senza creare muri tra chi è pronto e chi no. Credi che la trasformazione ecologica sia possibile convincendo tuttə. Sei unə cittadinə attivə che partecipa a iniziative di quartiere e progetti ambientali, senza perdere il sorriso e la capacità di dialogare anche con chi la pensa diversamente.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "Il visionario di quartiere",
            "name_f": "La visionaria di quartiere",
            "name_n": "Lə visionariə di quartiere",
            "description_m": "Immagini una Milano più bella, verde e umana. Hai idee, energia e il desiderio di condividere progetti concreti: orti, giardini diffusi, strade scolastiche, cortili aperti. Non sei attivista puro, ma pragmatico sognatore: sai che ogni cambiamento inizia dal basso e si costruisce insieme, un isolato alla volta.",
            "description_f": "Immagini una Milano più bella, verde e umana. Hai idee, energia e il desiderio di condividere progetti concreti: orti, giardini diffusi, strade scolastiche, cortili aperti. Non sei attivista pura, ma pragmatica sognatrice: sai che ogni cambiamento inizia dal basso e si costruisce insieme, un isolato alla volta.",
            "description_n": "Immagini una Milano più bella, verde e umana. Hai idee, energia e il desiderio di condividere progetti concreti: orti, giardini diffusi, strade scolastiche, cortili aperti. Non sei attivista purə, ma pragmaticə sognatorə: sai che ogni cambiamento inizia dal basso e si costruisce insieme, un isolato alla volta.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.VERDE"]
          },
          {
            "name_m": "L'automobilista illuminato",
            "name_f": "L'automobilista illuminata",
            "name_n": "L'automobilista illuminatə",
            "description_m": "Usi l'auto ma riconosci che qualcosa deve cambiare. Partecipi a progetti di riduzione dell'impatto ambientale e sperimenti alternative come il car sharing o il telelavoro. Sei il ponte tra due mondi: consapevole delle proprie contraddizioni, ma sinceramente impegnato a ridurle passo dopo passo.",
            "description_f": "Usi l'auto ma riconosci che qualcosa deve cambiare. Partecipi a progetti di riduzione dell'impatto ambientale e sperimenti alternative come il car sharing o il telelavoro. Sei il ponte tra due mondi: consapevole delle proprie contraddizioni, ma sinceramente impegnata a ridurle passo dopo passo.",
            "description_n": "Usi l'auto ma riconosci che qualcosa deve cambiare. Partecipi a progetti di riduzione dell'impatto ambientale e sperimenti alternative come il car sharing o il telelavoro. Sei il ponte tra due mondi: consapevole delle proprie contraddizioni, ma sinceramente impegnatə a ridurle passo dopo passo.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "L'amante del verde quieto",
            "name_f": "L'amante del verde quieto",
            "name_n": "L'amante del verde quieto",
            "description_m": "Sogni una città più verde e meno rumorosa. Ami il profumo degli alberi, i giardini silenziosi e gli spazi curati. Temi che la vivacità urbana diventi caos. Vuoi più natura, ordine, e rispetto dei ritmi lenti della vita di quartiere.",
            "description_f": "Sogni una città più verde e meno rumorosa. Ami il profumo degli alberi, i giardini silenziosi e gli spazi curati. Temi che la vivacità urbana diventi caos. Vuoi più natura, ordine, e rispetto dei ritmi lenti della vita di quartiere.",
            "description_n": "Sogni una città più verde e meno rumorosa. Ami il profumo degli alberi, i giardini silenziosi e gli spazi curati. Temi che la vivacità urbana diventi caos. Vuoi più natura, ordine, e rispetto dei ritmi lenti della vita di quartiere.",
            "base": ["ATTITUDES.VERDE", "ATTITUDES.FATEMI_DORMIRE"]
          },
          {
            "name_m": "L'estroverso zen",
            "name_f": "L'estroversa zen",
            "name_n": "L'estroversə zen",
            "description_m": "Vivi la socialità come un gesto misurato. Desideri vicinanza, ma anche silenzio e armonia. La tua città ideale è un giardino condiviso dove si può stare insieme senza disturbarsi. Accetti i cambiamenti solo se portano equilibrio: credi nella bellezza delle piccole relazioni e delle cose fatte con cura.",
            "description_f": "Vivi la socialità come un gesto misurato. Desideri vicinanza, ma anche silenzio e armonia. La tua città ideale è un giardino condiviso dove si può stare insieme senza disturbarsi. Accetti i cambiamenti solo se portano equilibrio: credi nella bellezza delle piccole relazioni e delle cose fatte con cura.",
            "description_n": "Vivi la socialità come un gesto misurato. Desideri vicinanza, ma anche silenzio e armonia. La tua città ideale è un giardino condiviso dove si può stare insieme senza disturbarsi. Accetti i cambiamenti solo se portano equilibrio: credi nella bellezza delle piccole relazioni e delle cose fatte con cura.",
            "base": ["ATTITUDES.FATEMI_DORMIRE", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "L'ambientalista selettivo",
            "name_f": "L'ambientalista selettiva",
            "name_n": "L'ambientalista selettivə",
            "description_m": "Sei sensibile ai temi ambientali, ma dipende dai singoli casi. Appoggi le cause che ritieni ragionevoli e praticabili, evitando quelle che consideri infattibili. Sei un cittadino pragmatico: vuoi contribuire al cambiamento, ma con misura e senza sacrificare la qualità della vita quotidiana.",
            "description_f": "Sei sensibile ai temi ambientali, ma dipende dai singoli casi. Appoggi le cause che ritieni ragionevoli e praticabili, evitando quelle che consideri infattibili. Sei una cittadina pragmatica: vuoi contribuire al cambiamento, ma con misura e senza sacrificare la qualità della vita quotidiana.",
            "description_n": "Sei sensibile ai temi ambientali, ma dipende dai singoli casi. Appoggi le cause che ritieni ragionevoli e praticabili, evitando quelle che consideri infattibili. Sei unə cittadinə pragmaticə: vuoi contribuire al cambiamento, ma con misura e senza sacrificare la qualità della vita quotidiana.",
            "base": ["ATTITUDES.GRETA", "ATTITUDES.FATEMI_DORMIRE"]
          },
          {
            "name_m": "Il coltivatore della socialità",
            "name_f": "La coltivatrice della socialità",
            "name_n": "Lə coltivatorə della socialità",
            "description_m": "Credi che la città fiorisca solo se la si coltiva insieme. Ami prenderti cura degli spazi pubblici, organizzare feste di quartiere, piantare alberi e ortaggi condivisi. Sei il cuore della cittadinanza attiva: pratichi la sostenibilità non solo come principio, ma anche come catalizzatore di relazioni positive.",
            "description_f": "Credi che la città fiorisca solo se la si coltiva insieme. Ami prenderti cura degli spazi pubblici, organizzare feste di quartiere, piantare alberi e ortaggi condivisi. Sei il cuore della cittadinanza attiva: pratichi la sostenibilità non solo come principio, ma anche come catalizzatrice di relazioni positive.",
            "description_n": "Credi che la città fiorisca solo se la si coltiva insieme. Ami prenderti cura degli spazi pubblici, organizzare feste di quartiere, piantare alberi e ortaggi condivisi. Sei il cuore della cittadinanza attiva: pratichi la sostenibilità non solo come principio, ma anche come catalizzatorə di relazioni positive.",
            "base": ["ATTITUDES.VERDE", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "L'automobilista combattuto",
            "name_f": "L'automobilista combattuta",
            "name_n": "L'automobilista combattutə",
            "description_m": "Usi quotidianamente l'auto e vorresti conservare i parcheggi esistenti, ma desideri anche una città più verde e curata. Sei consapevole dell'impatto ambientale ma fai fatica a cambiare abitudini. Ti muovi in equilibrio tra il desiderio di comfort personale e la consapevolezza di dover fare la tua parte. Potresti diventare un alleato del cambiamento se coinvolto con empatia e soluzioni concrete.",
            "description_f": "Usi quotidianamente l'auto e vorresti conservare i parcheggi esistenti, ma desideri anche una città più verde e curata. Sei consapevole dell'impatto ambientale ma fai fatica a cambiare abitudini. Ti muovi in equilibrio tra il desiderio di comfort personale e la consapevolezza di dover fare la tua parte. Potresti diventare un'alleata del cambiamento se coinvolta con empatia e soluzioni concrete.",
            "description_n": "Usi quotidianamente l'auto e vorresti conservare i parcheggi esistenti, ma desideri anche una città più verde e curata. Sei consapevole dell'impatto ambientale ma fai fatica a cambiare abitudini. Ti muovi in equilibrio tra il desiderio di comfort personale e la consapevolezza di dover fare la tua parte. Potresti diventare unə alleatə del cambiamento se coinvoltə con empatia e soluzioni concrete.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.VERDE"]
          },
          {
            "name_m": "L'estroverso combattuto",
            "name_f": "L'estroversa combattuta",
            "name_n": "L'estroversə combattutə",
            "description_m": "Vuoi luoghi di socialità, ma non sotto casa tua. Ami la vita di quartiere ma temi il rumore e il disordine. Rappresenti bene le tensioni urbane: desiderio di relazione e paura del disturbo. Perciò, hai bisogno di spazi differenziati, per momenti vivi e momenti quieti.",
            "description_f": "Vuoi luoghi di socialità, ma non sotto casa tua. Ami la vita di quartiere ma temi il rumore e il disordine. Rappresenti bene le tensioni urbane: desiderio di relazione e paura del disturbo. Perciò, hai bisogno di spazi differenziati, per momenti vivi e momenti quieti.",
            "description_n": "Vuoi luoghi di socialità, ma non sotto casa tua. Ami la vita di quartiere ma temi il rumore e il disordine. Rappresenti bene le tensioni urbane: desiderio di relazione e paura del disturbo. Perciò, hai bisogno di spazi differenziati, per momenti vivi e momenti quieti.",
            "base": ["ATTITUDES.FATEMI_DORMIRE", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il tradizionalista silenzioso",
            "name_f": "La tradizionalista silenziosa",
            "name_n": "Lə tradizionalista silenziosə",
            "description_m": "La quiete è la tua priorità. Per te la città è casa solo se è tranquilla e familiare. Hai paura che il cambiamento possa compromettere l'equilibrio raggiunto. Non sei necessariamente contrario a tutto, ma temi l'imprevisto e la perdita di controllo. Convincerti richiede fiducia e risultati concreti.",
            "description_f": "La quiete è la tua priorità. Per te la città è casa solo se è tranquilla e familiare. Hai paura che il cambiamento possa compromettere l'equilibrio raggiunto. Non sei necessariamente contraria a tutto, ma temi l'imprevisto e la perdita di controllo. Convincerti richiede fiducia e risultati concreti.",
            "description_n": "La quiete è la tua priorità. Per te la città è casa solo se è tranquilla e familiare. Hai paura che il cambiamento possa compromettere l'equilibrio raggiunto. Non sei necessariamente contrariə a tutto, ma temi l'imprevisto e la perdita di controllo. Convincerti richiede fiducia e risultati concreti.",
            "base": ["ATTITUDES.FATEMI_DORMIRE", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "L'ecologista prudente",
            "name_f": "L'ecologista prudente",
            "name_n": "L'ecologista prudente",
            "description_m": "Apprezzi il verde, ma vuoi ottenerlo senza rivoluzioni. Preferisci piccoli miglioramenti graduali alle trasformazioni radicali. Hai bisogno di tempo per valutare eventuali cambiamenti, ma li sostieni con fermezza se vedi che funzionano e non alterano il tuo comfort.",
            "description_f": "Apprezzi il verde, ma vuoi ottenerlo senza rivoluzioni. Preferisci piccoli miglioramenti graduali alle trasformazioni radicali. Hai bisogno di tempo per valutare eventuali cambiamenti, ma li sostieni con fermezza se vedi che funzionano e non alterano il tuo comfort.",
            "description_n": "Apprezzi il verde, ma vuoi ottenerlo senza rivoluzioni. Preferisci piccoli miglioramenti graduali alle trasformazioni radicali. Hai bisogno di tempo per valutare eventuali cambiamenti, ma li sostieni con fermezza se vedi che funzionano e non alterano il tuo comfort.",
            "base": ["ATTITUDES.VERDE", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "L'automobilista di sobborgo",
            "name_f": "L'automobilista di sobborgo",
            "name_n": "L'automobilista di sobborgo",
            "description_m": "Guidi per necessità, non per orgoglio. Non sopporti gli schiamazzi e il disordine, ma il rumore del traffico non ti disturba. Il tuo attaccamento all'auto è soprattutto pratico: se trovassi alternative fattibili, potresti cambiare abitudini.",
            "description_f": "Guidi per necessità, non per orgoglio. Non sopporti gli schiamazzi e il disordine, ma il rumore del traffico non ti disturba. Il tuo attaccamento all'auto è soprattutto pratico: se trovassi alternative fattibili, potresti cambiare abitudini.",
            "description_n": "Guidi per necessità, non per orgoglio. Non sopporti gli schiamazzi e il disordine, ma il rumore del traffico non ti disturba. Il tuo attaccamento all'auto è soprattutto pratico: se trovassi alternative fattibili, potresti cambiare abitudini.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.FATEMI_DORMIRE"]
          },
          {
            "name_m": "Il cittadino super partes",
            "name_f": "La cittadina super partes",
            "name_n": "Lə cittadinə super partes",
            "description_m": "Non ti senti parte del dibattito: cammini, prendi i mezzi, ma non hai opinioni forti su traffico o sostenibilità. Vivi la città così com'è. La tua neutralità è legata al fatto che le cose, tutto sommato, ti stanno bene così come sono.",
            "description_f": "Non ti senti parte del dibattito: cammini, prendi i mezzi, ma non hai opinioni forti su traffico o sostenibilità. Vivi la città così com'è. La tua neutralità è legata al fatto che le cose, tutto sommato, ti stanno bene così come sono.",
            "description_n": "Non ti senti parte del dibattito: cammini, prendi i mezzi, ma non hai opinioni forti su traffico o sostenibilità. Vivi la città così com'è. La tua neutralità è legata al fatto che le cose, tutto sommato, ti stanno bene così come sono.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "Il tradizionalista a quattro ruote",
            "name_f": "La tradizionalista a quattro ruote",
            "name_n": "Lə tradizionalista a quattro ruote",
            "description_m": "L'auto è parte della tua identità. La città deve adattarsi alle esigenze di chi guida, non il contrario. Vedi ogni riduzione di sosta o corsia come una perdita di libertà. Provi nostalgia per la città del passato, in cui le auto potevano andare e parcheggiare ovunque.",
            "description_f": "L'auto è parte della tua identità. La città deve adattarsi alle esigenze di chi guida, non il contrario. Vedi ogni riduzione di sosta o corsia come una perdita di libertà. Provi nostalgia per la città del passato, in cui le auto potevano andare e parcheggiare ovunque.",
            "description_n": "L'auto è parte della tua identità. La città deve adattarsi alle esigenze di chi guida, non il contrario. Vedi ogni riduzione di sosta o corsia come una perdita di libertà. Provi nostalgia per la città del passato, in cui le auto potevano andare e parcheggiare ovunque.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.STATUS_QUO"]
          },
          {
            "name_m": "L'automobilista da bar",
            "name_f": "L'automobilista da bar",
            "name_n": "L'automobilista da bar",
            "description_m": "Conviviale, ironico, pragmatico. Ami il bar, l'auto, la chiacchiera. La macchina è per te un'estensione dello spazio sociale. Non sei contro l'ambientalismo, ma difendi la libertà di ognunə di vivere la città a modo proprio. Potresti cambiare mezzo solo se ti permettesse di andare al bar comodamente.",
            "description_f": "Conviviale, ironica, pragmatica. Ami il bar, l'auto, la chiacchiera. La macchina è per te un'estensione dello spazio sociale. Non sei contro l'ambientalismo, ma difendi la libertà di ognunə di vivere la città a modo proprio. Potresti cambiare mezzo solo se ti permettesse di andare al bar comodamente.",
            "description_n": "Conviviale, ironicə, pragmaticə. Ami il bar, l'auto, la chiacchiera. La macchina è per te un'estensione dello spazio sociale. Non sei contro l'ambientalismo, ma difendi la libertà di ognunə di vivere la città a modo proprio. Potresti cambiare mezzo solo se ti permettesse di andare al bar comodamente.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il socievole \"zero sbatti\"",
            "name_f": "La socievole \"zero sbatti\"",
            "name_n": "Lə socievole \"zero sbatti\"",
            "description_m": "Partecipi agli eventi solo se invitato. Ami la compagnia, ma non la fatica di costruire qualcosa di nuovo. Rappresenti la maggioranza silenziosa: osservi, commenti, ma non ami esporti. Partecipi solo se ti senti coinvolto emotivamente dalla causa.",
            "description_f": "Partecipi agli eventi solo se invitata. Ami la compagnia, ma non la fatica di costruire qualcosa di nuovo. Rappresenti la maggioranza silenziosa: osservi, commenti, ma non ami esporti. Partecipi solo se ti senti coinvolta emotivamente dalla causa.",
            "description_n": "Partecipi agli eventi solo se invitatə. Ami la compagnia, ma non la fatica di costruire qualcosa di nuovo. Rappresenti la maggioranza silenziosa: osservi, commenti, ma non ami esporti. Partecipi solo se ti senti coinvoltə emotivamente dalla causa.",
            "base": ["ATTITUDES.STATUS_QUO", "ATTITUDES.PIAZZA"]
          },
          {
            "name_m": "Il riformista cauto",
            "name_f": "La riformista cauta",
            "name_n": "Lə riformista cautə",
            "description_m": "Credi che il cambiamento sia giusto, ma diffidi delle soluzioni semplicistiche. Chiedi competenza e gradualità. Sei un interlocutore prezioso: se conquistato, diventi sostenitore solido e costruttivamente critico dei progetti urbani.",
            "description_f": "Credi che il cambiamento sia giusto, ma diffidi delle soluzioni semplicistiche. Chiedi competenza e gradualità. Sei un'interlocutrice preziosa: se conquistata, diventi sostenitrice solida e costruttivamente critica dei progetti urbani.",
            "description_n": "Credi che il cambiamento sia giusto, ma diffidi delle soluzioni semplicistiche. Chiedi competenza e gradualità. Sei un'interlocutorə preziosə: se conquistatə, diventi sostenitorə solidə e costruttivamente criticə dei progetti urbani.",
            "base": ["ATTITUDES.STATUS_QUO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "L'automobilista sincero",
            "name_f": "L'automobilista sincera",
            "name_n": "L'automobilista sincerə",
            "description_m": "Sostieni il concetto di sostenibilità, ma non sei pronto a rinunciare al volante. A volte ti senti in colpa, ma credi anche che questa contraddizione sia inevitabile. Valuti le alternative, ma solo se le reputi credibili e se non ti fanno sentire di aver perso qualcosa.",
            "description_f": "Sostieni il concetto di sostenibilità, ma non sei pronta a rinunciare al volante. A volte ti senti in colpa, ma credi anche che questa contraddizione sia inevitabile. Valuti le alternative, ma solo se le reputi credibili e se non ti fanno sentire di aver perso qualcosa.",
            "description_n": "Sostieni il concetto di sostenibilità, ma non sei prontə a rinunciare al volante. A volte ti senti in colpa, ma credi anche che questa contraddizione sia inevitabile. Valuti le alternative, ma solo se le reputi credibili e se non ti fanno sentire di aver perso qualcosa.",
            "base": ["ATTITUDES.NON_VIVO_SENZA_AUTO", "ATTITUDES.GRETA"]
          },
          {
            "name_m": "L'ecologista inaspettato",
            "name_f": "L'ecologista inaspettata",
            "name_n": "L'ecologista inaspettatə",
            "description_m": "Non usi l'auto, ma non ami quando i politici parlano di ecologia. Ti muovi in modo sostenibile per abitudine o convenienza, non per una questione di principio. Anche se non ti definisci un ecologista, fai bene alla città con le tue scelte.",
            "description_f": "Non usi l'auto, ma non ami quando i politici parlano di ecologia. Ti muovi in modo sostenibile per abitudine o convenienza, non per una questione di principio. Anche se non ti definisci un'ecologista, fai bene alla città con le tue scelte.",
            "description_n": "Non usi l'auto, ma non ami quando i politici parlano di ecologia. Ti muovi in modo sostenibile per abitudine o convenienza, non per una questione di principio. Anche se non ti definisci un'ecologista, fai bene alla città con le tue scelte.",
            "base": ["ATTITUDES.VIVO_SENZA_AUTO", "ATTITUDES.STATUS_QUO"]
          }
        ]
};
