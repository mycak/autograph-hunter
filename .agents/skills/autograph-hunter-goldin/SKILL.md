---
name: autograph-hunter-goldin
description: Search Goldin current auction and Buy It Now catalogues for Autograph Hunter signed Topps/Panini cards and football shirts, separating sold lots, live bids, buyer charges and autograph evidence.
---

# Goldin — procedura rynku

## Potwierdzona nawigacja i wyszukiwanie

Źródło: **Goldin**, `https://goldin.co/`. Pole **Search** jest comboboxem. Wpisanie `Zinedine Zidane` i Enter otworzyło `https://goldin.co/buy/auction?search=Zinedine%20Zidane&page=1&sort=Featured`. Powtórz z `Cristiano Ronaldo` oraz `Ronaldo Nazario` / R9, nie z samym Ronaldo bez identyfikacji. Wyszukując karty dodaj Topps/Panini i autograph/signed tylko wtedy, gdy zakres zapytania jest zbyt szeroki; nigdy nie utożsamiaj Prizm/relic z podpisem.

21.11 katalog ujawnił sekcje **Auction / Private Sales**, filtry **Year**, **Price**, **Category**, **Item Type**, **Sub Category**, **Certification**, **show only**. Dla kart wybierz **Single Cards**; dla koszulek **Memorabilia** i sprawdź rodzaj na produkcie. Piłka nożna to **Soccer**, nie amerykańska Football. Liczby w nawiasach filtrów są dynamiczne, nie twórz selektorów z zapisanym na stałe licznikiem.

Menu sortowania ma **Lowest Price**, **Ending Soonest**, **Highest Price**, **Newest Listed** itd.; liczba na stronę 24/48/96/240. Potwierdź aktualny wybór i paginację. **Sold Items** zostaw wyłączone dla rynku bieżącego. Nagłówkowy **Past Sales** to archiwum. Globalny **Buy It Now** prowadził do `/buy?auction_type=Fixed_Price&sort=Highest_Bids`; wybierz go osobno dla cen stałych, ponownie zastosuj wyszukiwanie i odczytaj rzeczywiste filtry — nie przenoś stawki z zakładki Auction do fixed.

Po wyszukaniu Zidane’a widziano 2 wyniki: zbiór fotografii/magazynu Juventusu poza zakresem oraz kartę Panini Quad Signatures 1/1 ze stawką $1000. Nie zostały przyjęte bez szczegółowej kontroli zdjęć, terminu i dostawy. To przykład procedury, nie aktualny ranking ani zgłoszona okazja.

## Kontrola szczegółów i kosztów

Otwórz konkretny `/item/...` znaleziony w wynikach. Zachowaj stabilny identyfikator produktu, a nie `queryId` parametr analityczny. Odczytaj tytuł, awers/rewers i podpis właściwego piłkarza, numerację karty, certyfikat obejmujący autograf, status **Lot Sold / You can no longer bid** albo aktywne **Bid Now / Buy It Now**, aktualną kwotę i walutę. Nigdy nie klikaj Bid Now, kupna, oferty ani rejestracji w celu skanu.

Dla aukcji wpisz `saleType=auction` oraz bezwzględny `endAt` z aktualnej strony szczegółów. Licznik 7D/21D w podglądzie i stawka bieżąca nie są terminem absolutnym ani finalną ceną. Uwzględnij aktualną prowizję kupującego, wysyłkę, ubezpieczenie i import według konkretnej oferty/warunków; nie hardkoduj procentu z dawnego artykułu. Amerykańska stawka wysyłki nie jest kosztem do Polski. Niewiadome zostaw `null` i opisz je.

Karta z kilkoma podpisami może obejmować ulubionego, ale to jedna fizyczna oferta, nie kilka niezależnych okazji. PSA/BGS ocena stanu karty nie wystarcza do `verified`; potrzebny dowód obejmujący widoczny podpis. Sprzedane loty służą co najwyżej porównaniu historii, nigdy odświeżaniu aktywnego rankingu. Aukcje i Private Sales bez stałej ceny nie wywołują alertu <800 PLN.

## Zakres i przekazanie wyniku

Domyślni ulubieni właściciela: `zidane` = Zinedine Zidane, `ronaldo` = **Cristiano Ronaldo**, `nazario` = **Ronaldo Nazário / R9 / O Fenômeno**. Samo „Ronaldo” nie identyfikuje zawodnika. Zakres to karty **Topps/Panini** z odręcznym podpisem i podpisane koszulki; fotografie, plakaty, tabliczki, buty, piłki, boxy oraz niepodpisane karty są poza zakresem. Lista ulubionych nie oznacza zapisywania serwisowej listy życzeń ani zakładania konta.

Pracuj w repozytorium Autograph Hunter wskazanym przez koordynatora. Przed skanem przeczytaj `docs/agent-monitoring.md`, `site/data/excluded-offers.json`, istniejące oferty i `site/data/example.json`. Nie zmieniaj gałęzi ani wspólnych plików podczas pracy równoległej. Używaj własnej karty badawczej, nie przejmuj kart innych agentów. Przy CAPTCHA, logowaniu lub odmowie dostępu zapisz konkretną blokadę; nie obchodź jej.

Każdą przyjętą ofertę otwórz aktualnie i **obejrzyj zdjęcie podpisu**. Zapisz `signatureEvidence={visibleSignature:true,imageUrl:"https://...",note:"dokładne miejsce podpisu"}`; dla sklepowego zdjęcia dodaj `imageType:"catalog"`. Słowo Auto, patch, grading karty i COA nie dowodzą widocznego podpisu ani jego autentyczności. Odrzuć nadruk, autopen, facsimile, reprint i signature style. `authenticity` domyślnie `unverified`; `verified` wymaga niezależnego dowodu podpisu z URL, notatką i datą. Nie przyznawaj `verified` na podstawie reputacji sklepu.

Raport pracownika: unikalny plik `work/research-YYYY-MM-DD-SOURCE.json` z `{schemaVersion:1,offers:[...]}` zgodny z przykładem repo. Oddzielnie przekaż zakres, obejrzane kategorie/strony, liczbę szczegółowo sprawdzonych ofert, odrzucone pozycje i blokady. Nie nadpisuj raportu innego źródła, nie uruchamiaj importera i nie publikuj — robi to koordynator. Zachowuj `firstSeen`, nie odświeżaj `lastSeen` nieobejrzanych rekordów i nie uznawaj braków w ograniczonym wyniku za sprzedaż. Koszt nieznany to `null`; `shipsToPL=null`, jeśli dostawy do Polski nie potwierdzono. Podaj cenę w walucie źródła, dostawę, znane opłaty i kraj wysyłki; nie wymyślaj zera.

Alert zgłoś koordynatorowi od razu wyłącznie dla aktywnego **Kup teraz** z widocznym podpisem, gdy cena+dostawa+znane opłaty po kursach używanych przez dashboard wynoszą **ściśle <800 PLN**. Nieznane koszty oznacz „od” i wymień braki. Aukcje z bieżącą stawką nigdy nie wywołują tego alertu. Koordynator deduplikuje zgłoszenia i tę samą fizyczną kartę między serwisami.
