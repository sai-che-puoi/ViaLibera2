import itertools
import random

def genera_nomi():
    # Nomi con genere grammaticale
    # 'm' = maschile, 'f' = femminile
    nomi = [
        ("Pinguino", "m"),
        ("Falco", "m"),
        ("Drago", "m"),
        ("Leone", "m"),
        ("Tartaruga", "f"),
        ("Papera", "f"),
        ("Volpe", "f"),
        ("Aquila", "f"),
        ("Squalo", "m"),
        ("Scimmia", "f"),
        ("Balena", "f"),
        ("Giraffa", "f"),
        ("Cane", "m"),
        ("Gatto", "m"),
    ]

    # Colori con forma maschile e femminile
    colori = [
        ("Rosso", "Rossa"),
        ("Verde", "Verde"),
        ("Blu", "Blu"),
        ("Viola", "Viola"),
        ("Giallo", "Gialla"),
        ("Nero", "Nera"),
        ("Bianco", "Bianca"),
        ("Arancione", "Arancione"),
        ("Coraggioso", "Coraggiosa"),
        ("Audace", "Audace"),
        ("Curioso", "Curiosa"),
        ("Veloce", "Veloce"),
        ("Robot", "Robot"),
    ]

    combinazioni = []
    for (nome, genere), (col_m, col_f) in itertools.product(nomi, colori):
        colore = col_m if genere == "m" else col_f
        combinazioni.append(f"{nome} {colore}")
    return combinazioni

if __name__ == "__main__":
    gruppi = genera_nomi()

    print(f"Totale combinazioni: {len(gruppi)}")
    for g in gruppi:
        print(g)
