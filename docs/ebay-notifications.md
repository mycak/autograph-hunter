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

Powiadomienia mają status **pending** i wymagają rzeczywistej kontroli oraz usunięcia danych danego użytkownika, jeżeli są przechowywane. Ten odbiornik **nie usuwa samodzielnie danych z GitHuba ani historii repozytorium**. Obecny format ofert nie przechowuje identyfikatorów sprzedawców pozwalających automatycznie dopasować powiadomienie. Nie oznaczaj zgłoszenia jako completed bez sprawdzenia wszystkich miejsc przechowywania danych. Rozszerzenie importu o dane użytkowników wymaga także mapowania i procedury usuwania.

Sprawdzanie kolejki bez wypisywania danych osobowych:

```sql
select status, count(*), min(received_at) as oldest
from public.ebay_deletion_requests group by status;
```

Szczegóły otwieraj wyłącznie w prywatnym panelu. Po faktycznej obsłudze usuń niepotrzebne identyfikatory zgodnie z obowiązującą procedurą i zachowaj wyłącznie niezbędny ślad realizacji; nie przenoś danych zgłoszenia do publicznych raportów skanu.

## Testy

`npm run check` obejmuje challenge, prawidłowy podpis ECDSA, odrzucanie podmienionego payloadu, brak podpisu, limit rozmiaru oraz awarię zapisu. Test z panelu eBay `Send Test Notification` sprawdza rzeczywistą zgodność środowiska Edge Functions z protokołem eBay. Po wdrożeniu sprawdź także poprawny hash challenge i odmowę niepodpisanego POST.

21 listopada 2026 panel eBay potwierdził **A test notification was sent successfully!**, a podpisane powiadomienie trafiło do bazy. Sprawdzono testową tożsamość i oznaczono ten rekord jako completed; kolejka pending pozostała pusta. Weryfikacja używa przypiętej `@noble/curves@2.4.0`, ponieważ hosted Edge Runtime nie importuje natywnie klucza secp256k1 eBay. Zależności są zapisane w `package-lock.json` oraz `deno.lock`; frontend nie ładuje tej biblioteki.

Klucze Production zostały odblokowane 21 listopada 2026 po zapisaniu endpointu w panelu eBay. Testy OAuth i Browse API zwróciły HTTP 200. Sekrety są także zapisane w GitHub Actions. Workflow pobiera nieaktywnych kandydatów do artefaktu kontroli; publikacja wymaga osobnej kontroli zdjęć przez agenta.

Dokumentacja: [eBay Marketplace Account Deletion](https://developer.ebay.com/develop/guides/sell/marketplace-user-account-deletion), [eBay Notification SDK](https://github.com/eBay/event-notification-nodejs-sdk), [Supabase Vault](https://supabase.com/docs/guides/database/vault).
