# eBay Production i powiadomienia o usuwaniu kont

Backend działa w osobnym projekcie Supabase `autograph-hunter`, organizacja `mycak's Org`, region `eu-west-1`, plan Free. Konto connectora: **Mycak gh**. Projekt: `vmjhgalrqbdasfjvvttz`.

Panel: https://supabase.com/dashboard/project/vmjhgalrqbdasfjvvttz

Endpoint produkcyjny: `https://vmjhgalrqbdasfjvvttz.supabase.co/functions/v1/ebay-account-deletion`.

## Konfiguracja

Źródło funkcji znajduje się w `supabase/functions/ebay-account-deletion/`. Skrypt `supabase/ebay-notifications.sql` dokumentuje schemat i uprawnienia; jest już zastosowany w projekcie, nie wykonuj go ponownie na istniejących tabelach.

Konfiguracja eBay jest przechowywana w szyfrowanym Vault pod nazwą `autograph_hunter_ebay_notifications`. RPC `ebay_notification_config()` udostępnia ją wyłącznie roli serwerowej `service_role`. Klucz serwerowy Supabase pochodzi z wbudowanego środowiska Edge Functions. Nie kopiuj tych sekretów do frontendu, repozytorium ani logów.

Lokalny `.env` jest ignorowany przez Git i ma uprawnienia 600. Zawiera klucze Production oraz `EBAY_NOTIFICATION_VERIFICATION_TOKEN` i `EBAY_NOTIFICATION_ENDPOINT`. Sam Python nie wczytuje `.env` automatycznie. Nie uruchamiaj importu wyników API bez kontroli zdjęć wymaganej w procedurze monitorowania.

Funkcja ma `verify_jwt=false`, ponieważ eBay nie wysyła JWT Supabase. Zamiast tego każdy POST musi mieć poprawny podpis ECDSA eBay. Klucze publiczne są pobierane wyłącznie z oficjalnego endpointu eBay i przechowywane w pamięci maksymalnie przez godzinę. GET odpowiada tylko na poprawnie przekazane `challenge_code`, zgodnie z protokołem weryfikacji własności endpointu.

## Zgłoszenie nie oznacza zakończonego usunięcia

Po poprawnej weryfikacji podpisu POST zapisuje minimalne dane zgłoszenia w prywatnej tabeli `public.ebay_deletion_requests`. Identyfikator powiadomienia zapewnia deduplikację; ponowna dostawa nie nadpisuje statusu obsłużonego zgłoszenia. EIAS token i pełny payload nie są zapisywane. Błąd bazy lub pobrania klucza daje 503, żeby eBay ponowił dostarczenie; niepoprawny podpis daje 412.

Tabela ma RLS i nie przyznaje dostępu `anon` ani `authenticated`. Brak polityk dostępu dla tych ról jest zamierzony. Odczyt i obsługa są dostępne przez panel administratora/connector lub rolę serwerową.

Powiadomienia zaczynają w stanie **pending** i wymagają rzeczywistej kontroli oraz usunięcia danych danego użytkownika, jeżeli są przechowywane. Ten odbiornik **nie usuwa samodzielnie danych z GitHuba ani historii repozytorium**. Obecny format ofert nie przechowuje identyfikatorów sprzedawców pozwalających bezpośrednio dopasować powiadomienie. Nie oznaczaj zgłoszenia jako completed bez sprawdzenia wszystkich miejsc przechowywania danych.

Migracje `supabase/deletion-workflow.sql` oraz `supabase/deletion-workflow-indexes.sql` zostały zastosowane 21.11.2026. Dodają atomowe przejęcie jednego zgłoszenia (`FOR UPDATE SKIP LOCKED`), 15-minutową dzierżawę, token próby, odzyskanie wygasłej pracy, stan **blocked**, prywatny rejestr zmian `ebay_deletion_audit` i indeksy kolejki oraz powiązanych zdarzeń. RLS i uprawnienia nadal wykluczają role frontendowe. Zakończenie sprawy wymaga wyniku `deleted` albo `no_stored_data`, skrótu SHA-256 prywatnego protokołu i jawnego potwierdzenia wszystkich kontroli. Wtedy baza usuwa `user_id`, `username` oraz token dzierżawy. Powtórna dostawa webhooka nie przywraca tych danych.

### Procedura operatora

1. Przez connector **Mycak gh** pobierz `select * from public.claim_ebay_deletion();`. Wynik zawiera dane osobowe: nie wypisuj go w czacie ani publicznym raporcie. Przejęcie nie oznacza zakończenia. Zachowaj token tylko na czas pracy.
2. Sprawdź aktualne i historyczne rekordy repozytorium, artefakty Actions, backend, lokalne raporty, cache oraz inne kopie. Zapisz eksport zgłoszeń wyłącznie poza repozytorium, z uprawnieniami 600. Pomocniczy skrypt poniżej sprawdza oferty i lokalną historię Git, odczytuje sprzedawców przez Browse API i tworzy prywatny plan. Nie zapisuje nazw sprzedawców w planie i nie zmienia zgłoszeń.

   ```sh
   python3 scripts/audit-ebay-deletions.py --cases /private/cases.json --scan-path /private/research --out /private/audit.json
   ```

   Plan jest wskazówką, nie certyfikatem usunięcia. Nieodczytana oferta, zmieniona nazwa użytkownika lub nieprzejrzana kopia blokuje wniosek o braku danych. Przed zakończeniem ustal wiarygodne mapowanie tożsamości; sam brak dopasowania bieżącej nazwy nie wystarcza. Obejmuje to także nieaktywne oferty i zdjęcia. API zwracające 404 nie dowodzi, że nigdy nie przechowywaliśmy danych.
3. Jeżeli potrzebne jest usunięcie, przygotuj konkretny zakres i wykonaj je we wszystkich sprawdzonych miejscach. Przepisanie publicznej historii Git wymaga osobnej, konkretnej oceny i zatwierdzenia; zwykłe skasowanie bieżącej oferty nie usuwa historii. Nie ogłaszaj pełnej realizacji, gdy pozostają kopie.
4. Po rzeczywistej realizacji policz SHA-256 protokołu, który nie jest publikowany. Wywołaj `finish_ebay_deletion(p_id,p_token,p_resolution,p_digest,p_checks)`. `p_checks` musi zawierać `identityMapping`, `repository`, `history`, `artifacts`, `localCaches`, `backend` ustawione na `true` oraz `unresolvedCount:0`. Nie zaznaczaj pól bez wykonania kontroli. Nie dodawaj danych osobowych do pól audytu.
5. Gdy nie można zakończyć, wywołaj `block_ebay_deletion(p_id,p_token,p_reason)`. Dozwolone kody: `identity_unresolved`, `storage_review_incomplete`, `erasure_required`, `provider_unavailable`. Zapisz prywatnie brakujący dowód i działanie potrzebne do odblokowania. Po jego uzyskaniu `retry_ebay_deletion(p_id)` ponownie ustawia pending. Nie resetuj blokad w pętli bez nowego dowodu. Usuń zbędny lokalny eksport tożsamości po pracy; baza zachowuje tożsamość otwartego zgłoszenia do realizacji.

Funkcje odmawiają zakończenia przy złym/wygasłym tokenie lub brakujących kontrolach. Ich uprawnienia ma wyłącznie rola serwerowa. Test integracyjny `supabase/tests/deletion-workflow.sql` sprawdza stany, błędny token, brak dowodów, wygaśnięcie, ponowienie, anon/authenticated i wyczyszczenie tożsamości; cała transakcja testowa kończy się rollbackiem.

Sprawdzanie kolejki bez wypisywania danych osobowych:

```sql
select status, count(*), min(received_at) as oldest
from public.ebay_deletion_requests group by status;
```

Szczegóły otwieraj wyłącznie w prywatnym panelu. Po faktycznej obsłudze usuń niepotrzebne identyfikatory zgodnie z obowiązującą procedurą i zachowaj wyłącznie niezbędny ślad realizacji; nie przenoś danych zgłoszenia do publicznych raportów skanu.

## Testy

`npm run check` obejmuje challenge, prawidłowy podpis ECDSA, odrzucanie podmienionego payloadu, brak podpisu, limit rozmiaru oraz awarię zapisu. Test z panelu eBay `Send Test Notification` sprawdza rzeczywistą zgodność środowiska Edge Functions z protokołem eBay. Po wdrożeniu sprawdź także poprawny hash challenge i odmowę niepodpisanego POST.

21 listopada 2026 panel eBay potwierdził **A test notification was sent successfully!**, a podpisane powiadomienie trafiło do bazy. Sprawdzono testową tożsamość i oznaczono ten rekord jako completed; późniejsza migracja usunęła jego identyfikatory. Po aktywacji zaczęły napływać rzeczywiste powiadomienia, obsługiwane powyższą procedurą. Weryfikacja używa przypiętej `@noble/curves@2.4.0`, ponieważ hosted Edge Runtime nie importuje natywnie klucza secp256k1 eBay. Zależności są zapisane w `package-lock.json` oraz `deno.lock`; frontend nie ładuje tej biblioteki.

Klucze Production zostały odblokowane 21 listopada 2026 po zapisaniu endpointu w panelu eBay. Testy OAuth i Browse API zwróciły HTTP 200. Sekrety są także zapisane w GitHub Actions. Workflow pobiera nieaktywnych kandydatów do artefaktu kontroli; publikacja wymaga osobnej kontroli zdjęć przez agenta.

Dokumentacja: [eBay Marketplace Account Deletion](https://developer.ebay.com/develop/guides/sell/marketplace-user-account-deletion), [eBay Notification SDK](https://github.com/eBay/event-notification-nodejs-sdk), [Supabase Vault](https://supabase.com/docs/guides/database/vault).
