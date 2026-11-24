# Tjekliste: før du stoler på din server

Gå listen igennem, når agenten siger den er færdig. Du kan bede agenten vise dig svaret på hvert punkt. Et punkt er først opfyldt, når du selv har set det.

## Hvad kan den?

- [ ] **Jeg har læst listen af tools.** Bed agenten vise trafikken, og find linjen `svar: tools`. Er der et tool du ikke bad om, så spørg hvorfor.
- [ ] **Ingen tools kan ændre noget.** Ingen navne som opret, ret, slet, send eller publicér.
- [ ] **Hver beskrivelse siger hvornår toolet skal bruges.** Læs dem højt. Ville en ny kollega forstå hvornår det giver mening?

## Hvad kan den se?

Bruger serveren ingen nøgle, så spring de tre første punkter over.

- [ ] **Nøglen ligger kun i `.env`.** Søg efter de første tegn af nøglen i hele mappen. Den må kun dukke op i `.env`.
- [ ] **`.env` er ikke med i git.** Bruger du git, må `git status` ikke vise filen.
- [ ] **Nøglen har kun læseadgang**, hvis værktøjet tilbyder det.
- [ ] **Modellen kan ikke vælge en fri sti eller adresse.** Intet tool tager en filsti eller en URL som fri tekst. Bed agenten vise dig et kald med en fremmed adresse blive afvist.
- [ ] **Jeg ved om serveren går på nettet.** Gør den ikke, kører den i Docker med `--network none`.

## Hvad svarer den?

- [ ] **Jeg har stillet mine tre spørgsmål fra briefen** og fået svar der passer med det, jeg ser i værktøjet selv.
- [ ] **Tallene har enhed og periode med.** Valuta, datoer og tidszone står i svaret.
- [ ] **Svarene indeholder ikke persondata**, medmindre jeg har bedt om det.
- [ ] **Et forkert spørgsmål giver en forståelig fejl**, ikke et gæt.
- [ ] **Nøglen står ikke i `trafik.log`**, hvis serveren bruger en. Søg i filen.

## Virker den?

- [ ] **`npm test` er grøn**, og testen handler om mine tools, ikke om eksemplet.
- [ ] **Jeg har set toolet blive kaldt i min egen klient**, ikke kun i testen.
- [ ] **Agenten har sagt hvad der ikke er testet.**

## Før andre får adgang

Kittet er bygget til én person på én maskine. Skal kolleger bruge serveren, skal den hostes, og så kommer der nye opgaver: login, en nøgle pr. person, logs, overvågning og løbende opdateringer. Det er et andet projekt end det her.
