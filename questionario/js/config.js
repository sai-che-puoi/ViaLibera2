import {googleSheetScriptUrl} from "./script_key.js";

export const CONFIG = {
    // API Configuration
    googleScriptUrl: googleSheetScriptUrl,
    enableDataCollection: true,
};

// Define attitudes based on the questions
const ATTITUDES = {
    SPAZIO_AUTO: "Troppo spazio alle auto",
    TRASPORTO_INEFFICIENTE: "Trasporto pubblico inefficiente", 
    CLIMA: "Priorità al clima",
    AUTO_OK: "Le auto in sosta vanno bene",
    PIU_VERDE: "Più verde urbano",
    RUMORE_PREOCCUPA: "Preoccupazione per il rumore",
    AGGREGAZIONE: "Spazi di aggregazione"
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
            attitude: ATTITUDES.SPAZIO_AUTO,
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
            attitude: ATTITUDES.TRASPORTO_INEFFICIENTE,
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
            attitude: ATTITUDES.CLIMA,
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
            attitude: ATTITUDES.AUTO_OK,
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
            attitude: ATTITUDES.PIU_VERDE,
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
            attitude: ATTITUDES.RUMORE_PREOCCUPA,
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
            attitude: ATTITUDES.AGGREGAZIONE,
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
            name: "Riformatori Urbani",
            description: "Vogliono meno auto e più spazi verdi per il bene della città e del clima.",
            base: [ATTITUDES.SPAZIO_AUTO, ATTITUDES.CLIMA]
        },
        {
            name: "Ecologisti Sociali",
            description: "Uniscono la passione per il verde con il desiderio di spazi di aggregazione.",
            base: [ATTITUDES.PIU_VERDE, ATTITUDES.AGGREGAZIONE]
        },
        {
            name: "Pragmatici del Verde",
            description: "Amano la natura ma sono preoccupati dal caos che potrebbero portare i cambiamenti.",
            base: [ATTITUDES.PIU_VERDE, ATTITUDES.RUMORE_PREOCCUPA]
        },
        {
            name: "Visionari del Clima",
            description: "Vedono negli spazi di aggregazione un modo per costruire comunità sostenibili.",
            base: [ATTITUDES.CLIMA, ATTITUDES.AGGREGAZIONE]
        },
        {
            name: "Realisti del Trasporto",
            description: "Riconoscono i problemi del trasporto pubblico ma vogliono meno spazio alle auto.",
            base: [ATTITUDES.SPAZIO_AUTO, ATTITUDES.TRASPORTO_INEFFICIENTE]
        },
        {
            name: "Conservatori Verdi",
            description: "Vogliono più verde ma accettano lo status quo sui parcheggi.",
            base: [ATTITUDES.PIU_VERDE, ATTITUDES.AUTO_OK]
        },
        {
            name: "Ambientalisti Silenziosi",
            description: "Credono nel cambiamento climatico ma temono il rumore dei nuovi spazi.",
            base: [ATTITUDES.CLIMA, ATTITUDES.RUMORE_PREOCCUPA]
        },
        {
            name: "Scettici Socievoli",
            description: "Vogliono spazi di aggregazione ma pensano che il problema non siano le auto.",
            base: [ATTITUDES.AGGREGAZIONE, ATTITUDES.AUTO_OK]
        },
        {
            name: "Tradizionalisti Pragmatici",
            description: "Accettano le auto parcheggiate e pensano che il vero problema sia il trasporto pubblico.",
            base: [ATTITUDES.AUTO_OK, ATTITUDES.TRASPORTO_INEFFICIENTE]
        },
        {
            name: "Nostalgici del Silenzio",
            description: "Preferiscono mantenere tutto com'è pur di evitare nuovi rumori e confusione.",
            base: [ATTITUDES.AUTO_OK, ATTITUDES.RUMORE_PREOCCUPA]
        },
        {
            name: "Critici Equilibrati",
            description: "Vedono sia i problemi delle auto che quelli del trasporto pubblico.",
            base: [ATTITUDES.SPAZIO_AUTO, ATTITUDES.PIU_VERDE]
        },
        {
            name: "Sognatori Cauti",
            description: "Vorrebbero cambiamenti per il clima ma sono frenati dalle preoccupazioni pratiche.",
            base: [ATTITUDES.CLIMA, ATTITUDES.AUTO_OK]
        }
    ]
};
