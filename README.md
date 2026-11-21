# Autograph Hunter

Polski dashboard kolekcjonerski: sześć rankingów do 10 ofert autografów Zinedine’a Zidane’a, Cristiano Ronaldo i Ronaldo Nazário — karty Topps/Panini oraz koszulki.

## Uruchomienie

Wymagane: Node.js 22+ i Python 3.9+. Frontend nie wymaga frameworka ani płatnego OpenAI API. Testy backendu powiadomień eBay używają przypiętej biblioteki kryptograficznej.

```sh
npm ci
npm run dev
# http://127.0.0.1:4173
npm test
npm run refresh
```

## Działające funkcje

- Sześć niezależnych rankingów z limitem 10; nie uzupełniamy brakujących pozycji fikcyjnymi ofertami.
- Filtry autentyczności, miejsca wysyłki w UE, potwierdzonej dostawy do Polski, NEW, spadków cen, aukcji i wyszukiwanie po tytule.
- Domyślnie: wszystkie oceny autentyczności, kup teraz, dostawa do Polski. Automatycznie pobrane oferty eBay mają ocenę **niezweryfikowany** — etykieta pozostaje widoczna przy każdej ofercie.
- NEW przez 48 godzin od pierwszego wykrycia, nie od publikacji ogłoszenia.
- Cena przedmiotu + znana dostawa + znane opłaty, przeliczane według tabeli A NBP. Nieznany koszt ma wartość `null`, a suma etykietę „od”. Ceny z niepełnymi kosztami nie gwarantują najniższej ostatecznej kwoty zakupu.
- PRICE DROP na podstawie ostatnich dwóch pomiarów ceny w walucie oferty. Historia i wykres w oknie oferty; bez mieszania zmian kursowych ze zmianami ceny przedmiotu.
- Wykluczanie zakończonych, nieaktywnych i niepotwierdzonych od ponad 72 godzin ofert.
- Bezpieczny import/eksport JSON w przeglądarce. Import zastępuje lokalny zestaw ofert i nie zapisuje nic na GitHubie. Limit 5 MB / 5000 ofert; błędny import zachowuje wcześniejsze dane.
- Jawne statusy wszystkich źródeł. Data próby aktualizacji nie jest deklaracją udanego sprawdzenia wszystkich źródeł.

## Dane i integracje

Zawodnicy mają oddzielne identyfikatory: `zidane`, `ronaldo` (Cristiano) i `nazario` (R9). Każdy ma osobny ranking kart i koszulek. Nazário został dodany 19.11.2026; pierwszy research dostarczył 5 kart i 10 koszulek z eBay, All Star Signings i Icons.com, bez przenoszenia ofert Cristiano. Szczegóły i ograniczenia są w `latestNazarioScan` w raporcie skanu. Alerty poniżej 800 PLN obejmują także Nazário.

Baza zawiera pierwszy skan agentowy bez API. To **propozycje do weryfikacji**, nie gwarantowane oryginalne autografy. Przycisk „Pokaż znalezione propozycje” pozwala obejrzeć oferty niezweryfikowane po ręcznym zawężeniu filtra autentyczności. Procedura kolejnych skanów: [monitoring agentowy](docs/agent-monitoring.md).

`site/data/example.json` to **nieaktywna fikcyjna pozycja wyłącznie do dokumentacji formatu**; nie jest wczytywana do rankingu. Kopiując format, zastąp dane prawdziwą ofertą, ustaw aktualne daty i `active: true`.

### eBay — oficjalne Browse API

Od 21 listopada 2026 klucze Production są aktywne i zapisane jako sekrety GitHub Actions; rzeczywiste testy OAuth i Browse API zwróciły HTTP 200. Odbiornik wymaganych powiadomień o usuwaniu kont działa w osobnym projekcie Supabase. [Konfiguracja i obsługa zgłoszeń](docs/ebay-notifications.md). Lokalne sekrety są w ignorowanym `.env`, a konfiguracja odbiornika w szyfrowanym Vault.

Pobieranie przez GitHub Actions wymaga dodania sekretów w GitHub → Settings → Secrets and variables → Actions:

- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`

Klucze workflow są używane wyłącznie na serwerze GitHub Actions. Nigdy nie dodawaj ich do JSON, frontendu ani repozytorium. Kod uzyskuje application token przez OAuth client credentials i wyszukuje do 1000 wyników na kategorię na rynku EBAY_DE z filtrem dostawy do PL. To ograniczone wyszukiwanie, nie gwarancja przeszukania całego rynku. API zapisuje **nieaktywnych kandydatów** do artefaktu Actions `ebay-candidates-for-review` (3 dni retencji), nie podmienia opublikowanych cen ani `lastSeen`. Agent odczytuje aktualne szczegóły, dostawę i zdjęcia, a dopiero potem importuje sprawdzone oferty. Filtr dostawy API nie zastępuje kontroli `shipToLocations` w szczegółach. Walutę źródłową zachowujemy z `convertedFrom`, aby konwersja eBay nie tworzyła pozornych spadków cen. Wersja bez kluczy aktualizuje kursy i pokazuje „wymaga kluczy API”.

### Ulubieni i równoległe skanowanie

Trwała konfiguracja [watchlist.json](site/data/watchlist.json) zachowuje Zinedine’a Zidane’a, Cristiano Ronaldo i Ronaldo Nazário jako trzech ulubionych. Importy ofert nie nadpisują tej listy. Osobne rankingi i identyfikatory R9/CR7 pozostają rozdzielone.

W `.agents/skills/` są oddzielne procedury wyszukiwania dla wszystkich15 źródeł i koordynator `autograph-hunter-parallel-scan`. Kopie są zainstalowane w lokalnym katalogu skilli Codex. Każdy agent bada przydzielone źródło lub rozłączną grupę, zapisuje własny raport i nie dotyka wspólnych danych. Koordynator waliduje raporty poleceniem `python3 scripts/merge-agent-reports.py <raporty...> --out <combined.json>`, potem wykonuje jeden import i publikację. Duplikaty ID/URL zatrzymują scalanie bez nadpisania poprzedniego wyniku. Sześć obowiązkowych źródeł i codzienny harmonogram pozostają bez zmian; skille dziewięciu dodatkowych serwisów nie oznaczają ich automatycznej kontroli.

Nie utożsamiamy opisu „COA”, programu eBay Authenticity Guarantee ani gradingu karty z potwierdzeniem podpisu. Automatyczna integracja nie przyznaje etykiety „potwierdzony”. Do takiej oceny wymagane są `evidenceUrl`, `evidenceNote`, `verifiedAt` po rzeczywistej kontroli dokumentacji podpisu.

### Pozostałe platformy

Plan codziennego skanu agentowego o 08:00 czasu polskiego obejmuje eBay, **COMC, Catawiki, Allegro Lokalnie, All Star Signings i Icons.com**. Pierwsze kontrole wszystkich sześciu źródeł wykonano; szczegóły zakresu są w statusach źródeł i raporcie skanu. Filtr **Źródło** pokazuje również droższe oferty sklepu, które nie mieszczą się w ogólnym top 10. Aukcje Catawiki są oddzielone filtrem rodzaju sprzedaży i nie generują alertów Kup teraz poniżej 800 PLN.

Vinted, OLX, Allegro, Fanatics Collect, Colectin, MySlabs, Goldin, Whatnot i SportsMemorabilia nadal obsługują obecnie **wyłącznie import ręczny**. Nie ma tu ukrytego scrapingu ani obchodzenia blokad. Nie deklarujemy automatycznego skanowania tych serwisów.

### Trwała aktualizacja danych

Raport po rzeczywistym sprawdzeniu ofert przez agenta można scalić poleceniem `python3 scripts/import-agent.py /sciezka/raport.json`. Aktualizuje oferty i oddzielny status skanu agentowego; nie wymaga kluczy API. Nie uruchamia kolejnego skanu samodzielnie. GitHub Actions aktualizuje kursy/status API, a agent musi dostarczyć kolejne sprawdzone dane.

Zamiast lokalnego importu możesz dodać dokument JSON do `Actions → Refresh offers → Run workflow → offers_json`. Aktualizacja scala oferty po ID lub dokładnym URL i zachowuje pierwszą datę wykrycia oraz historię. Dotychczasowe pozycje nieobecne w ograniczonym wyszukiwaniu nie są automatycznie oznaczane jako sprzedane; po 72h bez kontroli wypadają z widoku.

Można też lokalnie wykonać:

```sh
python3 scripts/refresh.py --import-file /sciezka/do/ofert.json
node scripts/validate.mjs
```

Workflow `Refresh offers` jest zaplanowany codziennie na **06:10 UTC** (07:10 zimą / 08:10 latem w Polsce). GitHub może opóźnić zadania. Po ukończeniu workflow uruchamia się publikacja najnowszego snapshotu; również błąd źródła ma być widoczny na stronie. Oddzielne zadanie ChatGPT z poprzedniej rozmowy **nie jest połączone z repozytorium** i nie zostało tutaj zmodyfikowane.

## Hosting

`Publish dashboard` wysyła folder `site/` do GitHub Pages przez Actions; w ustawieniach Pages wybierz źródło **GitHub Actions**. Ścieżki są względne, więc projekt działa pod `/autograph-hunter/` i z dowolnego serwera statycznego.

GitHub Free udostępnia Pages dla repozytoriów publicznych; Pages dla prywatnego repozytorium wymaga planu obsługującego tę funkcję. Prywatność kodu nie oznacza prywatności strony Pages — strona jest domyślnie publiczna. Nie zmieniaj widoczności repozytorium bez decyzji właściciela.

Źródła techniczne: [GitHub Pages](https://docs.github.com/en/pages/quickstart), [eBay Browse API](https://developer.ebay.com/develop/api/buy/browse_api), [NBP API](https://api.nbp.pl/).

## Sprawdzenie jakości

`npm run check` weryfikuje składnię i testy logiki rankingu, importów, walut, kosztów, nowych ofert, historii, filtrowania, scalania i zachowania danych przy awarii API. Dodatkowo workflow waliduje JSON przed publikacją. Testy nie udają potwierdzonego dostępu do produkcyjnego eBay.
