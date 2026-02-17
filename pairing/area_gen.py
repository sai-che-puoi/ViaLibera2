import numpy as np

def gen_slots():
    area_slots = np.array([
        "01. Duomo", "02. Brera", "03. Giardini Porta Venezia", "04. Guastalla",
        "05. Porta Vigentina - Porta Lodovica", "06. Porta Ticinese - Conca del Naviglio",
        "07. Magenta- San Vittore", "08. Parco Sempione", "09. Porta Garibaldi - Porta Nuova",
        "10. Stazione Centrale - Ponte Seveso", "11. Isola", "12. Maciachini-Maggiolina",
        "13. Greco - Segnano", "14. Niguarda - Ca’ Granda - Prato Centenaro - Q.re Fulvio Testi",
        "15. Bicocca", "16. Gorla - Precotto", "17. Adriano", "18. Cimiano - Rottole - Q.re Feltre",
        "19. Padova - Turro - Crescenzago", "20. Loreto - Casoretto - NoLo",
        "21. Buenos Aires - Porta Venezia - Porta Monforte", "22. Città studi",
        "23. Lambrate - Ortica", "24. Parco Forlanini - Cavriano", "25. Corsica",
        "26. XXII Marzo", "27. Porta Romana", "28. Umbria - Molise - Calvairate",
        "29. Ortomercato", "30. Taliedo - Morsenchio - Q.re Forlanini",
        "31. Monluè - Ponte Lambro", "32. Triulzo Superiore", "33. Rogoredo - Santa Giulia",
        "34. Chiaravalle", "35. Lodi-Corvetto", "36. Scalo Romana", "37. Morivione",
        "38. Vigentino - Q.re Fatima", "39. Quintosole", "40. Ronchetto delle Rane",
        "41. Gratosoglio - Q.re Missaglia - Q.re Terrazze",
        "42. Stadera - Chiesa Rossa - Q.re Torretta - Conca Fallata", "43. Tibaldi",
        "44. Porta Ticinese - Conchetta", "45. Moncucco - San Cristoforo", "46. Barona",
        "47. Cantalupa", "48. Ronchetto sul Naviglio - Q.re Lodovico il Moro",
        "49. Giambellino", "50. Porta Genova", "51. Porta Magenta", "52. Bande Nere",
        "53. Lorenteggio", "54. Muggiano", "55. Baggio - Q.re degli Olmi - Q.re Valsesia",
        "56. Forze Armate", "57. San Siro", "58. De Angeli-Monte Rosa", "59. Tre Torri",
        "60. Stadio - Ippodromi", "61. Quarto Cagnino", "62. Quinto Romano", "63. Figino",
        "64. Trenno", "65. Q.re Gallaratese - Q.re San Leonardo - Lampugnano", "66. QT8",
        "67. Portello", "68. Pagano", "69. Sarpi", "70. Ghisolfa",
        "71. Villapizzone - Cagnola - Boldinasco", "72. Maggiore - Musocco - Certosa",
        "73. MIND - Cascina Triulza", "74. Roserio", "75. Stephenson",
        "76. Quarto Oggiaro - Vialba - Musocco", "77. Bovisa", "78. Farini", "79. Dergano",
        "80. Affori", "81. Bovisasca", "82. Comasina", "83. Bruzzano", "84. Parco Nord",
        "85. Parco delle Abbazie", "86. Parco dei Navigli", "87. Assiano",
        "88. Parco Bosco in città"
    ])

    time_slots = np.array(["Sabato mattina", "Sabato pomeriggio", "Domenica mattina", "Domenica pomeriggio"])

    return area_slots, time_slots
