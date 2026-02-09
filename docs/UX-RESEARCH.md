# Badania UX - KorpoBingo

## Spis treści
1. [Kluczowe odkrycia](#1-kluczowe-odkrycia)
2. [Rekomendacje UX](#2-rekomendacje-ux)
3. [Wzorce do zastosowania](#3-wzorce-do-zastosowania)
4. [Anti-patterns](#4-anti-patterns)
5. [Pytania do Product Ownera](#5-pytania-do-product-ownera)

---

## 1. Kluczowe odkrycia

### 1.1 Istniejące aplikacje bingo

**Przebadane aplikacje:**
- [Business Buzzword Bingo](https://www.businessbuzzwordbingo.com/) - klasyczna webowa wersja z predefiniowanymi słowami
- [Buzzword Counter PWA](https://github.com/JMousqueton/buzzwords-bingo) - PWA z licznikiem buzzwordów, konfetti i trybem offline
- [The Buzzword Bingo](https://github.com/DevinSit/the-buzzword-bingo) - React app na korpo-spotkania
- [Accessible Bingo Web App](https://www.24a11y.com/2019/building-an-accessible-bingo-web-app/) - React + Firebase, multiplayer z dostępnością

**Co robią dobrze:**
- Natychmiastowy start bez rejestracji (Business Buzzword Bingo)
- Udostępnianie konfiguracji przez URL/QR kod (Buzzword Counter)
- Automatyczne wykrywanie bingo bez konieczności ręcznego sprawdzania (Accessible Bingo)
- Konfetti jako celebracja osiągnięć (Buzzword Counter - co 10 zaznaczenie)
- Tryb offline jako PWA (Buzzword Counter)
- Dostępność: nawigacja klawiaturą, ARIA labels, role="alert" dla ogłoszenia bingo (Accessible Bingo)

**Co robią źle:**
- Brak multiplayer w większości - gracz jest sam ze swoją planszą
- Brak fazy zbierania/głosowania na słowa - używają predefiniowanych list
- Brak widoczności postępu innych graczy
- Nudny, generyczny design bez charakteru
- Słaba responsywność - problemy z widocznością planszy w trybie landscape na tabletach
- Brak haptic feedback na mobile

**Wniosek:** Rynek buzzword bingo jest zdominowany przez proste, jednoosobowe narzędzia. KorpoBingo ma szansę wyróżnić się aspektem społecznym (multiplayer) i fazą przygotowania (zbieranie słów).

### 1.2 Gamifikacja w małych grupach

**Kluczowe odkrycia z badań** ([Designlab](https://designlab.com/blog/gamification-in-ux-enhancing-engagement-and-interaction), [IxDF](https://www.interaction-design.org/literature/topics/gamification)):

- **Typy graczy w małych grupach (3-8 osób):** W małej grupie znajomych dominują Socializers (szukają kontaktu) i Achievers (chcą wygrać). Mniej istotni są Explorers i Killers.
- **Peer comparison działa najlepiej w małych grupach** - gdy wszyscy się znają, widok postępu innych motywuje bez tworzenia toksycznej rywalizacji.
- **Streaks i serie** - krótka gra jak bingo nie potrzebuje systemu level-up, ale seria szybkich zwycięstw w wielu rundach może budować engagement.
- **Social proof** - w grupie 3-8 osób widzenie, że ktoś zaznaczył pole, buduje napięcie ("o, ktoś jest blisko!").

**Widoczność postępu innych graczy (decyzja PO):**
- Paski postępu z liczbą zaznaczonych pól (np. "Kasia: 5/9") są **ZAWSZE WIDOCZNE** obok imion graczy
- Podgląd planszy innego gracza dostępny **NA ŻĄDANIE** (kliknięcie na imię gracza)
- Subtelna animacja gdy ktoś zaznacza pole (np. awatar "miga")
- Powiadomienie "X jest blisko bingo!" gdy gracz ma np. n-1 pól w rzędzie

### 1.3 Frictionless onboarding (bez logowania)

**Best practices** ([LogRocket](https://blog.logrocket.com/ux-design/creating-frictionless-user-onboarding-experience/), [Inworld](https://inworld.ai/blog/game-ux-best-practices-for-video-game-onboarding)):

- **Wzorzec Jackbox Games** jest złotym standardem dla casualowych gier grupowych:
  1. Host tworzy grę i widzi kod pokoju (4 znaki)
  2. Gracze wchodzą na stronę, wpisują kod + swoje imię
  3. Gra się zaczyna - zero rejestracji, zero kont
- **Identyfikacja gracza:** localStorage z tokenem sesji + imię. Przy powrocie (np. odświeżenie strony) automatyczne przywrócenie sesji.
- **Progressive disclosure:** Nie tłumacz wszystkich zasad na start. Pokaż planszę i pozwól grać - reguły wyjaśniają się same.
- **Czas do pierwszej interakcji < 10 sekund** - gracz powinien móc zaznaczać pola w ciągu sekund od dołączenia.

### 1.4 Micro-interakcje i satysfakcja

**Zaznaczanie pól** ([Stan Vision](https://www.stan.vision/journal/micro-interactions-2025-in-web-design), [UXPin](https://www.uxpin.com/studio/blog/microinteractions-for-protypes/)):

- **Efekt "stempla"** - zaznaczenie pola powinno dawać satysfakcję jak pieczątka. Skalowanie (scale 0.95 → 1.05 → 1.0), zmiana koloru z lekkim opóźnieniem, subtelny cień.
- **Haptic feedback** na mobile: Vibration API (`navigator.vibrate(15)`) - krótki impuls 15ms przy zaznaczeniu. Uwaga: działa w Chromium i Firefox, NIE działa w Safari/iOS WebKit (od iOS 18+ częściowa obsługa).
- **Dźwięk** - opcjonalny, subtelny "click" lub "pop" (domyślnie wyłączony na spotkaniu!).
- **Odznaczanie** - musi być możliwe (pomyłki się zdarzają), z inną animacją (fade out vs energiczne zaznaczenie).

**Celebracja bingo:**
- **Konfetti** - biblioteka [canvas-confetti](https://confetti.js.org/) lub [tsParticles](https://confetti.js.org/) - lekkie, wydajne
- **Efekt powinien być proporcjonalny do osiągnięcia** - pierwsze bingo = duże konfetti + wibracja; każde kolejne = mniejsza celebracja
- **Powiadomienie dla innych graczy** - "Kasia ma BINGO!" z subtelną animacją (nie blokujące rozgrywki)
- **Haptic feedback na bingo:** dłuższa wibracja (200ms) lub wzorzec `[100, 50, 100]`

### 1.5 Responsive game design

**Plansze na różnych ekranach** ([MDN Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Common_grid_layouts), [CSS Game Board](https://medium.com/@thewebdevg/creating-a-gameboard-with-css-grid-47da8ac25078)):

- **CSS Grid** jest idealny dla planszy bingo: `grid-template-columns: repeat(N, 1fr)` z `aspect-ratio: 1`
- **Rozmiar komórki:** minimum 44x44px (WCAG AAA), rekomendowane 48-64px na mobile. Plansza 4x4 na ekranie 375px szerokości = ~80px/komórka (komfortowo).
- **Plansza 3x3 vs 4x4:** Na telefonie 3x3 daje duże, wygodne komórki (~100px). 4x4 jest wciąż komfortowe (~80px). 5x5 zaczyna być ciasne (~64px) - na granicy.
- **Orientacja:** Używaj `orientation` media query. Portrait: plansza na pełną szerokość. Landscape: plansza wycentrowana z marginesami.
- **Touch targets:** minimum 24x24px (WCAG 2.2 AA), rekomendowane 44x44px (AAA). Przy planszy bingo komórki naturalnie spełniają ten wymóg.
- **Desktop:** Plansza nie powinna zajmować pełnego ekranu - max 500-600px szerokości, wycentrowana, z panelem bocznym na listę graczy/postęp.

### 1.6 Subtelna ironia w UI

**Jak przekazać humor bez przesady** ([Fusion Tech](https://fusion-tech.pro/blog/humor-in-ui-ux), [Trollbäck](https://www.trollback.com/insights/posts/designing-with-humor-five-ways-brands-can-be-funny-without-falling-flat)):

- **Profesjonalny wygląd z ukrytymi smaczkami** - wzorzec Cartier: ukryj humor w detalach (footer, empty states, mikrokopie) tak, by gracz go "odkrył".
- **Korporacyjna estetyka jako żart sam w sobie** - użyj typowej korpo-palety (granatowy, szary, biały) ale z subtelnymi przełamaniami. Fonty sans-serif jak w prezentacjach PowerPoint. "Profesjonalne" labele typu "Synergia osiągnięta" zamiast "BINGO!".
- **Mikrokopie z przymrużeniem oka:**
  - Zamiast "Dołącz do gry" → "Dołącz do spotkania"
  - Zamiast "Nowa runda" → "Nowy kwartalny alignment"
  - Loading: "Synchronizuję synergię..." / "Optymalizuję procesy..."
  - Empty state: "Brak aktywnych spotkań. Wykorzystaj czas na development personalny."
  - Bingo: "Synergia osiągnięta!" / "Alignment zakończony sukcesem!"
- **Nie przesadzaj** - humor powinien być jak przyprawy: wzmacniać, nie dominować. 80% UI powinno wyglądać "normalnie", 20% może mieć smaczki.
- **Unikaj memów i popkultury** - szybko się starzeją. Korpo-żargon jest ponadczasowy.

---

## 2. Rekomendacje UX

### 2.1 Flow dołączania do gry (Jackbox pattern)

```
[Ekran startowy]
    "KorpoBingo"
    [ Nowe spotkanie ]  ← tworzy rundę, generuje kod
    [ Dołącz: ____ ]    ← pole na 4-znakowy kod

[Po wpisaniu kodu]
    "Jak Cię zwą?"
    [ Twoje imię ]      ← zapisz w localStorage
    [ Wchodzę na spotkanie → ]
```

**Kluczowe decyzje:**
- Kod 4-znakowy (litery), łatwy do podyktowania
- Imię zapisane w localStorage - przy następnej wizycie podpowiada
- Żadnych dodatkowych kroków - imię + kod = grasz

### 2.2 Faza zbierania słów

```
[Ekran zbierania]
    "Dodaj buzzwordy na spotkanie"
    [ wpisz słowo... ] [+]

    Lista dodanych słów (real-time, od wszystkich graczy):
    - "synergy" (dodał: Kasia)
    - "circle back" (dodał: Tomek)
    - "deep dive" (dodał: Kasia)
    ...

    [Wystarczy! Zaczynamy → ]  ← host decyduje
```

**Rekomendacje:**
- Każdy gracz może dodawać słowa (minimum 3, sugerowane 5-8 na osobę)
- Widać kto dodał co (buduje social dynamic)
- Duplikaty automatycznie łączone
- Host ma przycisk "Zaczynamy" gdy jest wystarczająco dużo słów
- Opcjonalne głosowanie na najlepsze (jeśli za dużo słów)

### 2.3 Plansza do gry

```
[Plansza 4x4]
┌──────────┬──────────┬──────────┬──────────┐
│ synergy  │ deep     │ circle   │ leverage │
│          │ dive     │ back     │          │
├──────────┼──────────┼──────────┼──────────┤
│ align-   │ touch    │ move the │ low-     │
│ ment     │ base     │ needle   │ hanging  │
├──────────┼──────────┼──────────┼──────────┤
│ pivot    │ band-    │ EOD      │ take     │
│          │ width    │          │ offline  │
├──────────┼──────────┼──────────┼──────────┤
│ loop in  │ drill    │ action   │ on my    │
│          │ down     │ items    │ radar    │
└──────────┴──────────┴──────────┴──────────┘

[Panel dolny na mobile / boczny na desktop]
    Gracze:
    Kasia ████████░░ 6/16
    Tomek █████░░░░░ 5/16
    Ty    ███████░░░ 7/16  ← podświetlony
```

**Rekomendacje:**
- Każdy gracz dostaje INNY układ tych samych słów (losowa permutacja)
- Tap/click zaznacza pole (efekt stempla, zmiana koloru)
- Ponowny tap odznacza (z potwierdzeniem?)
- Automatyczne wykrywanie bingo (rząd/kolumna/przekątna)
- Paski postępu innych graczy **zawsze widoczne** w panelu graczy (decyzja PO)
- Kliknięcie na imię gracza otwiera podgląd jego planszy **na żądanie**

### 2.4 Moment bingo

```
[Gdy gracz zaznacza ostatnie pole w linii]
    1. Pole "zamyka się" z satysfakcjonującą animacją
    2. Linia podświetla się (glow effect)
    3. Konfetti na pełnym ekranie (2-3 sekundy)
    4. Haptic feedback (wzorzec wibracji)
    5. Tekst: "SYNERGIA OSIĄGNIĘTA!" (duży, centralny)
    6. Powiadomienie dla innych: "Kasia osiągnęła synergię!"

[Gra kontynuuje? Czy koniec?]
    → Decyzja PO (patrz pytania)
```

### 2.5 System identyfikacji graczy

**Rekomendacja: Token w localStorage + imię**

```
Pierwszy wejście:
    1. Gracz wpisuje imię → generowany UUID token
    2. Token + imię zapisane w localStorage

Powrót (to samo urządzenie):
    1. Token w localStorage → automatyczne rozpoznanie
    2. Podpowiedź: "Wracasz jako Kasia? [Tak] [Zmień imię]"

Powrót (inne urządzenie):
    1. Brak tokenu → nowy gracz
    2. Jeśli to samo imię w tej samej rundzie → pytanie "Czy to Ty, Kasia?"
```

---

## 3. Wzorce do zastosowania

### 3.1 Wzorzec: Jackbox Room Code

**Źródło:** [Jackbox Games](https://www.jackboxgames.com/how-to-play)

**Opis:** 4-literowy kod pokoju wyświetlany na ekranie hosta. Gracze wchodzą na stronę i wpisują kod + imię.

**Zastosowanie w KorpoBingo:**
- Kod generowany przy tworzeniu rundy
- Wyświetlany dużą czcionką na ekranie twórcy
- Łatwy do podyktowania przez Teams/Slack: "Wejdźcie na korpobingo.pl, kod: XKCD"
- Wygasa po zakończeniu rundy

**Uzasadnienie:** Najniższy możliwy próg wejścia. Zero kont, zero instalacji. Sprawdzony wzorzec w milionach sesji Jackbox.

### 3.2 Wzorzec: Zaznaczanie z efektem stempla

**Źródło:** [Micro-interactions in web design](https://www.stan.vision/journal/micro-interactions-2025-in-web-design)

**Opis:** Kliknięcie/tapnięcie pola wywołuje:
1. Skalowanie w dół (scale 0.95) - "wciśnięcie"
2. Zmiana koloru tła (np. biały → ciemnoniebieski)
3. Skalowanie w górę (scale 1.02) - "odbicie"
4. Powrót do normalnego rozmiaru (scale 1.0)
5. Opcjonalnie: krótki haptic pulse (15ms)

**CSS (przykład):**
```css
.cell--checked {
  animation: stamp 0.3s ease-out;
  background-color: var(--color-primary);
  color: white;
}

@keyframes stamp {
  0%   { transform: scale(1); }
  30%  { transform: scale(0.92); }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

**Uzasadnienie:** Feedback fizyczny sprawia, że każde zaznaczenie "czuć". To kluczowe w grze, gdzie główna interakcja to klikanie pól.

### 3.3 Wzorzec: Zawsze widoczny progress bar + podgląd planszy na żądanie

**Opis:** Paski postępu obok imion graczy są **zawsze widoczne** (decyzja PO). Kliknięcie na imię gracza otwiera podgląd jego planszy.

**Zastosowanie:**
- Cienki pasek (4-6px) w kolorze gracza, **zawsze widoczny** w panelu graczy
- Licznik "X/16" obok paska - zawsze aktualny w real-time
- Animowany płynnie przy każdej zmianie (CSS transition)
- Gdy gracz ma n-1 pól w linii: ikonka "ognia" lub migający pasek
- **Podgląd planszy na żądanie:** kliknięcie na imię gracza otwiera overlay/drawer z jego planszą (read-only, widać zaznaczone pola)

**Uzasadnienie:** Zawsze widoczne paski budują stałe napięcie i social dynamic. "Kasia jest na 12/16, a ja dopiero na 8!". Podgląd planszy na żądanie daje opcję sprawdzenia szczegółów bez wymuszania spoilerów.

### 3.4 Wzorzec: Korpo-estetyka z przymrużeniem oka

**Opis:** UI wygląda jak profesjonalna aplikacja korporacyjna, ale z subtelnymi elementami humoru.

**Elementy:**
- Paleta kolorów: granatowy (#1a237e), biały, jasny szary, akcent w kolorze korpo-zielonym
- Font: Inter lub system sans-serif (wygląda jak wewnętrzny tool firmowy)
- Ikony: outline style, profesjonalne (Lucide/Heroicons)
- Mikrokopie: korpo-żargon użyty jako UI copy (patrz sekcja 1.6)
- Loading states: "Synchronizuję synergię..." rotujące losowo
- 404/empty: "Ten zasób nie jest dostępny w bieżącym kwartale"

**Uzasadnienie:** Humor wynika z kontrastu między profesjonalnym wyglądem a absurdalnym kontekstem (granie w bingo na spotkaniu). Nie trzeba dodawać memów - sam fakt istnienia tej aplikacji jest żartem.

### 3.5 Wzorzec: Celebracja bingo (canvas-confetti)

**Źródło:** [canvas-confetti](https://confetti.js.org/)

**Opis:** Moment bingo to kulminacja gry - celebracja musi być satysfakcjonująca ale krótka.

**Implementacja:**
1. Konfetti z canvas-confetti (lekka biblioteka, ~6KB)
2. Czas trwania: 2-3 sekundy
3. Haptic: `navigator.vibrate([100, 50, 100, 50, 200])` - wzorzec narastający
4. Tekst centralny z animacją scale-in
5. Po 3 sekundach: automatyczne przejście do widoku wyników lub kontynuacja gry

**Uzasadnienie:** Moment "wygrałem!" to emocjonalny szczyt gry. Zbyt mała celebracja = rozczarowanie. Zbyt duża = cringe (szczególnie na spotkaniu). 2-3 sekundy konfetti to sweet spot.

### 3.6 Wzorzec: Mobile-first responsive grid

**Opis:** Plansza jako CSS Grid, skalowana od mobile w górę.

**Breakpointy:**
- Mobile portrait (< 480px): plansza na pełną szerokość, gracze pod planszą
- Mobile landscape (< 768px, landscape): plansza wycentrowana, gracze po boku
- Tablet/Desktop (>= 768px): plansza max 500px, panel graczy z boku

**CSS:**
```css
.board {
  display: grid;
  grid-template-columns: repeat(var(--board-size), 1fr);
  gap: 4px;
  max-width: min(100vw - 32px, 500px);
  margin: 0 auto;
}

.board__cell {
  aspect-ratio: 1;
  min-height: 44px; /* WCAG touch target */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: clamp(0.7rem, 2.5vw, 0.9rem);
  padding: 4px;
  word-break: break-word;
}
```

---

## 4. Anti-patterns

### 4.1 Unikaj: Wymaganie logowania/rejestracji
**Problem:** Każdy dodatkowy krok = utrata graczy. W kontekście "gra na spotkaniu" nikt nie będzie zakładał konta.
**Zamiast tego:** Imię + kod pokoju. Punkt.

### 4.2 Unikaj: Wymuszanie podglądu plansz innych graczy
**Problem:** Automatyczne pokazywanie plansz innych graczy zabija napięcie. Jeśli widzę planszę Kasi bez pytania, wiem dokładnie czy jest blisko bingo.
**Zamiast tego:** Paski postępu (ilość zaznaczonych pól) są zawsze widoczne. Podgląd konkretnej planszy jest dostępny na żądanie - kliknięcie na imię gracza (decyzja PO).

### 4.3 Unikaj: Zbyt duży rozmiar planszy (5x5+)
**Problem:** 25 pól na telefonie = mikroskopijny tekst, frustrujące tapnięcie w złe pole. Wymaga 25+ unikalnych buzzwordów (trudne do zebrania w małej grupie).
**Zamiast tego:** 3x3 (szybka gra, ~5 min) lub 4x4 (standardowa, ~15 min). Daj hostowi wybór.

### 4.4 Unikaj: Blokujące modalne okna
**Problem:** Gracz na spotkaniu patrzy na telefon pod stołem. Modal wymaga interakcji → ryzyko zauważenia.
**Zamiast tego:** Inline notifications, toast messages, subtelne animacje. Wszystko odrzucalne jednym tapem.

### 4.5 Unikaj: Dźwięków domyślnie włączonych
**Problem:** Dźwięk z telefonu na spotkaniu = demaskacja.
**Zamiast tego:** Dźwięki domyślnie WYŁĄCZONE. Haptic feedback domyślnie WŁĄCZONY (cichy). Opcja włączenia dźwięku w ustawieniach.

### 4.6 Unikaj: Jaskrawych kolorów i memów
**Problem:** Aplikacja na telefonie powinna wyglądać jak "normalna" apka gdyby ktoś zerknął. Neonowe kolory i memy krzyczą "gram w grę".
**Zamiast tego:** Stonowana, profesjonalna paleta. Ktoś patrząc z boku powinien pomyśleć "pewnie czyta Jirę".

### 4.7 Unikaj: Braku odznaczania pól
**Problem:** Pomyłkowe zaznaczenie bez możliwości cofnięcia = frustracja.
**Zamiast tego:** Tap zaznacza, ponowny tap odznacza. Bez dodatkowego potwierdzenia (to spowalnia grę).

### 4.8 Unikaj: Nadmiarowego tutoriala
**Problem:** Bingo to prosta gra - każdy zna zasady. Rozbudowany tutorial to strata czasu.
**Zamiast tego:** Maksymalnie jeden ekran z 3 punktami: "1. Zaznaczaj słowa gdy je usłyszysz. 2. Linia = bingo. 3. Baw się dobrze." Lub w ogóle bez tutoriala - gra tłumaczy się sama.

### 4.9 Unikaj: Polling zamiast WebSocket
**Problem:** Polling co X sekund = opóźnienia w pokazywaniu postępu graczy + niepotrzebne żądania.
**Zamiast tego:** WebSocket lub SSE dla real-time updates. DynamoDB Streams + API Gateway WebSocket (już w architekturze SST).

---

## 5. Pytania do Product Ownera

### Zasady gry
1. **Rozmiar planszy:** 3x3 (szybka, ~5 min) czy 4x4 (dłuższa, ~15 min)? Czy host wybiera?
2. **Co się dzieje po bingo?** Gra kończy się natychmiast (jeden zwycięzca) czy kontynuuje (ranking wielu bingo)?
3. **Czy są przekątne?** Klasyczne bingo ma linie + przekątne. Uproszczone - tylko linie.
4. **Wolne pole (free space)?** Tradycyjne bingo ma wolne pole na środku. Czy KorpoBingo też?

### Faza zbierania słów
5. **Kto dodaje słowa?** Tylko host, wszyscy gracze, czy mieszane (host + sugestie)?
6. **Głosowanie na słowa?** Gdy jest za dużo propozycji - czy gracze głosują które trafiają na planszę?
7. **Predefiniowane listy?** Czy aplikacja oferuje gotowe zestawy buzzwordów (ogólne korpo, IT, marketing, HR)?
8. **Ile słów minimum/maximum?** Dla 4x4 potrzeba 16 unikalnych. Czy wymagamy nadmiaru (np. 20+) żeby każdy gracz miał inny układ?

### Social / multiplayer
9. **Czy host gra?** Czy osoba tworząca rundę też dostaje planszę i gra?
10. ~~**Widoczność postępu:**~~ **ROZWIĄZANE** - PO zdecydował: paski postępu zawsze widoczne, podgląd planszy na żądanie (klik na imię gracza).
11. **Reakcje/emotki?** Czy gracze mogą wysyłać subtelne reakcje (np. emoji-reakcję na czyjeś bingo)?
12. **Chat?** Czy potrzebny jest minimalny chat w grze, czy komunikacja odbywa się poza aplikacją (Teams/Slack)?

### Kontekst użycia
13. **Czas życia rundy:** Czy runda trwa tyle co spotkanie (~30-60 min) czy można ją zamknąć wcześniej?
14. **Historia:** Czy zapisywać wyniki poprzednich rund? Ranking na przestrzeni wielu spotkań?
15. **Personalizacja:** Czy gracze mogą wybrać awatar/kolor? Czy przydzielamy losowo?

### Techniczne
16. **Offline support:** Czy aplikacja ma działać gdy internet "miga" na spotkaniu? (gracze zaznaczają offline, sync po powrocie)
17. **Powiadomienia push:** Czy powiadamiać "Nowa runda czeka!" gdy host ją tworzy?
18. **Limit graczy:** Sztywne 3-8 czy elastyczne? Co gdy ktoś chce grać w 2 lub w 12?

---

## Źródła

### Istniejące aplikacje bingo
- [Business Buzzword Bingo](https://www.businessbuzzwordbingo.com/)
- [Buzzword Counter PWA (GitHub)](https://github.com/JMousqueton/buzzwords-bingo)
- [The Buzzword Bingo (GitHub)](https://github.com/DevinSit/the-buzzword-bingo)
- [Building an Accessible Bingo Web App](https://www.24a11y.com/2019/building-an-accessible-bingo-web-app/)
- [Buzzword Bingo - Wikipedia](https://en.wikipedia.org/wiki/Buzzword_bingo)

### Gamifikacja i UX
- [Gamification in UX - Designlab](https://designlab.com/blog/gamification-in-ux-enhancing-engagement-and-interaction)
- [Gamification - IxDF](https://www.interaction-design.org/literature/topics/gamification)
- [Gamification in UX/UI - Muzli](https://medium.muz.li/gamification-in-ux-ui-design-enhancing-user-engagement-and-experience-a78838627ea7)
- [Social Features in Mobile Games - Udonis](https://www.blog.udonis.co/mobile-marketing/mobile-games/social-features-mobile-games)

### Onboarding i identyfikacja
- [Frictionless Onboarding - LogRocket](https://blog.logrocket.com/ux-design/creating-frictionless-user-onboarding-experience/)
- [Game UX Onboarding - Inworld](https://inworld.ai/blog/game-ux-best-practices-for-video-game-onboarding)
- [Jackbox Games - How to Play](https://www.jackboxgames.com/how-to-play)
- [Frictionless Sign Up - Ping Identity](https://www.pingidentity.com/en/resources/blog/post/frictionless-signup.html)

### Micro-interakcje
- [Micro Interactions in Web Design - Stan Vision](https://www.stan.vision/journal/micro-interactions-2025-in-web-design)
- [Microinteractions for Prototypes - UXPin](https://www.uxpin.com/studio/blog/microinteractions-for-protypes/)
- [canvas-confetti](https://confetti.js.org/)
- [Vibration API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

### Responsive design
- [CSS Grid Common Layouts - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Common_grid_layouts)
- [Creating a Gameboard with CSS Grid](https://medium.com/@thewebdevg/creating-a-gameboard-with-css-grid-47da8ac25078)
- [WCAG 2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### Humor w UI
- [Humor in UI/UX - Fusion Tech](https://fusion-tech.pro/blog/humor-in-ui-ux)
- [Designing with Humor - Trollbäck](https://www.trollback.com/insights/posts/designing-with-humor-five-ways-brands-can-be-funny-without-falling-flat)
- [Using Humor in Design - Shopify](https://www.shopify.com/partners/blog/using-humor-in-design-why-when-and-how)
