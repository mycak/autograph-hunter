---
name: autograph-hunter-allegro
description: Research Allegro signed Topps/Panini cards and football shirts for the three Autograph Hunter favorites, separating product catalog groups from exact seller offers.
---

# Autograph Hunter — Allegro

## Wyszukiwanie w katalogu i konkretnych ofertach

Wejście: [Allegro](https://allegro.pl/). Dla każdego ulubionego wykonaj frazy `NAZWISKO Topps autograf`, `NAZWISKO Panini autograf` oraz `NAZWISKO koszulka autograf`; sprawdź także `auto` i `signed`, gdy jest to potrzebne do objęcia opisów obcojęzycznych. Pełne nazwisko Cristiano/Nazário jest obowiązkowe dla rozróżnienia Ronaldo. To frazy robocze, nie obietnica konkretnej liczby wyników.

1. Używaj bieżącej wyszukiwarki. [Oficjalna instrukcja](https://allegro.pl/pomoc/dla-kupujacych/wyszukiwanie-i-ulubione/jak-korzystac-z-wyszukiwarki-i-znalezc-kilka-produktow-u-tego-samego-sprzedajacego-mGwAg2jRrU7) potwierdza wykluczanie słów `-słowo`/`!słowo`; można zawęzić np. `-reprint`, ale nie usuwa to obowiązku czytania opisu. Nie kopiuj niewidzianych parametrów URL.
2. W filtrach wybierz **Kup teraz** i właściwą kategorię kart/kolekcji lub koszulek widoczną w aktualnym interfejsie. Nie wymyślaj identyfikatorów kategorii. Możesz wybrać metody dostawy i zakres ceny; [instrukcja filtrów](https://allegro.pl/pomoc/dla-kupujacych/wyszukiwanie-i-ulubione/filtrowanie-ofert-4GDdXb4DKTr) potwierdza te opcje. Nie zawężaj na starcie do niskiej ceny, bo ukryje to najtańszy realny autograf w drogiej grupie.
3. Z menu **Sortowanie** wybierz **ceny z dostawą: od najniższej**, następnie osobno sprawdź **najnowszych**. Oficjalne sortowanie dotyczy produktu/Top oferty, więc nie zakładaj, że pierwszy sponsorowany wynik to najtańszy podpisany egzemplarz.
4. Przy grupie produktu otwórz **porównaj X ofert** / **Inne oferty produktu**, a potem konkretnego sprzedawcę. Ten sam katalog może łączyć różne stany, warianty i autografy dodane ręcznie. Sprawdź zdjęcia oraz opis konkretnej oferty, a nie wyłącznie zdjęcie katalogowe produktu.
5. Odczytaj **Dostawa i płatność**, dostępność, ilość/wariant, cenę jednostkową, koszt wysyłki do Polski i znane opłaty. Smart nie jest bezwarunkową darmową dostawą. Jeśli sprzedawca oferuje kilka egzemplarzy, nie przypisuj jednego zdjęcia podpisu wszystkim wariantom.
6. Zapisz `allegro:<numer konkretnej oferty>` oraz kanoniczny adres oferty. Wynik z `allegrolokalnie.pl` przekaż agentowi Allegro Lokalnie; nie licz dwa razy tej samej oferty.

## Dowody procedury

21.11.2026 odczytano stronę główną i aktualną [oficjalną pomoc o sortowaniu](https://allegro.pl/pomoc/dla-kupujacych/wyszukiwanie-i-ulubione/sortowanie-produktow-jnbYnoArKSy). Nie wykonano pełnego bieżącego skanu ofert Allegro i nie potwierdzono selektorów DOM. Nazwy opcji pochodzą z pomocy, a nie z przetestowanej automatyzacji. Przy zmianie UI najpierw odczytaj jego aktualny stan.

## Zakres, jakość i ulubieni

Stała lista obserwowanych: **Zinedine Zidane** (`player=zidane`), **Cristiano Ronaldo / CR7** (`player=ronaldo`) i **Ronaldo Luís Nazário / R9 / O Fenômeno** (`player=nazario`). Nie usuwaj żadnego z nich. Samo słowo Ronaldo wymaga rozpoznania zdjęcia i opisu. Dwie grupy na zawodnika: karty **Topps/Panini** oraz podpisane koszulki. Nie rozszerzaj na fotografie, piłki, buty, plakaty, tabliczki ani boxy z szansą trafienia autografu.

Przed rozpoczęciem przeczytaj projektowe `docs/agent-monitoring.md`, `site/data/excluded-offers.json` i format `site/data/example.json`. Odrzucaj nadruki/faksymile, reprinty, autopen/Machine signed, signature style, unsigned oraz patche/relic bez odręcznego podpisu. Tytuł Auto i samo COA lub grading nie wystarczają. Aktywną ofertę przyjmij dopiero po otwarciu szczegółów **i obejrzeniu rzeczywistego zdjęcia podpisu**; zapisz `signatureEvidence.visibleSignature=true`, publiczny `imageUrl` i własną notatkę opisującą miejsce podpisu. Osobno pozostaw `authenticity=unverified`, chyba że niezależnie sprawdzono dowód dotyczący podpisu (`evidenceUrl`, `evidenceNote`, `verifiedAt`). Nie opisuj fotografii katalogowej jako dostarczanej sztuki.

Odczytaj cenę w walucie źródła, rodzaj sprzedaży, dostępność, kraj wysyłki oraz możliwość i koszt dostawy **do Polski**, bez zakupu i kontaktowania się ze sprzedawcą. Nieznane koszty to `null`, nie 0. Suma niepełna jest kwotą „od”. Ogłoszenie z odbiorem osobistym nie potwierdza dostawy. Nie obchodź CAPTCHA, logowania ani blokad; zapisz konkretną przeszkodę. Kopia wyszukiwarki nie jest aktualnym potwierdzeniem ceny ani dostępności. Nie odświeżaj `lastSeen` niesprawdzonego rekordu i nie wyciągaj wniosku o sprzedaży z braku w ograniczonych wynikach.

## Wynik dla koordynatora i praca równoległa

Pracuj wyłącznie nad tym źródłem w własnej karcie i własnym raporcie. Nie przejmuj ani nie zamykaj kart innych agentów. Gdy wspólna przeglądarka jest zajęta sekretami/logowaniem, skorzystaj z osobnej karty badawczej lub opisz brak dostępu. Nie zmieniaj wspólnego `offers.json`, alertów, gałęzi ani GitHuba. Zwróć `schemaVersion: 1`, tablicę `offers` zgodną z aktualnym schematem projektu oraz oddzielne podsumowanie: źródło, czas, zapytania/kategorie, zakres/paginacja, sprawdzone szczegóły i zdjęcia, odrzucenia, blokady. Pusty raport przy blokadzie nie oznacza skanu z zerową liczbą ofert na rynku. Koordynator scala raporty i publikuje **sekwencyjnie**.

Alert poniżej 800 PLN dotyczy wyłącznie dostępnego **Kup teraz**, z obejrzanym podpisem: cena + dostawa + znane opłaty, przeliczone kursami NBP z projektu. 800 PLN nie kwalifikuje się. Aukcje zapisuj `saleType=auction`, z prawdziwym `endAt`; bieżąca stawka nigdy nie uruchamia alertu ani czerwonego wyróżnienia. Koordynator deduplikuje alerty i tę samą fizyczną kartę między serwisami; nie zapisuj samodzielnie „alert wysłany”.
