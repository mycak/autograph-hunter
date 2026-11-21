---
name: autograph-hunter-icons
description: Search Icons.com for Autograph Hunter signed shirts and any qualifying Topps/Panini cards; distinguish Cristiano from Brazilian Ronaldo, available stock from pre-orders, and catalog signature evidence from authentication.
---

# Icons.com — procedura rynku

## Potwierdzone punkty wejścia i filtry

Źródło: **Icons.com**. Trzy różne kategorie ulubionych:

- Zidane: `https://www.icons.com/players/legends/legends-i-z/zinedine-zidane-signed-memorabilia.html`
- Cristiano: `https://www.icons.com/players/cristiano-ronaldo.html`
- Nazário: `https://www.icons.com/players/legends/legends-i-z/ronaldo-signed-memorabilia.html` — strona **Ronaldo** opisuje brazylijskiego mistrza świata, nie CR7.

Na standardowej liście rozwiń **Product type(s)** i wybierz **Signed shirts**. Potwierdzony parametr po tej operacji: `icons_product_type=Signed+shirts`. W **Sort By** wybierz **Price: low to high**, potwierdź aktualny URL `product_list_order=price_asc` i zaznaczenie filtra. Po zmianie strony/filtra poczekaj na widoczne potwierdzenie; wczytywanie SPA może zwrócić jeszcze poprzedni snapshot. Cookie banner może przechwycić kliknięcie: **Adjust cookie preferences → Deny all cookies** zamyka go bez zapisu preferencji reklamowych.

Czytaj **Currently showing N of M items** i **LOAD MORE ITEMS**. 29 kafelków nie oznacza przeglądu wszystkich 105/171 produktów. Zapamiętaj limit rzeczywiście przejrzanych wyników. Wyszukiwanie kart wykonuj przez **Search Store** z pełnym nazwiskiem oraz Topps/Panini autograph; nie utożsamiaj **Signed cards and plaques** z kartami kolekcjonerskimi tych producentów.

## Dostępność i cena

Cristiano ma obecnie osobną stronę redakcyjną, nie identyczną listę filtrów: sekcje **PRE-ORDER NOW**, **AVAILABLE NOW**, **RONALDO ITEMS**, **UNSIGNED RONALDO**. 21.11 było 6 koszulek PRE-ORDER po £2800/2850, starsze koszulki SOLD OUT, a dostępna fotografia poza zakresem. Pre-order nie jest gotowym stanem magazynowym: podaj go osobno z rzeczywistym terminem z produktu, nie importuj jako natychmiast dostępnej oferty i nie odświeżaj wyprzedanych koszulek.

Na produkcie potwierdź **In Stock**, **Only N left**, aktywne **ADD TO CART**, SKU, cenę GBP, prezentację **Framed** albo **Deluxe Packaged**, **Signed by**, datę/miejsce sesji i dostawcę. Nie dodawaj do koszyka do samej kontroli stanu. Zachowuj SKU w ID, np. `icons:I5404D`. Rama Classic/Hero oraz pudełko Deluxe są wariantami produktu, nie dowodami unikalności fizycznej sztuki.

Obejrzyj główne zdjęcie podpisu; zapisuj `imageType=catalog`. COA, hologram, opis **100% Authentic** czy **TripleLock** nie pozwala samodzielnie przypisać `verified` konkretnemu egzemplarzowi. Dwa kontrolowane warianty Zidane France 2024 deklarują podpisanie 12.12.2022: zachowuj tę rozbieżność w notatce, nie poprawiaj jej własnym domysłem.

**Delivery** (`https://www.icons.com/delivery`) podaje wysyłkę worldwide z Christchurch w UK przez AM World; ceny zależą od kraju i zawartości koszyka, poza UK klient płaci import/podatki. Dostawa i import pozostają `null` bez rzeczywistej wyceny PL. Zapisz podstawę potwierdzenia dostawy; „almost all countries” nie jest indywidualną wyceną kraju.

## Zakres i przekazanie wyniku

Domyślni ulubieni właściciela: `zidane` = Zinedine Zidane, `ronaldo` = **Cristiano Ronaldo**, `nazario` = **Ronaldo Nazário / R9 / O Fenômeno**. Samo „Ronaldo” nie identyfikuje zawodnika. Zakres to karty **Topps/Panini** z odręcznym podpisem i podpisane koszulki; fotografie, plakaty, tabliczki, buty, piłki, boxy oraz niepodpisane karty są poza zakresem. Lista ulubionych nie oznacza zapisywania serwisowej listy życzeń ani zakładania konta.

Pracuj w repozytorium Autograph Hunter wskazanym przez koordynatora. Przed skanem przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json`, istniejące oferty i `site/data/example.json`. Nie zmieniaj gałęzi ani wspólnych plików podczas pracy równoległej. Używaj własnej karty badawczej, nie przejmuj kart innych agentów. Przy CAPTCHA, logowaniu lub odmowie dostępu zapisz konkretną blokadę; nie obchodź jej.

Każdą przyjętą ofertę otwórz aktualnie i **obejrzyj zdjęcie podpisu**. Zapisz `signatureEvidence={visibleSignature:true,imageUrl:"https://...",note:"dokładne miejsce podpisu"}`; dla sklepowego zdjęcia dodaj `imageType:"catalog"`. Słowo Auto, patch, grading karty i COA nie dowodzą widocznego podpisu ani jego autentyczności. Odrzuć nadruk, autopen, facsimile, reprint i signature style. `authenticity` domyślnie `unverified`; `verified` wymaga niezależnego dowodu podpisu z URL, notatką i datą. Nie przyznawaj `verified` na podstawie reputacji sklepu.

Raport pracownika: unikalny plik `work/research-YYYY-MM-DD-SOURCE.json` z `{schemaVersion:1,offers:[...]}` zgodny z przykładem repo. Oddzielnie przekaż zakres, obejrzane kategorie/strony, liczbę szczegółowo sprawdzonych ofert, odrzucone pozycje i blokady. Nie nadpisuj raportu innego źródła, nie uruchamiaj importera i nie publikuj — robi to koordynator. Zachowuj `firstSeen`, nie odświeżaj `lastSeen` nieobejrzanych rekordów i nie uznawaj braków w ograniczonym wyniku za sprzedaż. Koszt nieznany to `null`; `shipsToPL=null`, jeśli dostawy do Polski nie potwierdzono. Podaj cenę w walucie źródła, dostawę, znane opłaty i kraj wysyłki; nie wymyślaj zera.

Alert zgłoś koordynatorowi od razu wyłącznie dla aktywnego **Kup teraz** z widocznym podpisem, gdy cena+dostawa+znane opłaty po kursach używanych przez dashboard wynoszą **ściśle <800 PLN**. Nieznane koszty oznacz „od” i wymień braki. Aukcje z bieżącą stawką nigdy nie wywołują tego alertu. Koordynator deduplikuje zgłoszenia i tę samą fizyczną kartę między serwisami.
