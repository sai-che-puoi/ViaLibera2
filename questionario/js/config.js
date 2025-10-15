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

export const QUIZ_DATA = {
    title: "Questionario Via Libera",
    description: "",

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
