---
name: autograph-hunter-ebay
description: Research eBay signed Topps/Panini cards and football shirts for Autograph Hunter favorites; return photo-reviewed source reports without publishing.
---

# eBay — Autograph Hunter

## Wyszukiwanie eBay

Punkt wejścia: https://www.ebay.pl/ . Dla każdego ulubionego wykonaj osobno wyszukiwanie kart: pełna nazwa + `Topps autograph`, następnie + `Panini autograph`; oraz koszulek: pełna nazwa + `signed jersey`. Dla R9 doprecyzuj `Ronaldo Nazario` lub `R9`, sprawdzając zdjęcie i opis, zamiast szerokiego Ronaldo. Frazy to plan zapytań; nie są selektorami UI.

Oficjalna pomoc potwierdza wyszukiwarkę, filtry formatu sprzedaży i Advanced obok wyszukiwarki. W bieżącym UI wybierz Buy It Now/Kup teraz i najniższą widoczną cenę z dostawą, jeśli taki wariant sortowania jest dostępny. Sprawdź docelowy kraj Polska na ogłoszeniu. Nie ograniczaj lokalizacji do US Only ani nie utożsamiaj kraju rejestracji sprzedawcy z miejscem wysyłki. Aukcje badaj oddzielnie.

Najpierw otwórz zapisane, najtańsze oferty, potem nowe wyniki. ID pojedynczego przedmiotu: `ebay:v1|NUMER_PRZEDMIOTU|0`. Trwale odrzucone: 800895835045 (patch bez podpisu), 800879047651 (nadruk), 297903325334 (maszyna). Jeśli używasz gotowego pobrania API, traktuj je jako kandydatów: tekst API nie potwierdza zdjęcia i sam nie pozwala publikować.

21.11.2026 odczyt web szczegółów 307164664440, 366758014709 i 307257474693 oraz listy nowych wyników był niedostępny; nie uznano ich za aktualnie sprawdzone. Przeglądarka badawcza IAB nie była dostępna dla tego agenta. Nie wpisuj tej historycznej blokady jako wyniku przyszłego skanu bez nowej próby.

Źródła procedury: [eBay search](https://www.ebay.com/help/Buying/Finding_Items_Managing_Purchases/Search_tips?id=4006), [Advanced search](https://www.ebay.com/help/buying/search-tips/advanced-search?id=4049).

## Produkcyjne API jako zbieranie kandydatów

Od 21.11.2026 produkcyjne Browse API działa. Korzystaj z zatwierdzonego pobrania koordynatora; dostęp i konfigurację opisuje osobny skill `autograph-hunter-access`. Skill źródła nie przechowuje kluczy ani nie zmienia poświadczeń. Zapytania na EBAY_DE powinny uwzględniać niemieckie aliasy: `(autograph,auto,signed,signature,autogramm)` dla kart Topps/Panini; dla koszulek również `signiert`, `trikot` i `jersey`. Nie wymagaj wyłącznie angielskiego signed. Lista najtańszych dziesięciu surowych wyników może składać się prawie wyłącznie z nadruków; po odrzuceniach kontynuuj zbieranie dalszych kandydatów zamiast ogłaszać brak autografów danego gracza.

Po wyszukaniu odczytaj `getItem` dla każdej badanej pozycji w kontekście dostawy PL: description/shortDescription, localizedAspects, estimatedAvailabilities, shipToLocations, shippingOptions, price/taxes, image i additionalImages. Czas kontroli rekordu zachowaj jako `lastSeen`; z surowego API nie publikuj miasta, kodu pocztowego ani identyfikatorów sprzedawcy. Sprawdź obraz w pełnym dostępnym rozmiarze; publiczny URL z aktualnego szczegółu można otworzyć lub pobrać i obejrzeć. Sam parametr Autographed=Yes jest niewystarczający.

Wyniki EBAY_DE bywają przeliczone na EUR. Jeśli kwota podaje `convertedFromValue` i `convertedFromCurrency`, przechowaj walutę oryginalną konsekwentnie dla ceny, dostawy i osobno podanego importCharges. Brak porównywalnej wyceny oznacza `null`, nie przelicznik odgadnięty z eBay. Nie dodawaj ponownie VAT oznaczonego `includedInPrice=true`; zachowaj osobne znane opłaty importowe i nie wymyślaj nieznanych podatków.

Pułapki potwierdzone przy przeglądzie zdjęć 21.11: Topps Legend Signature Style i GOAT stickers #735/#738 zawierają nadruk sygnatury; Panini Adrenalyn Euro2016 Signature#276 powiela biały wzór podpisu; Topps Star Signing opisuje transfer zawodnika (Signed31August2021), nie autograf na karcie. Karta R9 z tytułem PaniniMC okazała się na odwrocie Mundicromo/MCSport — odrzuć jako inną markę mimo widocznego pisma. Sprzeczność SignedByPelé przy tytule R9 albo MitAutogramm=Nein przy widocznym znaku wymaga wyjaśnienia, nie automatycznej publikacji.

## Stała lista ulubionych i zakres

Obserwuj wszystkich trzech: `zidane` = Zinedine/Zinédine Zidane, `ronaldo` = Cristiano Ronaldo/CR7, `nazario` = Ronaldo Nazário/R9/O Fenômeno. Samo Ronaldo nie identyfikuje zawodnika. Nie zamieniaj CR7 z R9. Karty tylko Topps/Panini; koszulki tylko z widocznym odręcznym podpisem. Nie kupuj, nie licytuj, nie składaj ofert ani nie kontaktuj się ze sprzedawcami.

Przed skanem znajdź checkout `mycak/autograph-hunter` i przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json` oraz bieżący format `site/data/example.json`. Ustal zakres z koordynatorem. Przy współbieżności pracuj we własnej karcie i zapisuj wyłącznie własny raport; nie edytuj wspólnego JSON, historii, stanu alertów ani ustawień innych agentów.

## Kontrola pojedynczej oferty

Otwórz aktualny szczegół, odczytaj cenę w walucie źródła, stan sprzedaży, wariant, dostawę do Polski, miejsce wysyłki i znane opłaty. Wynik wyszukiwarki to trop, nie aktualne potwierdzenie. Nieznane koszty zapisuj `null`, nie 0; `shipsToPL=true` wyłącznie po potwierdzeniu. Brak w ograniczonych wynikach nie dowodzi sprzedaży.

Obejrzyj zdjęcie konkretnego przedmiotu. Aktywna oferta wymaga `signatureEvidence` z `visibleSignature=true`, publicznym `imageUrl` i notatką wskazującą dokładne miejsce atramentu. Patch, relic, słowo Auto, slab lub oznaczenie Signed nie zastępują oględzin. Odrzuć faksymile, nadruki, autopen, reprinty, boxy/breaki i podpis innej osoby. Autentyczność domyślnie `unverified`; `verified` wymaga niezależnej kontroli dowodu dotyczącego samego autografu, URL, notatki i daty. Grading karty ani opis COA/BAS/JSA nie wystarcza.

## Wynik dla koordynatora

Zapisz oddzielny raport `{"schemaVersion":1,"offers":[...]}` w katalogu `work` czatu. W rekordach używaj aktualnego formatu repozytorium, rzeczywistego `lastSeen` i `firstSeen` nowych ofert; importer koordynatora zachowa wcześniejsze `firstSeen` i historię. Oddzielny status źródła ma zawierać czas, URL-e i frazy, liczbę szczegółów sprawdzonych, zaakceptowanych ofert i odrzuceń oraz dokładną blokadę. Zero zaakceptowanych ofert przy zablokowanym źródle nie jest zerem ofert na rynku. Po blokadzie nie obchodź zabezpieczeń; nie odświeżaj nieobejrzanych rekordów.

Koordynator deduplikuje, importuje i publikuje. Zgłoś mu natychmiast ofertę Kup teraz ściśle poniżej 800 PLN według ceny + dostawy + znanych opłat i kursów strony, z rozbiciem kosztów i statusem autentyczności; przy brakach podaj kwotę „od”. Sam agent nie oznacza alertu jako wysłanego. Aukcje mają `saleType=auction` i rzeczywisty `endAt`; bieżąca stawka nie wywołuje alertu ani czerwonego wyróżnienia.
