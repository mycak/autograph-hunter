---
name: autograph-hunter-olx
description: Search OLX Poland for signed football cards and shirts of the Autograph Hunter favorites, verifying exact listing photos and delivery rather than promoted search previews.
---

# Autograph Hunter — OLX

## Wyszukiwanie

Wejście: [OLX Polska](https://www.olx.pl/). Odczyt 21.11.2026 potwierdził pole **Znajdź coś dla siebie**, lokalizację **Cała Polska** i przycisk **Szukaj**. Nie wpisuj miasta użytkownika ani nie ograniczaj promienia, jeśli skan ma obejmować dostawę w całej Polsce.

1. Wyszukuj osobno `Zidane autograf`, `Cristiano Ronaldo autograf`, `Ronaldo Nazario autograf`; dla kart doprecyzuj `Topps`/`Panini`, dla koszulek `koszulka autograf`. Przy ubogich wynikach sprawdź pełne nazwisko bez dodatków, a identyfikację wykonaj w zdjęciu/opisie.
2. [Oficjalna pomoc](https://pomoc.olx.pl/olxplhelp/s/article/jak-og%C5%82oszenia-s%C4%85-pozycjonowane-i-sortowane-V17-olx) potwierdza **Najtańsze/Najdroższe** i sortowanie według niedawnej publikacji; użyj najpierw najtańszych, następnie najnowszych. Dokładne bieżące etykiety i filtry kategorii odczytaj w UI przed kliknięciem. Nie używaj niepotwierdzonych selektorów ani parametrów wyszukiwarki.
3. Zachowaj granicę właściwych wyników: OLX może dodawać rozszerzenia zapytania, synonimy i ogłoszenia wyróżnione. Promowany i organiczny wynik tej samej oferty to jeden rekord. Liczby ogłoszeń nie oznaczają liczby autografów.
4. Otwórz konkretną ofertę i całą galerię. Sprawdź ręczny podpis, markę karty i tożsamość zawodnika. „Autograf” w opisie repliki, podpis w projekcie koszulki i fotografia sportowca bez podpisanego przedmiotu nie kwalifikują się.
5. Ustal, czy oferta ma **Przesyłkę OLX** i realną możliwość zakupu na odległość. Cena „do negocjacji” pozostaje ceną wyświetloną, nie zakładaj uzyskanego rabatu. Nie korzystaj z **Zadzwoń**, nie wysyłaj wiadomości i nie uznawaj samego „skontaktuj się” za potwierdzony checkout. Odbiór osobisty nie potwierdza dostawy do PL.
6. Zapisz `olx:<identyfikator ogłoszenia>` z adresu/szczegółów, nie numer telefonu ani dane sprzedawcy. Koszt ochrony/przesyłki wpisz tylko po odczycie; jeżeli wymaga logowania lub zakupu, zachowaj `null` i konkretny brak.

## Stan rozpoznania

Potwierdzono stronę wejścia i oficjalne zasady sortowania oraz duplikatów promowanych wyników. Nie przeprowadzono pełnej bieżącej kontroli ofert OLX. Nie ma zweryfikowanej automatyzacji kliknięć ani aktualnych danych o liczbie autografów; traktuj wynik jako procedurę do wykonania, nie wykonany skan.

## Zakres, jakość i ulubieni

Stała lista obserwowanych: **Zinedine Zidane** (`player=zidane`), **Cristiano Ronaldo / CR7** (`player=ronaldo`) i **Ronaldo Luís Nazário / R9 / O Fenômeno** (`player=nazario`). Nie usuwaj żadnego z nich. Samo słowo Ronaldo wymaga rozpoznania zdjęcia i opisu. Dwie grupy na zawodnika: karty **Topps/Panini** oraz podpisane koszulki. Nie rozszerzaj na fotografie, piłki, buty, plakaty, tabliczki ani boxy z szansą trafienia autografu.

Przed rozpoczęciem przeczytaj projektowe `docs/agent-monitoring.md`, `site/data/excluded-offers.json` i format `site/data/example.json`. Odrzucaj nadruki/faksymile, reprinty, autopen/Machine signed, signature style, unsigned oraz patche/relic bez odręcznego podpisu. Tytuł Auto i samo COA lub grading nie wystarczają. Aktywną ofertę przyjmij dopiero po otwarciu szczegółów **i obejrzeniu rzeczywistego zdjęcia podpisu**; zapisz `signatureEvidence.visibleSignature=true`, publiczny `imageUrl` i własną notatkę opisującą miejsce podpisu. Osobno pozostaw `authenticity=unverified`, chyba że niezależnie sprawdzono dowód dotyczący podpisu (`evidenceUrl`, `evidenceNote`, `verifiedAt`). Nie opisuj fotografii katalogowej jako dostarczanej sztuki.

Odczytaj cenę w walucie źródła, rodzaj sprzedaży, dostępność, kraj wysyłki oraz możliwość i koszt dostawy **do Polski**, bez zakupu i kontaktowania się ze sprzedawcą. Nieznane koszty to `null`, nie 0. Suma niepełna jest kwotą „od”. Ogłoszenie z odbiorem osobistym nie potwierdza dostawy. Nie obchodź CAPTCHA, logowania ani blokad; zapisz konkretną przeszkodę. Kopia wyszukiwarki nie jest aktualnym potwierdzeniem ceny ani dostępności. Nie odświeżaj `lastSeen` niesprawdzonego rekordu i nie wyciągaj wniosku o sprzedaży z braku w ograniczonych wynikach.

## Wynik dla koordynatora i praca równoległa

Pracuj wyłącznie nad tym źródłem w własnej karcie i własnym raporcie. Nie przejmuj ani nie zamykaj kart innych agentów. Gdy wspólna przeglądarka jest zajęta sekretami/logowaniem, skorzystaj z osobnej karty badawczej lub opisz brak dostępu. Nie zmieniaj wspólnego `offers.json`, alertów, gałęzi ani GitHuba. Zwróć `schemaVersion: 1`, tablicę `offers` zgodną z aktualnym schematem projektu oraz oddzielne podsumowanie: źródło, czas, zapytania/kategorie, zakres/paginacja, sprawdzone szczegóły i zdjęcia, odrzucenia, blokady. Pusty raport przy blokadzie nie oznacza skanu z zerową liczbą ofert na rynku. Koordynator scala raporty i publikuje **sekwencyjnie**.

Alert poniżej 1000 PLN dotyczy wyłącznie dostępnego **Kup teraz**, z obejrzanym podpisem: cena + dostawa + znane opłaty, przeliczone kursami NBP z projektu. 1000 PLN nie kwalifikuje się. Aukcje zapisuj `saleType=auction`, z prawdziwym `endAt`; bieżąca stawka nigdy nie uruchamia alertu ani czerwonego wyróżnienia. Koordynator deduplikuje alerty i tę samą fizyczną kartę między serwisami; nie zapisuj samodzielnie „alert wysłany”.
