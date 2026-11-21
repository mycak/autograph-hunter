---
name: autograph-hunter-all-star-signings
description: Search All Star Signings for Autograph Hunter signed Topps/Panini cards and shirts, checking the three favorite footballers, framing options, catalog signatures and international delivery before returning an isolated research report.
---

# All Star Signings — procedura rynku

## Nawigacja potwierdzona 21.11.2026

Źródło: **All Star Signings**, `https://allstarsignings.com/`. Sprawdzone bez logowania kategorie:

- Zidane: `https://allstarsignings.com/product-category/players/zinedine-zidane/`
- Cristiano: `https://allstarsignings.com/product-category/players/cristiano-ronaldo/`
- Nazário: `https://allstarsignings.com/product-category/players/ronaldo-nazario/`

Otwórz każdą kategorię. W `Sort by:` wybierz **Sort by price: low to high**; `Show` ma opcje 12, 15, 24, 36. Potwierdź wybraną opcję po zmianie. Lista zawiera też fotografie, buty i zestawy — wybieraj koszulki, nie najtańszy przedmiot niezależnie od rodzaju. Linki kafelków mogą mieć ogólny tekst **Post Title**; identyfikuj konkretny produkt po pełnym URL i tytule strony. Czytaj paginację i zapisuj faktyczny zakres; nie twierdź, że 15 widocznych wyników oznacza cały rynek.

Dla kart użyj widocznego pola wyszukiwania **I'm searching for...** oraz przycisku **Search**; szukaj osobno `Zinedine Zidane Topps autograph`, `Zinedine Zidane Panini autograph`, analogicznie Cristiano i `Ronaldo Nazario`. Nie zakładaj, że sklep ma kartę tylko dlatego, że sprzedaje autografy; 21.11 potwierdzono głównie koszulki. Brak sekcji kart nie jest automatycznym zerowym wynikiem wykonanego wyszukiwania.

## Szczegóły produktu

Na stronie produktu odczytaj pełny tytuł, cenę GBP, SKU i sekcję **Signed Shirts:**. Warianty **Framed + £110.00** i **Unframed + £0.00** były dostępne 21.11; wybierz dokładny wariant i potwierdź końcową cenę oraz aktywny **Add to basket**. Nie klikaj koszyka do samej kontroli dostępności. „From” na kategorii nie jest potwierdzeniem ceny wybranego wariantu. Używaj stabilnego SKU + wariant w ID, np. `allstarsignings:868622:unframed`; dwa SKU nie dowodzą dwóch unikalnych egzemplarzy.

Otwórz obraz główny produktu i obejrzyj podpis. Zdjęcia są katalogowe — sklep wprost dopuszcza różne położenie podpisu na dostarczanej sztuce. W opisach Zidane’a potwierdzono deklarację sesji 4.10.2025 i COA/JSA, a Nazário Beckett/COA; bez niezależnej kontroli numeru pozostaje `unverified`.

**Delivery** (`https://allstarsignings.com/delivery/`) rozróżnia UK i NON-UK: koszulki bez ramy Royal Mail International signed for, ramy kurierem. NON-UK odbiorca pokrywa import. Deklaracja worldwide nie wycenia wysyłki do PL; nie przepisuj kosztu UK jako polskiego i nie traktuj importu jako darmowego. W notatce podaj, czy PL potwierdzono indywidualnie, czy dostępna jest tylko ogólna deklaracja międzynarodowa.

Kontrola 21.11: Cristiano — **No products were found matching your selection**; Nazário — 2 koszulki po £549.99; Zidane — kilka wariantów koszulek od £689.99. To historyczny wynik, przy następnym skanie sprawdź ponownie.

## Zakres i przekazanie wyniku

Domyślni ulubieni właściciela: `zidane` = Zinedine Zidane, `ronaldo` = **Cristiano Ronaldo**, `nazario` = **Ronaldo Nazário / R9 / O Fenômeno**. Samo „Ronaldo” nie identyfikuje zawodnika. Zakres to karty **Topps/Panini** z odręcznym podpisem i podpisane koszulki; fotografie, plakaty, tabliczki, buty, piłki, boxy oraz niepodpisane karty są poza zakresem. Lista ulubionych nie oznacza zapisywania serwisowej listy życzeń ani zakładania konta.

Pracuj w repozytorium Autograph Hunter wskazanym przez koordynatora. Przed skanem przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json`, istniejące oferty i `site/data/example.json`. Nie zmieniaj gałęzi ani wspólnych plików podczas pracy równoległej. Używaj własnej karty badawczej, nie przejmuj kart innych agentów. Przy CAPTCHA, logowaniu lub odmowie dostępu zapisz konkretną blokadę; nie obchodź jej.

Każdą przyjętą ofertę otwórz aktualnie i **obejrzyj zdjęcie podpisu**. Zapisz `signatureEvidence={visibleSignature:true,imageUrl:"https://...",note:"dokładne miejsce podpisu"}`; dla sklepowego zdjęcia dodaj `imageType:"catalog"`. Słowo Auto, patch, grading karty i COA nie dowodzą widocznego podpisu ani jego autentyczności. Odrzuć nadruk, autopen, facsimile, reprint i signature style. `authenticity` domyślnie `unverified`; `verified` wymaga niezależnego dowodu podpisu z URL, notatką i datą. Nie przyznawaj `verified` na podstawie reputacji sklepu.

Raport pracownika: unikalny plik `work/research-YYYY-MM-DD-SOURCE.json` z `{schemaVersion:1,offers:[...]}` zgodny z przykładem repo. Oddzielnie przekaż zakres, obejrzane kategorie/strony, liczbę szczegółowo sprawdzonych ofert, odrzucone pozycje i blokady. Nie nadpisuj raportu innego źródła, nie uruchamiaj importera i nie publikuj — robi to koordynator. Zachowuj `firstSeen`, nie odświeżaj `lastSeen` nieobejrzanych rekordów i nie uznawaj braków w ograniczonym wyniku za sprzedaż. Koszt nieznany to `null`; `shipsToPL=null`, jeśli dostawy do Polski nie potwierdzono. Podaj cenę w walucie źródła, dostawę, znane opłaty i kraj wysyłki; nie wymyślaj zera.

Alert zgłoś koordynatorowi od razu wyłącznie dla aktywnego **Kup teraz** z widocznym podpisem, gdy cena+dostawa+znane opłaty po kursach używanych przez dashboard wynoszą **ściśle <800 PLN**. Nieznane koszty oznacz „od” i wymień braki. Aukcje z bieżącą stawką nigdy nie wywołują tego alertu. Koordynator deduplikuje zgłoszenia i tę samą fizyczną kartę między serwisami.
