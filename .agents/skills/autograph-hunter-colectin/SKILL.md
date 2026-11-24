---
name: autograph-hunter-colectin
description: Search Colectin athlete pages and catalogue filters for Autograph Hunter signed Topps/Panini cards and shirts, verifying seller-applied Signed/Certified labels, offers-only pricing and Poland delivery.
---

# Colectin — procedura rynku

## Nawigacja sprawdzona 21.11.2026

Źródło: **Colectin**, `https://www.colectin.com/en/athletes`. Strona **Athletes** ma pole **Search for an athlete** i linki:

- `https://www.colectin.com/en/athletes/zinedine-zidane`
- `https://www.colectin.com/en/athletes/cristiano-ronaldo`

Nie znaleziono na tej liście osobnej strony R9; nie wymyślaj jego sluga. Globalne pole **Search** w nagłówku, wpisanie `Ronaldo Nazario` i Enter doprowadziło do `https://www.colectin.com/en/discover?q=Ronaldo%20Nazario`. Analogicznie wyszukuj pełne nazwiska i aliasy R9, sprawdzając tożsamość na zdjęciu. Licznik 93 athletes / 34 Zidane / 111 Cristiano z tej kontroli jest historyczny, nie bieżący wynik kolejnego skanu.

Profil Zidane’a miał osobne linki **Cards** (`/en/cards/zinedine-zidane`) oraz **Autographs** (`/en/autographs/zinedine-zidane`). Pierwsza grupa obejmuje zwykłe karty, druga także fotografie i koszulki. Nie używaj liczby „cards” jako liczby kart z autografem.

Katalog wyszukiwania ma przyciski **Sport**, **Category**, **Condition**, **Era**, **Price**, **Sale type**, **Features**, **Certificate**, a **Sort** oferuje **Best match**, **Recently added**, **Price ↑**, **Price ↓**. W **Features** wybrano **Signed**, co dało `trait=signed`; sortowanie Price ↑ daje `sort=price-asc`. W **Category** zaobserwowano opcje **Trading Cards**, **Jerseys**, **Balls**, **Autographs**, **Memorabilia** itd. Po każdej zmianie upewnij się, że etykieta filtra/URL faktycznie ją potwierdza: podczas kontroli wybór kategorii nie został od razu zastosowany i nie wolno było traktować wyników jako wyłącznie kart.

## Eliminowanie fałszywych trafień

**Signed** to deklaracja sprzedawcy, nie dowód. Filtr Signed dla R9 zwrócił m.in. ofertę zestawu 11 kart Topps Zidane/Cristiano za €45 oraz koszulki i piłkę **Offers only**. Nie przyjmuj ich jako podpisanych kart R9 na podstawie filtra albo tekstowego dopasowania.

Sprawdź Topps/Panini na konkretnej karcie, widoczny odręczny podpis, opis, awers/rewers, nazwisko oraz numerację. Odrzucaj custom cards, nadruki, autopen, zwykłe numerowane warianty i loty bez rozpoznanego autografu. **Certified** prowadzi do sekcji `#certificados` sprzedawcy; dokument i grading karty nie oznaczają zweryfikowanego autografu.

**Buy now** z jawną ceną może być ofertą fixed. **Make an offer** / **Offers only** bez ceny nie ma wyliczalnej kwoty Kup teraz: nie wpisuj 0 EUR, nie negocjuj i nie wysyłaj oferty. Nie zapisuj serwisowych **Add to Saved** — ulubionych aplikacji nie utożsamiaj z kontem marketplace.

Otwórz konkretny `/en/item/...`; potwierdź dostępność, kraj sprzedawcy, dostawę do Polski i opłatę ochrony kupującego z aktualnych warunków. Brak prowizji sprzedawcy nie oznacza braku opłat kupującego. Bez wyceny nie dopisuj darmowej dostawy. Gdy PL lub cena są niepotwierdzone, raportuj ograniczenie i nie wywołuj alertu.

## Zakres i przekazanie wyniku

Domyślni ulubieni właściciela: `zidane` = Zinedine Zidane, `ronaldo` = **Cristiano Ronaldo**, `nazario` = **Ronaldo Nazário / R9 / O Fenômeno**. Samo „Ronaldo” nie identyfikuje zawodnika. Zakres to karty **Topps/Panini** z odręcznym podpisem i podpisane koszulki; fotografie, plakaty, tabliczki, buty, piłki, boxy oraz niepodpisane karty są poza zakresem. Lista ulubionych nie oznacza zapisywania serwisowej listy życzeń ani zakładania konta.

Pracuj w repozytorium Autograph Hunter wskazanym przez koordynatora. Przed skanem przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json`, istniejące oferty i `site/data/example.json`. Nie zmieniaj gałęzi ani wspólnych plików podczas pracy równoległej. Używaj własnej karty badawczej, nie przejmuj kart innych agentów. Przy CAPTCHA, logowaniu lub odmowie dostępu zapisz konkretną blokadę; nie obchodź jej.

Każdą przyjętą ofertę otwórz aktualnie i **obejrzyj zdjęcie podpisu**. Zapisz `signatureEvidence={visibleSignature:true,imageUrl:"https://...",note:"dokładne miejsce podpisu"}`; dla sklepowego zdjęcia dodaj `imageType:"catalog"`. Słowo Auto, patch, grading karty i COA nie dowodzą widocznego podpisu ani jego autentyczności. Odrzuć nadruk, autopen, facsimile, reprint i signature style. `authenticity` domyślnie `unverified`; `verified` wymaga niezależnego dowodu podpisu z URL, notatką i datą. Nie przyznawaj `verified` na podstawie reputacji sklepu.

Raport pracownika: unikalny plik `work/research-YYYY-MM-DD-SOURCE.json` z `{schemaVersion:1,offers:[...]}` zgodny z przykładem repo. Oddzielnie przekaż zakres, obejrzane kategorie/strony, liczbę szczegółowo sprawdzonych ofert, odrzucone pozycje i blokady. Nie nadpisuj raportu innego źródła, nie uruchamiaj importera i nie publikuj — robi to koordynator. Zachowuj `firstSeen`, nie odświeżaj `lastSeen` nieobejrzanych rekordów i nie uznawaj braków w ograniczonym wyniku za sprzedaż. Koszt nieznany to `null`; `shipsToPL=null`, jeśli dostawy do Polski nie potwierdzono. Podaj cenę w walucie źródła, dostawę, znane opłaty i kraj wysyłki; nie wymyślaj zera.

Alert zgłoś koordynatorowi od razu wyłącznie dla aktywnego **Kup teraz** z widocznym podpisem, gdy cena+dostawa+znane opłaty po kursach używanych przez dashboard wynoszą **ściśle <1000 PLN**. Nieznane koszty oznacz „od” i wymień braki. Aukcje z bieżącą stawką nigdy nie wywołują tego alertu. Koordynator deduplikuje zgłoszenia i tę samą fizyczną kartę między serwisami.
