# Els Principals - Criteris de Treball per a OposiCAT

Aquest fitxer conté les regles i criteris que s'han de mantenir durant tot el desenvolupament de l'aplicació.

## 1. Comentaris per a no-programadors
- Totes les noves línies de codi o blocs funcionals han de portar comentaris explicatius.
- El llenguatge dels comentaris ha de ser planer, de manera que algú que no sàpiga programar pugui entendre la lògica i el propòsit d'aquella part de l'aplicació.
- Aquests comentaris són essencials per facilitar el treball en equip en el futur.

## 2. Idioma
- Tota la comunicació i els comentaris es faran en català.

## 3. Modularitat i Separació (Arquitectura de "Lego")
- L'aplicació ha d'estar clarament dividida entre Frontend (el que veu l'usuari) i Backend (la lògica del servidor).
- Cada funcionalitat ha de tenir la seva pròpia classe o component. No volem fitxers gegants que ho facin tot.
- L'assistent decidirà automàticament si una nova peça ha d'anar a la carpeta `Backend` o `Frontend` i l'ubicarà correctament.
- Prioritzarem la creació de components petits i fàcils de testejar per separat.
