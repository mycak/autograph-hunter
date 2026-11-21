---
name: autograph-hunter-whatnot
description: Research Whatnot fixed-price soccer cards of Autograph Hunter favorites, excluding breaks, auction bids and unconfirmed international routes.
---

# Whatnot — Autograph Hunter

## Wyszukiwanie Whatnot

Wejdź na https://www.whatnot.com/ . Publiczna strona główna może pokazać tylko zaproszenie do aplikacji. Na zaobserwowanej stronie sklepu sprzedawcy były Search Whatnot, zakładki Shop / Shows / Reviews / Clips, Search shop... i Sort By. Użyj głównego wyszukiwania do nazw ulubionych + `Topps autograph` lub `Panini autograph`; nazwy bieżących filtrów globalnych odczytaj na miejscu, nie zgaduj selektorów ani parametrów URL.

Po znalezieniu sprzedawcy otwórz jego Shop i wybierz Buy It Now, zgodnie z oficjalną instrukcją kupowania. Otwórz konkretny produkt. Pomijaj przerwy/breaki, miejsca drużyn, mystery packs, giveaway, Pre-Bid oraz towary zastrzeżone do nieaktywnego show. Cena startowa licytacji lub propozycja Make Offer nie jest ceną stałą. Niczego nie licytuj ani nie oferuj.

Zdjęcie produktu musi pokazywać podpis na tej karcie. Szerokie Ronaldo wymaga rozpoznania R9/CR7. Zapisz rzeczywistą walutę sprzedawcy. Oficjalna pomoc rozróżnia koszt dostawy marketplace i Shipping & Tax dla streamu; wycena i dostępność trasy zależą od kraju. Nie wpisuj adresu ani nie przechodź do zakupu tylko po wycenę bez upoważnienia. Dostawa PL nieznana oznacza `null`; nie przepisuj cen do Niemiec jako polskich.

Weryfikacja 21.11.2026: zaobserwowano sklep i powyższe kontrolki, ale jego kopia web była starsza; nie zaakceptowano z niej bieżących ofert. Pomoc wskazywała czasową blokadę Kanada → UE — sprawdź aktualny komunikat przed akceptacją kanadyjskiego sprzedawcy.

Źródła: [przykład układu Shop](https://www.whatnot.com/user/janbak55715/shop), [Buy It Now i Pre-Bid](https://help.whatnot.com/hc/en-us/articles/360061194792-How-to-buy-on-Whatnot), [trasy i koszty dostawy](https://help.whatnot.com/hc/en-us/articles/10626950552845-International-shipping-customs-and-imports).

## Stała lista ulubionych i zakres

Obserwuj wszystkich trzech: `zidane` = Zinedine/Zinédine Zidane, `ronaldo` = Cristiano Ronaldo/CR7, `nazario` = Ronaldo Nazário/R9/O Fenômeno. Samo Ronaldo nie identyfikuje zawodnika. Nie zamieniaj CR7 z R9. Karty tylko Topps/Panini; koszulki tylko z widocznym odręcznym podpisem. Nie kupuj, nie licytuj, nie składaj ofert ani nie kontaktuj się ze sprzedawcami.

Przed skanem znajdź checkout `mycak/autograph-hunter` i przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json` oraz bieżący format `site/data/example.json`. Ustal zakres z koordynatorem. Przy współbieżności pracuj we własnej karcie i zapisuj wyłącznie własny raport; nie edytuj wspólnego JSON, historii, stanu alertów ani ustawień innych agentów.

## Kontrola pojedynczej oferty

Otwórz aktualny szczegół, odczytaj cenę w walucie źródła, stan sprzedaży, wariant, dostawę do Polski, miejsce wysyłki i znane opłaty. Wynik wyszukiwarki to trop, nie aktualne potwierdzenie. Nieznane koszty zapisuj `null`, nie 0; `shipsToPL=true` wyłącznie po potwierdzeniu. Brak w ograniczonych wynikach nie dowodzi sprzedaży.

Obejrzyj zdjęcie konkretnego przedmiotu. Aktywna oferta wymaga `signatureEvidence` z `visibleSignature=true`, publicznym `imageUrl` i notatką wskazującą dokładne miejsce atramentu. Patch, relic, słowo Auto, slab lub oznaczenie Signed nie zastępują oględzin. Odrzuć faksymile, nadruki, autopen, reprinty, boxy/breaki i podpis innej osoby. Autentyczność domyślnie `unverified`; `verified` wymaga niezależnej kontroli dowodu dotyczącego samego autografu, URL, notatki i daty. Grading karty ani opis COA/BAS/JSA nie wystarcza.

## Wynik dla koordynatora

Zapisz oddzielny raport `{"schemaVersion":1,"offers":[...]}` w katalogu `work` czatu. W rekordach używaj aktualnego formatu repozytorium, rzeczywistego `lastSeen` i `firstSeen` nowych ofert; importer koordynatora zachowa wcześniejsze `firstSeen` i historię. Oddzielny status źródła ma zawierać czas, URL-e i frazy, liczbę szczegółów sprawdzonych, zaakceptowanych ofert i odrzuceń oraz dokładną blokadę. Zero zaakceptowanych ofert przy zablokowanym źródle nie jest zerem ofert na rynku. Po blokadzie nie obchodź zabezpieczeń; nie odświeżaj nieobejrzanych rekordów.

Koordynator deduplikuje, importuje i publikuje. Zgłoś mu natychmiast ofertę Kup teraz ściśle poniżej 800 PLN według ceny + dostawy + znanych opłat i kursów strony, z rozbiciem kosztów i statusem autentyczności; przy brakach podaj kwotę „od”. Sam agent nie oznacza alertu jako wysłanego. Aukcje mają `saleType=auction` i rzeczywisty `endAt`; bieżąca stawka nie wywołuje alertu ani czerwonego wyróżnienia.
