---
name: autograph-hunter-comc
description: Research COMC soccer autographs of Zidane, Cristiano Ronaldo and Ronaldo Nazario; inspect physical card copies, costs and eBay duplicates.
---

# COMC — Autograph Hunter

## Wyszukiwanie COMC

Punkt wejścia: https://www.comc.com/ . Szukaj kolejno `Zinedine Zidane`, `Cristiano Ronaldo`, `Ronaldo Nazario`; dla R9 rozstrzygaj tożsamość fotografią, reprezentacją i opisem. Po odczytaniu aktualnego UI wybierz kategorię Soccer i filtr Autographed, jeśli są dostępne; zapisany research projektu z 19.11.2026 potwierdzał filtr Autographed, ale bieżącej etykiety i selektora nie potwierdzono. Nie zgaduj parametrów adresów ani selektorów. W wynikach odrzucaj marki Leaf/Futera i zwykłe karty Topps/Panini bez podpisu.

Otwórz kartę, a potem konkretną dostępną kopię i jej cenę. Strona serii może grupować wiele fizycznych egzemplarzy o różnych cenach; nie łącz zdjęcia jednej kopii z ceną innej. Zapisuj COMC Item/ID konkretnej kopii, numer seryjny i certyfikat, jeśli widoczne. Sortowanie wybierz po aktualnych kontrolkach ceny, bez gwarancji pełnego rynku.

Koszty wysyłki COMC, obsługi i importu do Polski wymagają osobnej wyceny; cena samej karty nie jest sumą. Przy niedostępnym koszcie zachowaj `null`. Zestaw fizyczny numer egzemplarza ze znanymi ofertami eBay sprzedawcy COMC; identyczna karta w dwóch kanałach to duplikat, a nie nowa okazja. COMC nie jest w tym zakresie źródłem koszulek.

21.11.2026 odczyt web strony głównej i zapisanego szczegółu zwrócił403, ale późniejsza bezpośrednia przeglądarka koordynatora załadowała szczegóły i zdjęcia normalnie. Nie traktuj błędu narzędzia tekstowego jako dowodu niedostępności całego serwisu. Korzystaj z dostępnej, autoryzowanej przeglądarki bez obchodzenia blokad; jeśli ona także jest niedostępna, zachowaj wcześniejsze `lastSeen` i zgłoś rzeczywistą przeszkodę.

Aktualnie potwierdzone przykłady: [Select SS-ZZ](https://www.comc.com/Cards/Soccer/2024-25/Panini_Select_FIFA_-_Select_Signatures/SS-ZZ/Zinedine_Zidane/29439214), Item332557022,281,36USD oraz [Prizm CL-ZZ](https://www.comc.com/Cards/Soccer/2025-26/Panini_Prizm_FIFA_-_Club_Legends_Signatures/CL-ZZ/Zinedine_Zidane/32637544), Item339873322,231,10USD. Obie pokazały Last item in stock i odręczny niebieski podpis na zdjęciu. To obserwacja z21.11, nie stała cena do kopiowania. Link Autographed na profilu Zidane był widoczny i prowadził do `/Players/Soccer/Zinedine_Zidane/c77650,_AUTO`; nie podstawiaj jego ID innemu piłkarzowi.

W stopce wybierz Shipping Rates (`/shipping.aspx`). W obserwowanym formularzu wybierz Country=POLAND i Get Rates. Pole Postal Code można było pozostawić puste dla tej wyceny kraju. Tabela pokazała Guest IMEX Global – No Tracking: wysyłka7,49USD i obsługa0USD, Delivered Duties Unpaid; droższe warianty miały osobne opłaty obsługi. Czytaj nagłówki tabeli i sumuj tylko opłaty wybranej metody. Polski import pozostaje null bez rzeczywistej wyceny. Bezpośrednie pobranie obrazów z img.comc.com zwróciło403, ale obrazy były widoczne na stronie w przeglądarce — można je obejrzeć tam. Nie omijaj blokad pobierania ani nie wnioskuj o podpisie z samego alt tekstu.

## Stała lista ulubionych i zakres

Obserwuj wszystkich trzech: `zidane` = Zinedine/Zinédine Zidane, `ronaldo` = Cristiano Ronaldo/CR7, `nazario` = Ronaldo Nazário/R9/O Fenômeno. Samo Ronaldo nie identyfikuje zawodnika. Nie zamieniaj CR7 z R9. Karty tylko Topps/Panini; koszulki tylko z widocznym odręcznym podpisem. Nie kupuj, nie licytuj, nie składaj ofert ani nie kontaktuj się ze sprzedawcami.

Przed skanem znajdź checkout `mycak/autograph-hunter` i przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json` oraz bieżący format `site/data/example.json`. Ustal zakres z koordynatorem. Przy współbieżności pracuj we własnej karcie i zapisuj wyłącznie własny raport; nie edytuj wspólnego JSON, historii, stanu alertów ani ustawień innych agentów.

## Kontrola pojedynczej oferty

Otwórz aktualny szczegół, odczytaj cenę w walucie źródła, stan sprzedaży, wariant, dostawę do Polski, miejsce wysyłki i znane opłaty. Wynik wyszukiwarki to trop, nie aktualne potwierdzenie. Nieznane koszty zapisuj `null`, nie 0; `shipsToPL=true` wyłącznie po potwierdzeniu. Brak w ograniczonych wynikach nie dowodzi sprzedaży.

Obejrzyj zdjęcie konkretnego przedmiotu. Aktywna oferta wymaga `signatureEvidence` z `visibleSignature=true`, publicznym `imageUrl` i notatką wskazującą dokładne miejsce atramentu. Patch, relic, słowo Auto, slab lub oznaczenie Signed nie zastępują oględzin. Odrzuć faksymile, nadruki, autopen, reprinty, boxy/breaki i podpis innej osoby. Autentyczność domyślnie `unverified`; `verified` wymaga niezależnej kontroli dowodu dotyczącego samego autografu, URL, notatki i daty. Grading karty ani opis COA/BAS/JSA nie wystarcza.

## Wynik dla koordynatora

Zapisz oddzielny raport `{"schemaVersion":1,"offers":[...]}` w katalogu `work` czatu. W rekordach używaj aktualnego formatu repozytorium, rzeczywistego `lastSeen` i `firstSeen` nowych ofert; importer koordynatora zachowa wcześniejsze `firstSeen` i historię. Oddzielny status źródła ma zawierać czas, URL-e i frazy, liczbę szczegółów sprawdzonych, zaakceptowanych ofert i odrzuceń oraz dokładną blokadę. Zero zaakceptowanych ofert przy zablokowanym źródle nie jest zerem ofert na rynku. Po blokadzie nie obchodź zabezpieczeń; nie odświeżaj nieobejrzanych rekordów.

Koordynator deduplikuje, importuje i publikuje. Zgłoś mu natychmiast ofertę Kup teraz ściśle poniżej 800 PLN według ceny + dostawy + znanych opłat i kursów strony, z rozbiciem kosztów i statusem autentyczności; przy brakach podaj kwotę „od”. Sam agent nie oznacza alertu jako wysłanego. Aukcje mają `saleType=auction` i rzeczywisty `endAt`; bieżąca stawka nie wywołuje alertu ani czerwonego wyróżnienia.
