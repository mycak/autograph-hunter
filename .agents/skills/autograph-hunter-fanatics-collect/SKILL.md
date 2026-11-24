---
name: autograph-hunter-fanatics-collect
description: Research Fanatics Collect Buy Now and auctions for Autograph Hunter favorite players, keeping live prices separate from sold history and bids.
---

# Fanatics Collect — Autograph Hunter

## Wyszukiwanie Fanatics Collect

Wejdź na https://www.fanaticscollect.com/ i wybierz Marketplace → Buy Now. Zaobserwowany adres: https://www.fanaticscollect.com/marketplace?type=FIXED . Aukcje tygodniowe są osobno: https://www.fanaticscollect.com/marketplace?type=WEEKLY . Nie bierz cen z Sold items ani Premier Auction do rankingu Kup teraz.

Na stronie marketplace zaobserwowano Search, Sort, Filters, pola zakresu Year, Grade i Price oraz przełączniki Buy Now / Auction / Premier Auction. Aktualny odczyt web pokazuje szkielet filtrów bez kart wyników; do właściwego zapytania i kontroli szczegółów potrzebny jest działający interaktywny widok. Nie raportuj pustego szkieletu jako zerowego rynku.

W Search wpisuj pełną nazwę ulubionego + `Topps autograph`, potem `Panini autograph`; wybierz Soccer, jeśli bieżące Filters to umożliwiają, i najniższą widoczną cenę. Zachowaj rozdzielenie Ronaldo Nazário od Cristiano. Grade dotyczy stanu karty, nie automatycznie autentyczności autografu.

Otwórz konkretny lot, odczytaj oznaczenie sprzedaży, cenę, status dostępności i wszystkie fotografie. Oddziel prowizję kupującego, dostawę/wypłatę z vault i import; nie wpisuj stawek opłat z pamięci. Jeśli cena/dostawa jest widoczna dopiero po logowaniu, zgłoś tę granicę i niczego nie kupuj. Koszulek nie przypisuj do kategorii card; podejmij kontrolę memorabilia tylko gdy źródło rzeczywiście ma taki produkt.

Obserwacja procedury: 21.11.2026; [strona marketplace](https://www.fanaticscollect.com/marketplace?type=FIXED). Centrum pomocy nie odpowiedziało w tej próbie, więc opłat nie uznano za zweryfikowane.

## Stała lista ulubionych i zakres

Obserwuj wszystkich trzech: `zidane` = Zinedine/Zinédine Zidane, `ronaldo` = Cristiano Ronaldo/CR7, `nazario` = Ronaldo Nazário/R9/O Fenômeno. Samo Ronaldo nie identyfikuje zawodnika. Nie zamieniaj CR7 z R9. Karty tylko Topps/Panini; koszulki tylko z widocznym odręcznym podpisem. Nie kupuj, nie licytuj, nie składaj ofert ani nie kontaktuj się ze sprzedawcami.

Przed skanem znajdź checkout `mycak/autograph-hunter` i przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json` oraz bieżący format `site/data/example.json`. Ustal zakres z koordynatorem. Przy współbieżności pracuj we własnej karcie i zapisuj wyłącznie własny raport; nie edytuj wspólnego JSON, historii, stanu alertów ani ustawień innych agentów.

## Kontrola pojedynczej oferty

Otwórz aktualny szczegół, odczytaj cenę w walucie źródła, stan sprzedaży, wariant, dostawę do Polski, miejsce wysyłki i znane opłaty. Wynik wyszukiwarki to trop, nie aktualne potwierdzenie. Nieznane koszty zapisuj `null`, nie 0; `shipsToPL=true` wyłącznie po potwierdzeniu. Brak w ograniczonych wynikach nie dowodzi sprzedaży.

Obejrzyj zdjęcie konkretnego przedmiotu. Aktywna oferta wymaga `signatureEvidence` z `visibleSignature=true`, publicznym `imageUrl` i notatką wskazującą dokładne miejsce atramentu. Patch, relic, słowo Auto, slab lub oznaczenie Signed nie zastępują oględzin. Odrzuć faksymile, nadruki, autopen, reprinty, boxy/breaki i podpis innej osoby. Autentyczność domyślnie `unverified`; `verified` wymaga niezależnej kontroli dowodu dotyczącego samego autografu, URL, notatki i daty. Grading karty ani opis COA/BAS/JSA nie wystarcza.

## Wynik dla koordynatora

Zapisz oddzielny raport `{"schemaVersion":1,"offers":[...]}` w katalogu `work` czatu. W rekordach używaj aktualnego formatu repozytorium, rzeczywistego `lastSeen` i `firstSeen` nowych ofert; importer koordynatora zachowa wcześniejsze `firstSeen` i historię. Oddzielny status źródła ma zawierać czas, URL-e i frazy, liczbę szczegółów sprawdzonych, zaakceptowanych ofert i odrzuceń oraz dokładną blokadę. Zero zaakceptowanych ofert przy zablokowanym źródle nie jest zerem ofert na rynku. Po blokadzie nie obchodź zabezpieczeń; nie odświeżaj nieobejrzanych rekordów.

Koordynator deduplikuje, importuje i publikuje. Zgłoś mu natychmiast ofertę Kup teraz ściśle poniżej 1000 PLN według ceny + dostawy + znanych opłat i kursów strony, z rozbiciem kosztów i statusem autentyczności; przy brakach podaj kwotę „od”. Sam agent nie oznacza alertu jako wysłanego. Aukcje mają `saleType=auction` i rzeczywisty `endAt`; bieżąca stawka nie wywołuje alertu ani czerwonego wyróżnienia.
