# PAIRING ALGORITHM #

Questo file Python contiene l'algoritmo che raggruppa persone e coppie insieme
in modo da uniformarle in un determinato set di luoghi e tempi.

## Setup ##

È preferibile in partenza installare `marimo`, possibilmente con `uv` sotto
`venv`. Quindi:

```
uv venv venv
./venv/bin/activate
uv pip install marimo
```

Il file può essere eseguito come puro Python (quindi `python pairing.py`, ma per
editarlo è preferibile aprire un notebook Marimo eseguendo

```
marimo edit pairing.py
```

Questo aprirà sul browser un'interfaccia dove si vede il codice, diviso in
blocchi, e si può eseguire. Marimo può anche automaticamente scaricare il resto
delle dipendenze utilizzando uv.

Il vantaggio di questo approccio è che visto che l'algoritmo inizia scaricando
un foglio csv da Google, si può eseguire questo step una sola volta e poi
lavorare sul resto senza dover scaricare il foglio ogni volta che si vuol
provare ad eseguire nuovamente l'algoritmo.
