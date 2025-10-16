import {googleScriptUrl} from "./script_key.js";

export const CONFIG = {
    // API Configuration
    googleScriptUrl: googleScriptUrl,
    enableDataCollection: true,

    // Coordinate system
    coordinates: {
        xAxis: {min: 0, max: 100, center: 50},
        yAxis: {min: 0, max: 100, center: 50},
        xLabels: {min: 'Individuale', max: 'Collettivo'},
        yLabels: {min: 'Status Quo', max: 'Cambiamento'}
    },

    // Result thresholds for categorization
    resultThresholds: {
        low: 33,
        high: 66
    }
};


const ATTITUDES = {
    VIVO_SENZA_AUTO: "Vivo anche senza auto",
    GRETA: "Siamo con Greta!",
    VERDE: "Più verde c’è meglio è",
    PIAZZA: "La piazza è la mia casa",
    FATEMI_DORMIRE: "Fatemi dormire",
    STATUS_QUO: "Lascia stare, perchè cambiare?",
    NON_VIVO_SENZA_AUTO: "Non posso vivere senza auto"
}

export function generateTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100);

    return `${hours}.${minutes}.${seconds}-${random}`;
}

export const QUIZ_DATA = {
    title: "Questionario Via Libera " + generateTimestamp(),
    description: "Ciao! Siamo volontari di Sai che puoi? e stiamo facendo un’indagine di quartiere per immaginare insieme una futura Milano.\n" +
        "Ci piacerebbe sapere cosa pensi di come viene usato lo spazio pubblico in città. " +
        "Abbiamo preparato un gioco e 5 domande per capire meglio il tuo rapporto con questi temi: non ci sono risposte giuste o sbagliate, ci interessa solo il tuo punto di vista.\n" +
        "Dura pochi minuti, ti va di partecipare?",

    interviewers: [
        { location: "Via Aselli", couple: "Caccini - Ticozzelli" },
        { location: "Via Aselli", couple: "Minora - Uguccioni" },
        { location: "Via Aselli", couple: "Ciaccio - Sciariada" },
        { location: "Via Aselli", couple: "Marcantognini - Secco" },

        { location: "Via Cadore", couple: "De luca - Gobbi" },
        { location: "Via Cadore", couple: "Uberti Foppa - Vita" },
        { location: "Via Cadore", couple: "Collotti - Locatelli" },
        { location: "Via Cadore", couple: "Miranti - Paoletti" },

        { location: "Via Solari", couple: "Pirovano - Foresio" },
        { location: "Via Solari", couple: "Ucci - Marini Govigli" },
        { location: "Via Solari", couple: "Bottenghi - Al Hazwani" },
        { location: "Via Solari", couple: "Cannarozzo - Bianco" },
        { location: "Via Solari", couple: "Negri - Orsenigo" },

        { location: "Piazza Bettini", couple: "Armellin  - Cosso" },
        { location: "Piazza Bettini", couple: "Pellone  - Galuppini" },
        { location: "Piazza Bettini", couple: "Cella - Bonini" },
        { location: "Piazza Bettini", couple: "Leone - Goisis" }
    ],
    questions: [
        {
            id: 'q1',
            attitude: ATTITUDES.VIVO_SENZA_AUTO,
            type: "slider",
            text: "Non uso la macchina e credo che troppo spazio cittadino sia dedicato alle auto: sarebbe giusto ridurlo o riconvertirlo.",
            min: 0,
            max: 5,
            defaultValue: 3,
            minLabel: "Per niente",
            maxLabel: "Moltissimo",
            weights: {x: 1, y: 0.5}
        },
        {
            id: 'q2',
            attitude: ATTITUDES.GRETA,
            type: "slider",
            text: "Ridurre le auto è essenziale per il bene del pianeta e combattere la crisi climatica.",
            min: 0,
            max: 5,
            defaultValue: 3,
            minLabel: "Per niente",
            maxLabel: "Moltissimo",
            weights: {x: 1, y: 1}
        },
        {
            id: 'q3',
            attitude: ATTITUDES.VERDE,
            type: "slider",
            text: "Vorrei più verde nel mio quartiere, anche se questo significasse perdere qualche parcheggio.",
            min: 0,
            max: 5,
            defaultValue: 3,
            minLabel: "Per niente",
            maxLabel: "Moltissimo",
            weights: {x: 0.5, y: 1}
        },
        {
            id: 'q4',
            attitude: ATTITUDES.PIAZZA,
            type: "slider",
            text: "Mi piacerebbe che alcuni spazi oggi dedicati alle auto nel mio quartiere diventassero luoghi di aggregazione o gioco.",
            min: 0,
            max: 5,
            defaultValue: 3,
            minLabel: "Per niente",
            maxLabel: "Moltissimo",
            weights: {x: 0.5, y: 0.5}
        },
        {
            id: 'q5',
            attitude: ATTITUDES.FATEMI_DORMIRE,
            type: "slider",
            text: "Temo che riconvertire i parcheggi in spazi di aggregazione porterebbe solo rumore e disturbo sotto casa.",
            min: 0,
            max: 5,
            defaultValue: 3,
            minLabel: "Per niente",
            maxLabel: "Moltissimo",
            weights: {x: -0.5, y: -0.5}
        },
        {
            id: 'q6',
            attitude: ATTITUDES.STATUS_QUO,
            type: "slider",
            text: "Non vedo dove sia il problema nell'avere le macchine parcheggiate lungo la strada: è normale così.",
            min: 0,
            max: 5,
            defaultValue: 3,
            minLabel: "Per niente",
            maxLabel: "Moltissimo",
            weights: {x: -1, y: -0.5}
        },
        {
            id: 'q7',
            attitude: ATTITUDES.NON_VIVO_SENZA_AUTO,
            type: "slider",
            text: "Dipendo dall'auto per i miei spostamenti: non potrei farne a meno soprattutto con le alternative attuali.",
            min: 0,
            max: 5,
            defaultValue: 3,
            minLabel: "Per niente",
            maxLabel: "Moltissimo",
            weights: {x: -1, y: -1}
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description",
            text: "Domande Immaginative"
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "allocation",
            id: "a1",
            text: "Immagina di poter ridisegnare le strade di Milano. Hai a disposizione dei punti da distribuire tra le scelte seguenti, in base a quanto li ritieni importanti. La somma totale deve essere 100.",
            options_number: 6,
            options: [
                {text: "Verde urbano (alberi, aiuole, orti)", value: "1_1"},
                {text: "Mobilità sostenibile (piste ciclabili, pedonalizzazioni)", value: "1_2"},
                {text: "Spazi di socialità (panchine, spazi comunitari, eventi)", value: "1_3"},
                {text: "Bambini e famiglie (giochi, spazi sicuri)", value: "1_4"},
                {text: "Cultura e sport (arte urbana, campetti, attività)", value: "1_5"},
                {text: "Parcheggi e circolazione delle auto", value: "1_6"}
            ]
        },
        {
            type: "option",
            id: "o1",
            max_choices: 2,
            options_number: 6,
            text: "Se potessi scegliere un’esperienza che ti piacerebbe vivere sotto casa tua, quale sarebbe? (Risposta aperta da registrare, scegliendo l'opzione 'Altro')",
            options: [
                {text: "Prendere un caffè all’aperto senza rumore di auto", value: "2_1"},
                {text: "Vedere bambini che giocano in sicurezza", value: "2_2"},
                {text: "Partecipare a un evento di quartiere", value: "2_3"},
                {text: "Fare sport all’aperto", value: "2_4"},
                {text: "Fare giardinaggio o partecipare alla creazione di foreste urbane", value: "2_5"},
                {text: "Altro", value: "2_6"},
            ]
        },
        {
            type: "radio",
            id: "r1",
            text: "Alcune persone ritengono che limitare le auto migliori la vivibilità, altre persone che renda più difficile spostarsi. Tu come la vedi? (Scegli una sola risposta)",
            options: [
                {text: "Ridurrei le auto se ci fossero buone alternative di trasporto", value: "3_1"},
                {text: "Limitare le auto migliorerebbe la qualità della vita nel quartiere", value: "3_2"},
                {text: "Le auto sono necessarie per la vita quotidiana (lavoro, famiglia, ecc.)", value: "3_3"},
                {text: "Dipende da come vengono organizzati parcheggi e trasporto pubblico", value: "3_4"},
                {text: "Non sento il bisogno di cambiare la situazione attuale", value: "3_5"},
                {text: "Non ho un’opinione precisa a riguardo", value: "3_6"},
            ]
        },
        {
            type: "option",
            id: "o2",
            max_choices: 3,
            options_number: 7,
            text: "Immagina di camminare nella Milano che vorresti: cosa vedi, cosa è cambiato? (Risposta aperta da registrare, scegliendo l'opzione 'Altro')",
            options: [
                {text: "Avere parcheggi e strade organizzate per muoversi in auto", value: "4_1"},
                {text: "Più spazi verdi e aree per stare all’aperto", value: "4_2"},
                {text: "Spazi più accessibili e facili da raggiungere", value: "4_3"},
                {text: "Più spazio per corsie/ percorsi ciclabili", value: "4_4"},
                {text: "Luoghi che favoriscano incontro e socialità", value: "4_5"},
                {text: "Spazi pubblici più sicuri e tranquilli", value: "4_6"},
                {text: "Altro", value: "4_7"},
            ]
        },
        {
            type: "radio",
            id: "r2",
            text: "In una strada dove il traffico automobilistico è stato ridotto cosa accade secondo te? Immagina questa strada con meno auto, quale cambiamento ti colpisce per primo? (Scegli una sola risposta)",
            options: [
                {text: "Meno rumore", value: "5_1"},
                {text: "Più socialità tra vicini", value: "5_2"},
                {text: "Aria più pulita", value: "5_3"},
                {text: "Possibilità di assembramenti chiassosi", value: "5_4"},
                {text: "Maggiore difficoltà nel raggiungere i negozi e servizi", value: "5_5"},
                {text: "Maggior sicurezza stradale", value: "5_6"},
                {text: "Non noto nessun cambiamento", value: "5_7"},
                {text: "Altro", value: "5_8"},
            ]
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "description",
            text: "Domande anagrafiche"
        },
        {
            type: "separator",
            text: ""
        },
        {
            type: "radio",
            id: "eta",
            text: "Età",
            options: [
                {text: "16 - 29 anni", value: "6_1"},
                {text: "30 - 44 anni", value: "6_2"},
                {text: "45 - 59 anni", value: "6_3"},
                {text: "60+ anni", value: "6_4"},
                {text: "Preferisco non rispondere", value: "6_5"},
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
            max_choices: 6,
            options_number: 6,
            text: "Quali mezzi di trasporto usi di più?",
            options: [
                {text: "Auto", value: "8_1"},
                {text: "Bici", value: "8_2"},
                {text: "Mezzi pubblici", value: "8_3"},
                {text: "A piedi", value: "8_4"},
                {text: "Moto / Scooter / Monopattino", value: "8_5"},
                {text: "Altro", value: "8_6"},
            ]
        },
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
            description: "Non usano l’auto ma non vedono motivo per cambiare altro.",
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
            description: "Dipendono dall’auto ma odiano il casino sotto casa.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.FATEMI_DORMIRE]
        },
        {
            name: "I Contraddittori verdi",
            description: "Parlano di sostenibilità ma non sanno vivere senza auto.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.GRETA]
        },
        {
            name: "I Tradizionalisti a quattro ruote",
            description: "Vogliono che tutto resti com’è, soprattutto i parcheggi.",
            base: [ATTITUDES.NON_VIVO_SENZA_AUTO, ATTITUDES.STATUS_QUO]
        },
        {
            name: "I Giardinieri sociali",
            description: "Verde e convivialità: l’ideale è chiacchierare all’ombra di un albero.",
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
            description: "Dicono di non usare l’auto, ma non riescono a farne a meno. ",
            base: [ATTITUDES.VIVO_SENZA_AUTO, ATTITUDES.NON_VIVO_SENZA_AUTO]
        }
    ]

};
