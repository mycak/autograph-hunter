# Autograph Hunter

Polski dashboard kolekcjonerski: cztery rankingi do 10 ofert autografów Zinedine’a Zidane’a i Cristiano Ronaldo — karty Topps/Panini oraz koszulki.

## Uruchomienie

Wymagane: Node.js 22+ i Python 3.9+. Brak zależności do instalacji, płatnej bazy i OpenAI API.

```sh
npm run dev
# http://127.0.0.1:4173
npm test
npm run refresh
```

## Działające funkcje

- Cztery niezależne rankingi z limitem 10; nie uzupełniamy brakujących pozycji fikcyjnymi ofertami.
- Filtry autentyczności, kraju sprzedawcy w UE, potwierdzonej dostawy do Polski, NEW, spadków cen, aukcji i wyszukiwanie po tytule.
- Domyślnie: potwierdzone autografy, kup teraz, dostawa do Polski. Automatycznie pobrane oferty eBay mają ocenę **niezweryfikowany** — wybierz odpowiedni filtr, żeby je obejrzeć.
- NEW przez 48 godzin od pierwszego wykrycia, nie od publikacji ogłoszenia.
- Cena przedmiotu + znana dostawa + znane opłaty, przeliczane według tabeli A NBP. Nieznany koszt ma wartość `null`, a suma etykietę „od”. Ceny z niepełnymi kosztami nie gwarantują najniższej ostatecznej kwoty zakupu.
- PRICE DROP na podstawie ostatnich dwóch pomiarów ceny w walucie oferty. Historia i wykres w oknie oferty; bez mieszania zmian kursowych ze zmianami ceny przedmiotu.
- Wykluczanie zakończonych, nieaktywnych i niepotwierdzonych od ponad 72 godzin ofert.
- Bezpieczny import/eksport JSON w przeglądarce. Import zastępuje lokalny zestaw ofert i nie zapisuje nic na GitHubie. Limit 5 MB / 5000 ofert; błędny import zachowuje wcześniejsze dane.
- Jawne statusy wszystkich źródeł. Data próby aktualizacji nie jest deklaracją udanego sprawdzenia wszystkich źródeł.

## Dane i integracje

Startowa baza jest pusta. `site/data/example.json` to **nieaktywna fikcyjna pozycja wyłącznie do dokumentacji formatu**; nie jest wczytywana do rankingu. Kopiując format, zastąp dane prawdziwą ofertą, ustaw aktualne daty i `active: true`.

### eBay — oficjalne Browse API

Kod integracji jest gotowy, ale pobieranie wymaga kluczy produkcyjnych i odpowiedniego dostępu do Browse API w programie deweloperskim eBay. Dodaj w GitHub → Settings → Secrets and variables → Actions:

- `EBAY_CLIENT_ID`
- `EBAY_CLIENT_SECRET`

Klucze są używane wyłącznie na serwerze GitHub Actions. Nigdy nie dodawaj ich do JSON, frontendu ani repozytorium. Kod uzyskuje application token przez OAuth client credentials i wyszukuje do 1000 wyników na kategorię na rynku EBAY_DE z filtrem dostawy do PL. To ranking w obrębie pobranych wyników, nie gwarancja przeszukania całego rynku. Wersja bez kluczy aktualizuje kursy i pokazuje „wymaga kluczy API”. Integrację przetestowano na danych testowych; bez kluczy nie można wykonać testu produkcyjnego eBay.

Nie utożsamiamy opisu „COA”, programu eBay Authenticity Guarantee ani gradingu karty z potwierdzeniem podpisu. Automatyczna integracja nie przyznaje etykiety „potwierdzony”. Do takiej oceny wymagane są `evidenceUrl`, `evidenceNote`, `verifiedAt` po rzeczywistej kontroli dokumentacji podpisu.

### Pozostałe platformy

Vinted, OLX, Allegro, Catawiki, COMC, Fanatics Collect, Icons.com, Colectin, MySlabs, Goldin, Whatnot i SportsMemorabilia obsługują obecnie **wyłącznie import ręczny**. Nie ma tu ukrytego scrapingu ani obchodzenia blokad. Odczyt Icons.com podczas przygotowania integracji zwrócił 403. Nie deklarujemy automatycznego skanowania tych serwisów.

### Trwała aktualizacja danych

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
