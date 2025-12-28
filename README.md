# Bibliopolium

Chrome extension that helps check availability in the MBP Opole catalog, review book details, and place orders directly from Lubimyczytac.pl book pages.

## Features

- Adds a "Zarezerwuj" button on Lubimyczytac.pl book pages.
- Searches MBP by ISBN and shows availability.
- Displays MBP-sourced book details in the confirmation modal.
- Lets you place an order; if not logged in, you can log in inside the modal.
- Provides a quick link to reserved items in the MBP account.

## Install (Chrome)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.

## How it works

- **Content script** (`content.js`) runs on Lubimyczytac.pl book pages.
- It extracts ISBN, queries MBP, and renders the reservation UI.
- **Background service worker** (`background.js`) performs cross-origin requests to MBP.
- **Popup** (`popup.html` + `popup.js`) provides a manual login form.

## Structure

- `manifest.json` - Extension manifest (MV3).
- `content.js` - UI injection, MBP search, reservation flow.
- `background.js` - Network requests to MBP.
- `popup.html` / `popup.css` / `popup.js` - Extension popup login UI.

## Notes

- The extension relies on MBP’s public OPAC endpoints.
- Availability and reservation flows may change if the MBP site changes.

---

# Bibliopolium (PL)

Rozszerzenie Chrome, ktore pomaga sprawdzac dostepnosc w katalogu MBP Opole, podgladac szczegoly ksiazek i skladac zamowienia bezposrednio z kart ksiazek na Lubimyczytac.pl.

## Funkcje

- Dodaje przycisk "Zarezerwuj" na stronach ksiazek w Lubimyczytac.pl.
- Wyszukuje w MBP po ISBN i pokazuje dostepnosc.
- Wyswietla szczegoly ksiazki z MBP w oknie potwierdzenia.
- Pozwala zlozyc zamowienie; gdy nie jestes zalogowany, logujesz sie w oknie.
- Udostepnia szybki link do zarezerwowanych pozycji w koncie MBP.

## Instalacja (Chrome)

1. Otworz `chrome://extensions`.
2. Wlacz **Tryb deweloperski**.
3. Kliknij **Zaladuj rozpakowane** i wybierz ten folder.

## Jak to dziala

- **Content script** (`content.js`) dziala na stronach ksiazek Lubimyczytac.pl.
- Pobiera ISBN, odpytuje MBP i wyswietla interfejs rezerwacji.
- **Background service worker** (`background.js`) wykonuje zapytania sieciowe do MBP.
- **Popup** (`popup.html` + `popup.js`) zawiera formularz logowania.

## Struktura

- `manifest.json` - Manifest rozszerzenia (MV3).
- `content.js` - Wstrzykiwanie UI, wyszukiwanie MBP, proces rezerwacji.
- `background.js` - Zapytania sieciowe do MBP.
- `popup.html` / `popup.css` / `popup.js` - Interfejs logowania w popupie.

## Uwagi

- Rozszerzenie korzysta z publicznych endpointow OPAC MBP.
- Dostepnosc i rezerwacje moga sie zmienic, jesli MBP zmieni serwis.
