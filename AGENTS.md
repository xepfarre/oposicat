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

## 4. Integritat del Contingut Teòric
- Està **estrictament prohibit** modificar, esborrar o alterar qualsevol part del contingut teòric que no sigui el punt específic indicat per l'usuari en la petició actual.
- L'assistent ha de respectar la feina prèvia i no pot "sobrescriure" temes sencers amb versions resumides si no se li demana explícitament.

## 5. Convenció de Nomenclatura de Contingut
- Per referir-nos a punts concrets de la teoria, farem servir el format `X.X.X`:
    - El primer número indica l'Àmbit (1 = Àmbit A, 2 = Àmbit B, 3 = Àmbit C).
    - El segon número indica el Tema dins d'aquell àmbit.
    - El tercer número indica el punt o capítol específic.
- Exemple: `1.1.1` es refereix a l'Àmbit A, Tema 1, Punt 1.
- L'assistent ha de mapejar aquests números als índexs corresponents del codi (tinguent en compte que en programació sovint es comença pel zero).

## 6. Acompanyament Didàctic i Consells de BBDD ("A futur")
- Sempre que l'usuari demani implementar, modificar o dissenyar alguna part de la Base de Dades (BBDD), l'assistent afegirà en les explicacions del xat un bloc dedicat titulat amb el format: **"Et recomano, modificaria i/o recorda que pot passar... a futur"**.
- Aquests consells s'han d'explicar de manera molt tranquil·la, plana i digestible, per evitar que la informació aclapari l'usuari, ajudant-lo a prendre decisions arquitectòniques sanes una a una a mesura que avança l'aplicació.

## 7. Llista de Verificació per al Pas a Producció (Checklist de BBDD i Seguretat)
Quan l'aplicació s'hagi de publicar oficialment (pas a producció), hem de repassar junts els següents punts per garantir que el sistema sigui segur, robust i no falli:
1. **Regles de Seguretat de Firestore (`firestore.rules`):** Canviar l'accés d'escriptura/lectura oberta per regles estrictes de validació (per exemple, que un usuari només pugui llegir/escriure el seu propi perfil i un admin pugui gestionar-ho tot).
2. **Còpies de Seguretat (Backups):** Configurar còpies de seguretat automàtiques (diàries o setmanals) directament a la consola del proveïdor cloud (com Firebase/Google Cloud) per tenir la possibilitat de restaurar l'estat en cas d'un desastre accidental.
3. **Logs i Logging Asíncron:** El registre de logs de comportament no ha de ser indispensable per al funcionament central. Si el log del mòbil d'un usuari falla per manca de cobertura, l'usuari ha de poder seguir estudiant tranquil·lament.
4. **Validació del Registre ("Sign Up" i "Log In"):** Configurar correctament els proveïdors d'autenticació (per correu, Google, etc.) i assegurar-se que els dominis autoritzats estiguin limitats només al web de producció d'OposiCAT.
5. **Control de Rols:** Validar de manera segura al Backend (servidor o regles de base de dades) si un usuari té rol de "Administrador" abans de permetre-li accedir a panells de configuració o cridar mètodes d'esborrat de dades.

