# Zatwierdzony zakres

Odtworzony z rozmowy „Wyszukiwanie autografów Zidane’a” udostępnionej przez właściciela 17 listopada 2026.

Ciemny kolekcjonerski dashboard. Zidane i Cristiano Ronaldo, osobno karty Topps/Panini i koszulki. Do 10 aktywnych ofert w każdej grupie, sortowanie od najtańszej znanej kwoty. Dowody autentyczności, PL/UE, historia cen, NEW 48h i PRICE DROP. Import JSON. Bez fikcyjnych ofert w bazie.

Wybrana w rozmowie uproszczona architektura: statyczny frontend, pliki JSON i GitHub Actions, bez Supabase, Vercel i OpenAI API. Repozytorium prywatne `mycak/autograph-hunter` zgodnie z późniejszą decyzją właściciela. Hosting GitHub Pages zależy od planu konta.

Alerty cenowe i lista obserwowanych ofert nie zostały wybrane do tej wersji. Automatyczna analiza zdjęć i certyfikatów nie jest częścią darmowej wersji. Istniejące zadanie ChatGPT jest niezależne; nie utworzono duplikatu.

Źródła niedostępne automatycznie są oznaczone jako wymagające importu, a nie „sprawdzone”. Integracja eBay wymaga produkcyjnych kluczy aplikacji. Awaria źródła zachowuje wcześniejsze oferty i ich daty ostatniej kontroli; nie odświeża fikcyjnie ich ważności.
