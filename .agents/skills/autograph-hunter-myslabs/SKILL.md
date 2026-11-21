---
name: autograph-hunter-myslabs
description: Research MySlabs signed Topps/Panini soccer cards while enforcing its shipping restrictions and separating slab grade from autograph authentication.
---

# MySlabs — Autograph Hunter

## Wyszukiwanie MySlabs

Wejdź na https://www.myslabs.com/ . Zaobserwowano główne pole Search, wybór kategorii po jego lewej stronie i Filters. Komunikat serwisu wyjaśnia, że kategorię należy wybrać przed filtrami specyficznymi dla sportu. Wybierz właściwą kategorię kart (slabbed/raw zgodnie z bieżącym UI), potem Soccer, jeśli dostępne, i szukaj pełnych nazw ulubionych z `Topps autograph` oraz `Panini autograph`. Nie używaj Sold Archive jako dostępnej oferty. Filters obejmują Price i Offer Status; dokładne sportowe opcje trzeba odczytać w aktualnym UI.

Otwórz szczegół karty i zdjęcia front/back/slab label. Karta graded PSA/BGS/SGC nie potwierdza automatycznie podpisu. Private Deal lub Make Offer nie jest publiczną ceną Kup teraz; nie składaj oferty. Aukcje oddziel od fixed price.

Istotna blokada dostawy, potwierdzona 21.11.2026: oficjalne guidelines mówią, że sprzedawcy nie wysyłają międzynarodowo, a zagraniczny kupujący potrzebuje adresu w USA. Nie ustawiaj `shipsToPL=true` na tej podstawie i nie zakładaj nieautoryzowanego pośrednika. Źródło może dostarczyć tropy lub oferty niekwalifikujące się do domyślnego rankingu PL, nie pozorne okazje z darmową dostawą do Polski. Aktualne guidelines wskazywały 1% buyer fee; ponownie sprawdź opłatę przed kalkulacją, bez dodawania opłat sprzedawcy do rachunku kupującego.

Źródła: [strona z wyszukiwaniem](https://www.myslabs.com/), [shipping i opłaty](https://myslabs.com/guidelines-terms-conditions/). Nie twórz konta ani nie wpisuj adresu zastępczego, żeby obejść ograniczenie.

## Stała lista ulubionych i zakres

Obserwuj wszystkich trzech: `zidane` = Zinedine/Zinédine Zidane, `ronaldo` = Cristiano Ronaldo/CR7, `nazario` = Ronaldo Nazário/R9/O Fenômeno. Samo Ronaldo nie identyfikuje zawodnika. Nie zamieniaj CR7 z R9. Karty tylko Topps/Panini; koszulki tylko z widocznym odręcznym podpisem. Nie kupuj, nie licytuj, nie składaj ofert ani nie kontaktuj się ze sprzedawcami.

Przed skanem znajdź checkout `mycak/autograph-hunter` i przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json` oraz bieżący format `site/data/example.json`. Ustal zakres z koordynatorem. Przy współbieżności pracuj we własnej karcie i zapisuj wyłącznie własny raport; nie edytuj wspólnego JSON, historii, stanu alertów ani ustawień innych agentów.

## Kontrola pojedynczej oferty

Otwórz aktualny szczegół, odczytaj cenę w walucie źródła, stan sprzedaży, wariant, dostawę do Polski, miejsce wysyłki i znane opłaty. Wynik wyszukiwarki to trop, nie aktualne potwierdzenie. Nieznane koszty zapisuj `null`, nie 0; `shipsToPL=true` wyłącznie po potwierdzeniu. Brak w ograniczonych wynikach nie dowodzi sprzedaży.

Obejrzyj zdjęcie konkretnego przedmiotu. Aktywna oferta wymaga `signatureEvidence` z `visibleSignature=true`, publicznym `imageUrl` i notatką wskazującą dokładne miejsce atramentu. Patch, relic, słowo Auto, slab lub oznaczenie Signed nie zastępują oględzin. Odrzuć faksymile, nadruki, autopen, reprinty, boxy/breaki i podpis innej osoby. Autentyczność domyślnie `unverified`; `verified` wymaga niezależnej kontroli dowodu dotyczącego samego autografu, URL, notatki i daty. Grading karty ani opis COA/BAS/JSA nie wystarcza.

## Wynik dla koordynatora

Zapisz oddzielny raport `{"schemaVersion":1,"offers":[...]}` w katalogu `work` czatu. W rekordach używaj aktualnego formatu repozytorium, rzeczywistego `lastSeen` i `firstSeen` nowych ofert; importer koordynatora zachowa wcześniejsze `firstSeen` i historię. Oddzielny status źródła ma zawierać czas, URL-e i frazy, liczbę szczegółów sprawdzonych, zaakceptowanych ofert i odrzuceń oraz dokładną blokadę. Zero zaakceptowanych ofert przy zablokowanym źródle nie jest zerem ofert na rynku. Po blokadzie nie obchodź zabezpieczeń; nie odświeżaj nieobejrzanych rekordów.

Koordynator deduplikuje, importuje i publikuje. Zgłoś mu natychmiast ofertę Kup teraz ściśle poniżej 800 PLN według ceny + dostawy + znanych opłat i kursów strony, z rozbiciem kosztów i statusem autentyczności; przy brakach podaj kwotę „od”. Sam agent nie oznacza alertu jako wysłanego. Aukcje mają `saleType=auction` i rzeczywisty `endAt`; bieżąca stawka nie wywołuje alertu ani czerwonego wyróżnienia.
