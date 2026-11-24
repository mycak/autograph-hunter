---
name: autograph-hunter-allegro-lokalnie
description: Search and review Allegro Lokalnie signed Topps/Panini cards and football shirts for Autograph Hunter, returning an isolated source report for parallel agents.
---

# Autograph Hunter — Allegro Lokalnie

## Wyszukiwanie

Wejście: `https://allegrolokalnie.pl/`. Publiczny odczyt 21.11.2026 potwierdził pole **czego szukasz?**, lokalizację **cała Polska**, kontrolkę **Sortuj od**, filtry **Typ oferty → Kup teraz / Ogłoszenie / Licytacja** oraz rozróżnienie **z Allegro** i **z Allegro Lokalnie**. Nie zapisuj domniemanej etykiety opcji sortowania ani selektora CSS; rozwiń obecną kontrolkę i wybierz faktycznie widoczną opcję ceny rosnąco, potem osobno sprawdź najnowsze.

1. Otwórz zapisane oferty tego źródła, a następnie wykonaj osobne wyszukiwanie każdego zawodnika. Potwierdzone strony wyników: [Zidane](https://allegrolokalnie.pl/oferty/q/zinedine%20zidane), [Cristiano](https://allegrolokalnie.pl/oferty/q/cristiano%20ronaldo), [Nazário](https://allegrolokalnie.pl/oferty/q/ronaldo%20nazario). Ten schemat adresu jest obserwowany; frazy wstawiaj przez wyszukiwarkę lub kodowanie URL.
2. Zawężaj frazą `autograf`, a dla kart także `Topps`, `Panini`, `auto`, `signed`; dla koszulek `koszulka autograf`. Jeżeli zawężenie nie działa albo daje mało wyników, sprawdź też samą nazwę zawodnika. Zanotuj zakres każdej próby.
3. Wybierz **z Allegro Lokalnie**, aby nie mylić wyników przekierowujących na `allegro.pl` z tym źródłem. Wyniki z Allegro przekazuj jako kandydatów osobnemu agentowi Allegro. Najpierw **Kup teraz**; licytacje rozpatruj oddzielnie. **Ogłoszenie** bez widocznej możliwości zakupu i dostawy nie jest potwierdzonym Kup teraz.
4. Otwórz szczegóły. Sprawdź aktywność przycisku zakupu oraz komunikaty o zakończeniu/sprzedaży — tekstowy odczyt może pokazać etykietę przycisku bez jego stanu disabled. W galerii przejrzyj zdjęcia **Wstecz/Dalej** i powiększenie, a w opisie **Pokaż więcej**. Panel **Dostawa** pokazuje osobne metody i kwoty; wybierz realnie dostępną metodę do PL, nie domyślną darmową dostawę Smart.
5. Stabilny identyfikator znajduje się przy **Oferta:** (UUID); zapisuj `allegro-lokalnie:<UUID>` i kanoniczny URL bez parametrów śledzenia.

## Obserwacje i ograniczenia

21.11 odczytano trzy szerokie listy oraz zapisany CR7 Topps `9455d9ed-3a79-405d-b5d2-6d8e986a1245`. Wersja tekstowa pokazywała 400 PLN + 10,95 PLN i „Kup teraz”, ale pierwsza kopia była sprzed 6 dni, a projekt zapisał zakończenie 19.11. **Nie reaktywuj tej pozycji bez bieżącej kontroli w przeglądarce**. Przykład pokazuje, dlaczego sam indeks nie wystarcza. Podczas tej próby osobna przeglądarka badawcza nie była dostępna, więc nie potwierdzono nowych aktywnych pozycji.

Późniejsza kontrola koordynatora21.11 w bieżącej przeglądarce potwierdziła komunikat „Przedmiot został sprzedany lub Sprzedający zakończył publikację ogłoszenia” i disabled Kup teraz tej karty. Nie reaktywuj jej ani nie alarmuj o400PLN ze starej kopii. Formularz wyników miał dokładną opcję Sortuj od → najtańszych. Zapytania Zidane autograf, Cristiano Ronaldo autograf i Ronaldo Nazario autograf dały4/3/0wyników w tej próbie; sam ogólny opis sprzedawcy z hasłem autograf nie oznacza podpisu konkretnej karty. Obejrzana Panini Euro2008 Cristiano Ultra Card217 była bez podpisu mimo trafienia po tej frazie. Wyniki i stany należy sprawdzać od nowa przy kolejnych skanach.

## Zakres, jakość i ulubieni

Stała lista obserwowanych: **Zinedine Zidane** (`player=zidane`), **Cristiano Ronaldo / CR7** (`player=ronaldo`) i **Ronaldo Luís Nazário / R9 / O Fenômeno** (`player=nazario`). Nie usuwaj żadnego z nich. Samo słowo Ronaldo wymaga rozpoznania zdjęcia i opisu. Dwie grupy na zawodnika: karty **Topps/Panini** oraz podpisane koszulki. Nie rozszerzaj na fotografie, piłki, buty, plakaty, tabliczki ani boxy z szansą trafienia autografu.

Przed rozpoczęciem przeczytaj projektowe `docs/agent-monitoring.md`, `site/data/excluded-offers.json` i format `site/data/example.json`. Odrzucaj nadruki/faksymile, reprinty, autopen/Machine signed, signature style, unsigned oraz patche/relic bez odręcznego podpisu. Tytuł Auto i samo COA lub grading nie wystarczają. Aktywną ofertę przyjmij dopiero po otwarciu szczegółów **i obejrzeniu rzeczywistego zdjęcia podpisu**; zapisz `signatureEvidence.visibleSignature=true`, publiczny `imageUrl` i własną notatkę opisującą miejsce podpisu. Osobno pozostaw `authenticity=unverified`, chyba że niezależnie sprawdzono dowód dotyczący podpisu (`evidenceUrl`, `evidenceNote`, `verifiedAt`). Nie opisuj fotografii katalogowej jako dostarczanej sztuki.

Odczytaj cenę w walucie źródła, rodzaj sprzedaży, dostępność, kraj wysyłki oraz możliwość i koszt dostawy **do Polski**, bez zakupu i kontaktowania się ze sprzedawcą. Nieznane koszty to `null`, nie 0. Suma niepełna jest kwotą „od”. Ogłoszenie z odbiorem osobistym nie potwierdza dostawy. Nie obchodź CAPTCHA, logowania ani blokad; zapisz konkretną przeszkodę. Kopia wyszukiwarki nie jest aktualnym potwierdzeniem ceny ani dostępności. Nie odświeżaj `lastSeen` niesprawdzonego rekordu i nie wyciągaj wniosku o sprzedaży z braku w ograniczonych wynikach.

## Wynik dla koordynatora i praca równoległa

Pracuj wyłącznie nad tym źródłem w własnej karcie i własnym raporcie. Nie przejmuj ani nie zamykaj kart innych agentów. Gdy wspólna przeglądarka jest zajęta sekretami/logowaniem, skorzystaj z osobnej karty badawczej lub opisz brak dostępu. Nie zmieniaj wspólnego `offers.json`, alertów, gałęzi ani GitHuba. Zwróć `schemaVersion: 1`, tablicę `offers` zgodną z aktualnym schematem projektu oraz oddzielne podsumowanie: źródło, czas, zapytania/kategorie, zakres/paginacja, sprawdzone szczegóły i zdjęcia, odrzucenia, blokady. Pusty raport przy blokadzie nie oznacza skanu z zerową liczbą ofert na rynku. Koordynator scala raporty i publikuje **sekwencyjnie**.

Alert poniżej 1000 PLN dotyczy wyłącznie dostępnego **Kup teraz**, z obejrzanym podpisem: cena + dostawa + znane opłaty, przeliczone kursami NBP z projektu. 1000 PLN nie kwalifikuje się. Aukcje zapisuj `saleType=auction`, z prawdziwym `endAt`; bieżąca stawka nigdy nie uruchamia alertu ani czerwonego wyróżnienia. Koordynator deduplikuje alerty i tę samą fizyczną kartę między serwisami; nie zapisuj samodzielnie „alert wysłany”.
