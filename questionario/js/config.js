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
            type: "description",
            text: [
                "Ciao, hai 5 minuti per partecipare a un gioco sul tuo quartiere? è anonimo!",
                "Ciao stiamo mappando i sogni delle persone di Milano su come gestire spazio pubblico della città, ti va di dirci il tuo sogno?",
                "Ti va di giocare a un gioco sul quartiere?",
                "Non siamo del Comune e non vendiamo niente",
                "È una breve intervista sugli spazi del quartiere, non chiediamo dati personali né facciamo riprese",
                "Iniziare con 'Per caso abitate qua', invece di 'ti faccio qualche domanda'",
                "Suggerimento aggiuntivo: C’è un regalo alla fine!",
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description",
            text: [
                "Le tue risposte, insieme a quelle delle altre persone intervistate, saranno analizzate in forma anonima e utilizzate esclusivamente per scopi di ricerca.",
                "I dati raccolti ci aiuteranno a creare una mappa dei desideri delle persone sugli spazi pubblici della città."
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description",
            text: [
                "Quanto sei d'accordo, su una scala che va da 1 (completamente in disaccordo) a 10 (completamente d'accordo), con le seguenti affermazioni che riguardano Milano?"
            ]
        },
        {
            id: 'q1',
            attitude: ATTITUDES.VIVO_SENZA_AUTO,
            type: "slider",
            text: "Troppo spazio cittadino è dedicato alle auto.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q2',
            attitude: ATTITUDES.NON_VIVO_SENZA_AUTO,
            type: "slider",
            text: "Le persone preferiscono utilizzare l’auto perché il trasporto pubblico locale è inefficiente.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q3',
            attitude: ATTITUDES.GRETA,
            type: "slider",
            text: "Ridurre le auto è essenziale per contrastare il cambiamento climatico.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q4',
            attitude: ATTITUDES.STATUS_QUO,
            type: "slider",
            text: "Mi sta bene che le auto in sosta occupino una parte importante dello spazio pubblico.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q5',
            attitude: ATTITUDES.VERDE,
            type: "slider",
            text: "Sarebbe meglio avere più verde nel mio quartiere, anche a costo di perdere qualche parcheggio.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q6',
            attitude: ATTITUDES.FATEMI_DORMIRE,
            type: "slider",
            text: "Mi preoccupa che nuovi spazi di aggregazione nel mio quartiere possano aumentare rumore e confusione.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q7',
            attitude: ATTITUDES.PIAZZA,
            type: "slider",
            text: "Alcuni parcheggi nel mio quartiere potrebbero diventare luoghi di aggregazione o gioco.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
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
            type: "sorting",
            id: "o1",
            text: [
                "Immagina di essere il sindaco di Milano. Ti elenchiamo alcune aree su cui la città potrebbe lavorare nei prossimi anni. Metti in ordine di importanza quelle che, secondo te, dovrebbero essere le priorità: dalla più importante alla meno urgente.",
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
            ]
        },
        {
            type: "radio",
            id: "r1",
            text: "Quale delle seguenti affermazioni sulla presenza di automobili a Milano senti più vicina a te? (Scegli una sola risposta)",
            options: [
                {text: "Ridurrei le auto se ci fossero buone alternative di trasporto", value: "3_1"},
                {text: "Limiterei le auto per migliorare la qualità della vita in città", value: "3_2"},
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
            text: "Immagina di camminare nella Milano che vorresti: cosa vedi, cosa è cambiato?",
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
            text: "CAP",
            alt: "Preferisco non rispondere",
        },
        {
            type: "description",
            text: ["Ti ringrazio per il tempo che ci hai dedicato!",
                "Intanto se vuoi puoi usare questo QR code per andare a leggere di più sul progetto e sul tuo profilo di sognatore/trice e su tutti gli altri che stiamo mappando.",
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
    ]
};
