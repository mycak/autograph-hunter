# Okazje cenowe eBay na stronie głównej

Sekcja jest niezależna od sześciu rankingów Zidane’a, Cristiano i Nazário. Te rankingi zachowują dotychczasowe źródła, filtry oraz alerty poniżej 800 PLN. Rozszerzony radar obejmuje 28 nazw z `site/data/watchlist.json`; nowe okazje dotyczą wyłącznie eBay. Nie wyświetlamy osobnych pustych rankingów każdego piłkarza ani wszystkich tanich kandydatów.

## Dwa etapy

1. `scripts/refresh.py` wyszukuje aktualne oferty Kup teraz dla 28 piłkarzy. Dla trzech ulubionych pozostaje limit 1000 wyników na kategorię, dla pozostałych 200. Kandydaci są nieaktywni, trafiają tylko do prywatnego raportu/artefaktu Actions i nie zmieniają opublikowanych ofert ani ich dat kontroli. Pierwszy rozszerzony odczyt 21.11.2026 zebrał 2154 kandydatów; nie oznacza to 2154 sprawdzonych podpisów lub okazji.
2. Agent sprawdza konkretne egzemplarze oraz porównania. Ogląda podpisy, warianty, stan, ceny z VAT, dostawę PL, opłaty i dostępność. Raport zawiera `offers` według dotychczasowego kontraktu oraz `comparisons` według `site/opportunities.mjs`. Kontrola podpisu nie jest niezależnym potwierdzeniem jego autentyczności.

## Kryteria sekcji

- eBay, Kup teraz, aktywna i sprawdzona w ostatnich 72 godzinach oferta z widocznym podpisem i potwierdzoną dostawą do Polski.
- Minimum 3 **inne** egzemplarze od niezależnych sprzedawców, z ręcznie sprawdzoną zgodnością. Podobne tytuły nie wystarczają. Karty: rok, seria, numer karty, wariant, nakład, grading/stan i rodzaj podpisu. Koszulki: klub/sezon, rodzaj koszulki, sposób podpisania, certyfikacja i oprawa.
- Koszt przedmiotu + znana wysyłka PL + znane opłaty. Wysyłka musi być znana dla wszystkich. Jednakowy kraj nadania i zakres znanych opłat; nie zestawiaj ceny przed VAT z ceną po VAT. `feeQuote:{value,currency}` zachowuje pierwotną walutę opłat, gdy różni się od waluty przedmiotu; pole `fees` pozostaje zgodne z dotychczasowym kontraktem. `amount()` uwzględnia źródłową wycenę, więc zmiana kursu USD nie przelicza ponownie opłaty wyrażonej w PLN.
- Minimum **20% poniżej mediany** i **10% poniżej najtańszego porównania**. Drugi warunek chroni przed medianą zawyżoną przez kilka drogich ofert. Nie licz ocenianej oferty jako własnego porównania; usuń duplikaty fizycznego egzemplarza i warianty URL tego samego item ID.
- `basis:asking` oznacza medianę bieżących cen ofertowych, nie cen sprzedaży ani potwierdzoną wartość rynkową. `basis:sold` wymaga jawnego dowodu rzeczywistej transakcji i daty; sam zakończony listing lub zaakceptowane Best Offer bez ujawnionej ceny nie jest takim dowodem. Obecny Browse pipeline nie dostarcza automatycznie historii sprzedaży.
- Oferta i każde wykorzystane porównanie wygasają po 72 godzinach. Odświeżaj je wyłącznie po ponownej rzeczywistej kontroli. Brak 3 aktualnych zgodnych porównań automatycznie usuwa przedmiot z sekcji. Brak wyników jest prawidłowym stanem.

## Raport i publikacja

Każdy rekord `comparisons` zawiera `offerId`, `comparisonKey`, `matchDescription`, `reviewedAt`, `basis`, `independentSellers:true` i `comparables`. Każde porównanie zapisuje `id,url,price,currency,shipping,fees,sellerCountry,shipsToPL,active,saleType,checkedAt,imageUrl,matchNote` oraz opcjonalne źródłowe `feeQuote`. Potwierdzone sprzedaże wymagają `saleConfirmed:true,soldAt`. Nie zapisuj nazw użytkowników, danych kontaktowych ani sekretów w tym raporcie.

Przy researchu równoległym przydziel rozłączne grupy zawodników. Workerzy zapisują osobne raporty poza repozytorium i nie importują danych. Koordynator sprawdza niezależność sprzedawców, spójność opłat, numery egzemplarzy i zdjęcia, a następnie uruchamia:

```sh
node scripts/import-opportunities.mjs /absolute/path/report-a.json /absolute/path/report-b.json
```

Importer odrzuca niekwalifikujące się okazje i raporty zmieniające trzech ulubionych. Waliduje cały zestaw przed zapisem. Publikuj `offers.json` oraz `opportunity-comparisons.json` razem w jednym commicie przez connector Personal/mycak. `node scripts/validate.mjs` sprawdza także kontrakt porównań. `npm run check` obejmuje progi, koszty, świeżość, duplikaty i rozdzielenie 28 obserwowanych od trzech ulubionych.

Pierwszy zaakceptowany przykład: Ibrahimović Topps Chrome BLA-ZI Black Lazer Gold /50, raw Near Mint, 1663,57 PLN wobec mediany 2691,04 PLN z 3 innych ofert (38,18% mniej, 23,78% mniej od najtańszego porównania). Są to ceny i wyceny dostawy/VAT/importu z 21.11.2026; wymagają dalszych aktualizacji. Autentyczność pozostaje unverified. Inne sprawdzone serie odrzucono m.in. za nadrukowany podpis, różny wariant, różny stan albo niewystarczającą liczbę porównań.
