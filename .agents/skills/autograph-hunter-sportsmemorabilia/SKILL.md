---
name: autograph-hunter-sportsmemorabilia
description: Research SportsMemorabilia listings for Autograph Hunter signed Topps/Panini cards and football shirts, with source-specific access-denial handling, partner stock and international shipping checks.
---

# SportsMemorabilia — procedura rynku

## Dostęp i wyszukiwanie

Źródło: **SportsMemorabilia**, `https://www.sportsmemorabilia.com/`. 21.11.2026 otwarcie strony głównej w badawczej przeglądarce zwróciło **Access Denied — You don't have permission to access this page**. Nie potwierdzono działających kontrolek wyszukiwania ani filtrów, więc nie polegaj na zmyślonych selektorach czy parametrach URL. Ta historyczna blokada nie dowodzi, że rynek jest pusty.

Najpierw spróbuj strony głównej w zwykłej przeglądarce badawczej. Jeżeli dostęp działa, użyj widocznego wyszukiwania z pełnymi nazwiskami: `Zinedine Zidane`, `Cristiano Ronaldo`, `Ronaldo Nazario`. Dla kart dodaj osobno `Topps autograph` i `Panini autograph`; dla koszulek `signed jersey`. Odczytaj aktualne nazwy kategorii i sortowania z widocznego UI przed wyborem. Nie zakładaj, że amerykańska kategoria **Football** oznacza piłkę nożną — szukaj **Soccer**.

Gdy strona główna jest blokowana, wykonaj jedno ukierunkowane wyszukiwanie publiczne, np. `site:sportsmemorabilia.com "Cristiano Ronaldo" "Panini" "signed"` albo nazwisko + `autographed jersey`; otwórz najlepszy konkretny wynik. Publiczne adresy produktów zawierają zwykle kategorię klubu i `o-...+t-...+p-...`; używaj faktycznie znalezionego adresu, nie konstruuj numerów produktu. Stary indeks nie potwierdza dzisiejszej ceny, dostępności ani dostawy.

## Kontrola produktu

Na dostępnej stronie porównaj tytuł, rodzaj, producenta karty, cenę USD, **Out of Stock**, **Almost Gone**, **Add to Cart** i **Ships Directly From a Trusted Partner**. Partner jest odrębnym dostawcą; nie przypisuj automatycznie magazynu głównego sklepu ani kosztów innego produktu. Przykład indeksu: ICONS Manchester United Cristiano jersey miał Out of Stock, a inny BAS frame cenę $4189.99 z datą wysyłki sprzed dnia skanu — oba wymagają ponownego bieżącego odczytu.

**Ships Free with code** lub promocja krajowa nie potwierdza darmowej wysyłki do Polski. Sprawdź kraje, partnera, koszty importu i końcowe ograniczenia; bez potwierdzenia `shipsToPL=null`, `shipping=null`, `fees=null`. Nie używaj kodu rabatowego do zmiany ceny raportu bez jawnego, aktualnego warunku i faktycznego sprawdzenia kwalifikacji.

Zdjęcie podpisu na konkretnym przedmiocie trzeba obejrzeć. Stock photo oznacz `catalog`; oznaczenia Fanatics/Icons/Beckett i sam moduł **Authentication** nie zastępują niezależnej kontroli numeru autografu. Jeśli szczegóły lub zdjęcia są zablokowane, przekaż niedostępność i zero przyjętych rekordów, nie „zero ofert na rynku”.

## Zakres i przekazanie wyniku

Domyślni ulubieni właściciela: `zidane` = Zinedine Zidane, `ronaldo` = **Cristiano Ronaldo**, `nazario` = **Ronaldo Nazário / R9 / O Fenômeno**. Samo „Ronaldo” nie identyfikuje zawodnika. Zakres to karty **Topps/Panini** z odręcznym podpisem i podpisane koszulki; fotografie, plakaty, tabliczki, buty, piłki, boxy oraz niepodpisane karty są poza zakresem. Lista ulubionych nie oznacza zapisywania serwisowej listy życzeń ani zakładania konta.

Pracuj w repozytorium Autograph Hunter wskazanym przez koordynatora. Przed skanem przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json`, istniejące oferty i `site/data/example.json`. Nie zmieniaj gałęzi ani wspólnych plików podczas pracy równoległej. Używaj własnej karty badawczej, nie przejmuj kart innych agentów. Przy CAPTCHA, logowaniu lub odmowie dostępu zapisz konkretną blokadę; nie obchodź jej.

Każdą przyjętą ofertę otwórz aktualnie i **obejrzyj zdjęcie podpisu**. Zapisz `signatureEvidence={visibleSignature:true,imageUrl:"https://...",note:"dokładne miejsce podpisu"}`; dla sklepowego zdjęcia dodaj `imageType:"catalog"`. Słowo Auto, patch, grading karty i COA nie dowodzą widocznego podpisu ani jego autentyczności. Odrzuć nadruk, autopen, facsimile, reprint i signature style. `authenticity` domyślnie `unverified`; `verified` wymaga niezależnego dowodu podpisu z URL, notatką i datą. Nie przyznawaj `verified` na podstawie reputacji sklepu.

Raport pracownika: unikalny plik `work/research-YYYY-MM-DD-SOURCE.json` z `{schemaVersion:1,offers:[...]}` zgodny z przykładem repo. Oddzielnie przekaż zakres, obejrzane kategorie/strony, liczbę szczegółowo sprawdzonych ofert, odrzucone pozycje i blokady. Nie nadpisuj raportu innego źródła, nie uruchamiaj importera i nie publikuj — robi to koordynator. Zachowuj `firstSeen`, nie odświeżaj `lastSeen` nieobejrzanych rekordów i nie uznawaj braków w ograniczonym wyniku za sprzedaż. Koszt nieznany to `null`; `shipsToPL=null`, jeśli dostawy do Polski nie potwierdzono. Podaj cenę w walucie źródła, dostawę, znane opłaty i kraj wysyłki; nie wymyślaj zera.

Alert zgłoś koordynatorowi od razu wyłącznie dla aktywnego **Kup teraz** z widocznym podpisem, gdy cena+dostawa+znane opłaty po kursach używanych przez dashboard wynoszą **ściśle <800 PLN**. Nieznane koszty oznacz „od” i wymień braki. Aukcje z bieżącą stawką nigdy nie wywołują tego alertu. Koordynator deduplikuje zgłoszenia i tę samą fizyczną kartę między serwisami.
