---
name: autograph-hunter-vinted
description: Research Vinted Poland signed cards and football shirts for Autograph Hunter, preserving the three-player watchlist and accounting for Buyer Protection and country availability.
---

# Autograph Hunter — Vinted

## Wyszukiwanie i koszty

Wejście: [Vinted Polska](https://www.vinted.pl/). [Oficjalne wyjaśnienie wyszukiwania](https://www.vinted.pl/help/409-recommended-content-on-vinted?access_channel=hc_search) potwierdza filtry kategorii, marki i przedziału ceny oraz wpływ kraju kupującego na dostępność. Strona główna w odczycie tekstowym ma wyszukiwarkę bez stabilnej etykiety; nie zapisuj zmyślonego `getByLabel`, identyfikatorów kategorii ani parametrów prywatnego API.

1. W bieżącym interfejsie znajdź pasek wyszukiwania i wykonaj osobno `Zidane autograf`, `Cristiano Ronaldo autograf`, `Ronaldo Nazario autograf`. W razie potrzeby powtórz z pełnym nazwiskiem oraz `signed`, `signature`; karty szukaj z `Topps` i `Panini`, koszulki z `koszulka`/`jersey`.
2. Wybierz kategorię i markę tylko po odczycie aktualnych opcji. Nie zawężaj koszulek do Topps/Panini — ten warunek dotyczy kart. Nie zakładaj, że odzieżowa kategoria reprezentacji wyczerpuje wyniki pamiątek. Dla ceny/najnowszych użyj takiej opcji sortowania, jaka faktycznie jest dostępna w odczytanym UI; etykiet tych opcji nie potwierdzono podczas rozpoznania 21.11.
3. Otwórz konkretny przedmiot, galerię i opis. Odróżnij podpis markerem od nadruku numeru/nazwiska, printed signature, autopen i koszulki unsigned. Odrzuć karty innego wydawcy i zwykłe karty z nazwą zawodnika. Sprawdź identyfikację R9/CR7 na zdjęciu.
4. Zweryfikuj, że przedmiot nie jest sprzedany/rezerwowany i że konto/rynek kupującego umożliwia dostawę do Polski. Vinted może ograniczać dostępność według kraju; dostęp w przeglądarce nie jest dowodem możliwości zakupu w Polsce. Nie zmieniaj kraju konta, nie twórz kont i nie omijaj logowania.
5. Zapisz osobno cenę przedmiotu, **Ochronę Kupujących**, dostawę i znane dopłaty. Kwota „zawiera Ochronę Kupujących” może już zawierać opłatę — nie dodawaj jej drugi raz. Nie używaj zapamiętanego procentu/cennika zamiast faktycznej kwoty. Gdy suma dostępna jest dopiero po logowaniu lub rozpoczęciu zakupu, zachowaj brakujące koszty jako `null`; nie finalizuj transakcji.
6. Użyj `vinted:<numer przedmiotu>` z kanonicznego URL. Numer profilu, nazwa sprzedawcy i dane osobowe nie są potrzebne do raportu.

## Zapisane wyszukiwania a ulubieni projektu

Trzech ulubionych projektu opisano poniżej; nie usuwaj ich ani nie mieszaj z platformowymi polubieniami przedmiotów. [Vinted opisuje zapis wyszukiwania](https://www.vinted.pl/help/392/435-zapisz-swoje-wyszukiwania): po wejściu w pasek wskazuje ostatnie frazy i ikonę zapisu; licznik nowych pozycji resetuje się po otwarciu wyników, a nieużywane zapisy wygasają po 6 miesiącach. Ta wiedza nie jest upoważnieniem do samodzielnego włączania nowych powiadomień na koncie.

21.11.2026 odczytano stronę główną i oficjalną pomoc; nie sprawdzono konkretnego podpisanego przedmiotu ani dostępności wysyłki. Nie przedstawiaj tej procedury jako wykonanego skanu Vinted.

## Zakres, jakość i ulubieni

Stała lista obserwowanych: **Zinedine Zidane** (`player=zidane`), **Cristiano Ronaldo / CR7** (`player=ronaldo`) i **Ronaldo Luís Nazário / R9 / O Fenômeno** (`player=nazario`). Nie usuwaj żadnego z nich. Samo słowo Ronaldo wymaga rozpoznania zdjęcia i opisu. Dwie grupy na zawodnika: karty **Topps/Panini** oraz podpisane koszulki. Nie rozszerzaj na fotografie, piłki, buty, plakaty, tabliczki ani boxy z szansą trafienia autografu.

Przed rozpoczęciem przeczytaj projektowe `docs/agent-monitoring.md`, `site/data/excluded-offers.json` i format `site/data/example.json`. Odrzucaj nadruki/faksymile, reprinty, autopen/Machine signed, signature style, unsigned oraz patche/relic bez odręcznego podpisu. Tytuł Auto i samo COA lub grading nie wystarczają. Aktywną ofertę przyjmij dopiero po otwarciu szczegółów **i obejrzeniu rzeczywistego zdjęcia podpisu**; zapisz `signatureEvidence.visibleSignature=true`, publiczny `imageUrl` i własną notatkę opisującą miejsce podpisu. Osobno pozostaw `authenticity=unverified`, chyba że niezależnie sprawdzono dowód dotyczący podpisu (`evidenceUrl`, `evidenceNote`, `verifiedAt`). Nie opisuj fotografii katalogowej jako dostarczanej sztuki.

Odczytaj cenę w walucie źródła, rodzaj sprzedaży, dostępność, kraj wysyłki oraz możliwość i koszt dostawy **do Polski**, bez zakupu i kontaktowania się ze sprzedawcą. Nieznane koszty to `null`, nie 0. Suma niepełna jest kwotą „od”. Ogłoszenie z odbiorem osobistym nie potwierdza dostawy. Nie obchodź CAPTCHA, logowania ani blokad; zapisz konkretną przeszkodę. Kopia wyszukiwarki nie jest aktualnym potwierdzeniem ceny ani dostępności. Nie odświeżaj `lastSeen` niesprawdzonego rekordu i nie wyciągaj wniosku o sprzedaży z braku w ograniczonych wynikach.

## Wynik dla koordynatora i praca równoległa

Pracuj wyłącznie nad tym źródłem w własnej karcie i własnym raporcie. Nie przejmuj ani nie zamykaj kart innych agentów. Gdy wspólna przeglądarka jest zajęta sekretami/logowaniem, skorzystaj z osobnej karty badawczej lub opisz brak dostępu. Nie zmieniaj wspólnego `offers.json`, alertów, gałęzi ani GitHuba. Zwróć `schemaVersion: 1`, tablicę `offers` zgodną z aktualnym schematem projektu oraz oddzielne podsumowanie: źródło, czas, zapytania/kategorie, zakres/paginacja, sprawdzone szczegóły i zdjęcia, odrzucenia, blokady. Pusty raport przy blokadzie nie oznacza skanu z zerową liczbą ofert na rynku. Koordynator scala raporty i publikuje **sekwencyjnie**.

Alert poniżej 1000 PLN dotyczy wyłącznie dostępnego **Kup teraz**, z obejrzanym podpisem: cena + dostawa + znane opłaty, przeliczone kursami NBP z projektu. 1000 PLN nie kwalifikuje się. Aukcje zapisuj `saleType=auction`, z prawdziwym `endAt`; bieżąca stawka nigdy nie uruchamia alertu ani czerwonego wyróżnienia. Koordynator deduplikuje alerty i tę samą fizyczną kartę między serwisami; nie zapisuj samodzielnie „alert wysłany”.
