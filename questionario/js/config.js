import {googleSheetScriptUrl} from "./script_key.js";

export const CONFIG = {
    // API Configuration
    googleScriptUrl: googleSheetScriptUrl,
    enableDataCollection: true,
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
            type: "slider",
            text: "E' normale che le macchine siano parcheggiate per strada.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q5',
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
            type: "slider",
            text: "Riconvertire i parcheggi in spazi di aggregazione porterebbe solo rumore e disturbo sotto casa.",
            min: 1,
            max: 10,
            defaultValue: 5,
            minLabel: "Completamente<br>in disaccordo",
            maxLabel: "Completamente<br>d'accordo",
        },
        {
            id: 'q7',
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
                "- Verde urbano (alberi, aiuole, orti)",
                "- Mobilità sostenibile (piste ciclabili, pedonalizzazioni, ZTL, servizi di sharing)",
                "- Spazi di socialità (panchine, spazi comunitari, eventi)",
                "- Bambini e famiglie (giochi, spazi sicuri)",
                "- Cultura e sport (arte urbana, campetti, attività)",
                "- Parcheggi e circolazione delle auto"],
            options: [
                "Verde urbano (alberi, aiuole, orti)",
                "Mobilità sostenibile (piste ciclabili, pedonalizzazioni, ZTL, servizi di sharing)",
                "Spazi di socialità (panchine, spazi comunitari, eventi)",
                "Bambini e famiglie (giochi, spazi sicuri)",
                "Cultura e sport (arte urbana, campetti, attività)",
                "Parcheggi e circolazione delle auto",
            ]
        },
        {
            type: "radio",
            id: "r1",
            text: "Alcune persone ritengono che limitare le auto migliori la vivibilità, altre persone che renda più difficile spostarsi. Tu come la vedi? (Scegli una sola risposta)",
            options: [
                {text: "Ridurrei le auto se ci fossero buone alternative di trasporto", value: "3_1"},
                {text: "Limitare le auto migliorerebbe la qualità della vita nel quartiere", value: "3_2"},
                {text: "Le auto sono necessarie per la vita quotidiana (lavoro, famiglia, etc.)", value: "3_3"},
                {text: "Dipende da come vengono organizzati parcheggi e trasporto pubblico", value: "3_4"},
                {text: "Non sento il bisogno di cambiare la situazione attuale", value: "3_5"},
                {text: "Non ho un’opinione precisa a riguardo", value: "3_6"},
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
    ]
};
