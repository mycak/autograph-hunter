---
name: autograph-hunter-catawiki
description: Search Catawiki auctions for Autograph Hunter favorite players, verify signed cards and shirts, auction timing and fees, and return an independent source report.
---

# Autograph Hunter — Catawiki

## Wyszukiwanie i selekcja

Wejście: [Catawiki](https://www.catawiki.com/en/). Potwierdzone publiczne kategorie: **Trading Cards** → `https://www.catawiki.com/en/c/725-trading-cards` oraz **Sports** → `https://www.catawiki.com/en/c/1097-sports`. W każdej szukaj wszystkich trzech zawodników; karty Topps/Panini i koszulki traktuj osobno. Wpisuj pełne nazwiska w bieżącej wyszukiwarce; jeżeli interfejs nie jest dostępny, wyszukaj publiczne szczegóły frazą `site:catawiki.com/en/l/ NAZWISKO autograph` lub `signed jersey`, po czym otwórz konkretny lot.

Oficjalna pomoc potwierdza sortowanie **Relevance**, **Time remaining**, **Newly added** i filtr lokalizacji sprzedawcy. Relevance nie oznacza najniższej ceny; Time remaining służy kontroli kończących się aukcji. Wybieraj opcje dopiero po odczycie ich obecnego stanu, nie zgaduj parametrów ani selektorów. Adresy `/en/s?q=...` dla wszystkich trzech zawodników były niedostępne w odczycie 21.11 — nie traktuj ich jako przetestowanego działającego skrótu.

1. Otwórz zapisane loty i sprawdź status: **Current bid**, **Reserve price met/not met**, koniec aukcji, możliwość składania ofert, aktualna lokalizacja dostawy. Nie myl **Estimate** z ceną, ceny minimalnej z gwarantowaną sprzedażą ani wyceny eksperta z autentycznością.
2. W szczegółach użyj **See all photos**, odczytaj **Description from the seller**; AI-assisted summary jest tylko streszczeniem. Obejrzyj podpis na karcie/koszulce i numerację egzemplarza. Dokument „Museum/COA” deklarowany przez sprzedawcę pozostaje niezweryfikowany bez niezależnej kontroli.
3. Zapisuj `catawiki:<numer lotu>` z adresu `/en/l/<numer>-...`, `saleType=auction`, bieżącą stawkę oraz rzeczywisty `endAt` w UTC. Ustal termin z aktualnej bezwzględnej daty i strefy; licznik ze starej kopii strony nie ustala nowej daty. Nie wpisuj ceny Buy now, jeśli nie ma osobnej realnej opcji zakupu z tą ceną.
4. Ustaw kraj dostawy **Poland** w istniejącym widocznym interfejsie i odczytaj wycenę. Lokalizacja Maroko wynikająca z sesji/urządzenia nie jest wyceną do Polski. Nie zakładaj, że lokalizacja profilu sprzedawcy jest miejscem wysyłki.
5. [Oficjalna pomoc o opłacie](https://www.catawiki.com/en/help/fees/how-does-the-buyer-protection-fee-work) podaje 9% finalnej stawki + 3 EUR, z VAT jeśli dotyczy. Sprawdź ją ponownie przy skanie; opłatę dla bieżącej stawki oznacz jako zmienną, nie końcową. Dostawa/import osobno, nieznane kwoty `null`. [Dostawa](https://www.catawiki.com/en/help/shipping-rates-and-responsibilities/who-pays-for-shipping) nie jest automatycznie darmowa.

## Obserwacje i ograniczenia

21.11 publiczne szczegóły CR7 `108517701` pokazywały 420 EUR i krótki licznik, sprzeczny z zapisanym końcem 20.11. Nie odświeżono tego lotu; nie ustalono nowego terminu z kopii. Zapisany lot Zidane `108581627` oraz trzy wyszukiwania były niedostępne. Brak przeglądarki badawczej uniemożliwił aktualną kontrolę zdjęć i dostawy. Nie oznacza to braku okazji ani zakończenia każdego lotu.

Podstawa opcji sortowania: [oficjalna pomoc](https://www.catawiki.com/en/help/tips-for-successful-buying/how-are-objects-ranked-and-sorted). Ulubieni w aplikacji to stała lista zawodników poniżej; nie włączaj samodzielnie platformowych alertów/powiadomień ani nie składaj ofert.

## Zakres, jakość i ulubieni

Stała lista obserwowanych: **Zinedine Zidane** (`player=zidane`), **Cristiano Ronaldo / CR7** (`player=ronaldo`) i **Ronaldo Luís Nazário / R9 / O Fenômeno** (`player=nazario`). Nie usuwaj żadnego z nich. Samo słowo Ronaldo wymaga rozpoznania zdjęcia i opisu. Dwie grupy na zawodnika: karty **Topps/Panini** oraz podpisane koszulki. Nie rozszerzaj na fotografie, piłki, buty, plakaty, tabliczki ani boxy z szansą trafienia autografu.

Przed rozpoczęciem przeczytaj projektowe `docs/agent-monitoring.md`, `site/data/excluded-offers.json` i format `site/data/example.json`. Odrzucaj nadruki/faksymile, reprinty, autopen/Machine signed, signature style, unsigned oraz patche/relic bez odręcznego podpisu. Tytuł Auto i samo COA lub grading nie wystarczają. Aktywną ofertę przyjmij dopiero po otwarciu szczegółów **i obejrzeniu rzeczywistego zdjęcia podpisu**; zapisz `signatureEvidence.visibleSignature=true`, publiczny `imageUrl` i własną notatkę opisującą miejsce podpisu. Osobno pozostaw `authenticity=unverified`, chyba że niezależnie sprawdzono dowód dotyczący podpisu (`evidenceUrl`, `evidenceNote`, `verifiedAt`). Nie opisuj fotografii katalogowej jako dostarczanej sztuki.

Odczytaj cenę w walucie źródła, rodzaj sprzedaży, dostępność, kraj wysyłki oraz możliwość i koszt dostawy **do Polski**, bez zakupu i kontaktowania się ze sprzedawcą. Nieznane koszty to `null`, nie 0. Suma niepełna jest kwotą „od”. Ogłoszenie z odbiorem osobistym nie potwierdza dostawy. Nie obchodź CAPTCHA, logowania ani blokad; zapisz konkretną przeszkodę. Kopia wyszukiwarki nie jest aktualnym potwierdzeniem ceny ani dostępności. Nie odświeżaj `lastSeen` niesprawdzonego rekordu i nie wyciągaj wniosku o sprzedaży z braku w ograniczonych wynikach.

## Wynik dla koordynatora i praca równoległa

Pracuj wyłącznie nad tym źródłem w własnej karcie i własnym raporcie. Nie przejmuj ani nie zamykaj kart innych agentów. Gdy wspólna przeglądarka jest zajęta sekretami/logowaniem, skorzystaj z osobnej karty badawczej lub opisz brak dostępu. Nie zmieniaj wspólnego `offers.json`, alertów, gałęzi ani GitHuba. Zwróć `schemaVersion: 1`, tablicę `offers` zgodną z aktualnym schematem projektu oraz oddzielne podsumowanie: źródło, czas, zapytania/kategorie, zakres/paginacja, sprawdzone szczegóły i zdjęcia, odrzucenia, blokady. Pusty raport przy blokadzie nie oznacza skanu z zerową liczbą ofert na rynku. Koordynator scala raporty i publikuje **sekwencyjnie**.

Alert poniżej 1000 PLN dotyczy wyłącznie dostępnego **Kup teraz**, z obejrzanym podpisem: cena + dostawa + znane opłaty, przeliczone kursami NBP z projektu. 1000 PLN nie kwalifikuje się. Aukcje zapisuj `saleType=auction`, z prawdziwym `endAt`; bieżąca stawka nigdy nie uruchamia alertu ani czerwonego wyróżnienia. Koordynator deduplikuje alerty i tę samą fizyczną kartę między serwisami; nie zapisuj samodzielnie „alert wysłany”.
