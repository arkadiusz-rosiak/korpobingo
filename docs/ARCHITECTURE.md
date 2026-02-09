# KorpoBingo - Architektura techniczna

## Przegląd

KorpoBingo to aplikacja webowa do gry w bingo podczas korporacyjnych spotkań.
Uczestnicy zgłaszają i głosują na słowa/frazy, a następnie odhaczają je na swoich planszach.

## Tech Stack

| Warstwa | Technologia |
|---------|-------------|
| Frontend | Next.js 14+ (App Router, SSR) |
| Stylowanie | Tailwind CSS |
| Backend | AWS Lambda (via SST v3) |
| API | API Gateway (REST) |
| Baza danych | DynamoDB |
| Infrastruktura | SST v3 (IaC) |
| Monorepo | npm workspaces |

## Struktura monorepo

```
korpobingo/
├── sst.config.ts              # Konfiguracja SST
├── package.json               # Root workspace
├── tsconfig.json              # Root TypeScript config
├── infra/                     # Infrastruktura (IaC)
│   ├── web.ts                 # NextjsSite
│   ├── storage.ts             # DynamoDB tables
│   └── api.ts                 # API Gateway + Lambda bindings
├── packages/
│   ├── core/                  # Współdzielona logika biznesowa
│   │   └── src/
│   │       ├── round.ts       # Logika rund
│   │       ├── word.ts        # Logika słów/głosowania
│   │       ├── board.ts       # Generowanie plansz + detekcja bingo
│   │       └── player.ts      # Logika graczy
│   ├── functions/             # Lambda handlers
│   │   └── src/
│   │       ├── rounds.ts      # API rund
│   │       ├── words.ts       # API słów
│   │       ├── players.ts     # API graczy
│   │       └── boards.ts      # API plansz
│   └── web/                   # Next.js frontend
│       ├── app/
│       │   ├── layout.tsx     # Root layout
│       │   ├── page.tsx       # Strona główna
│       │   ├── [roundId]/
│       │   │   ├── page.tsx   # Strona rundy (zgłaszanie słów)
│       │   │   ├── board/
│       │   │   │   └── page.tsx  # Plansza gracza
│       │   │   └── players/
│       │   │       └── page.tsx  # Lista uczestników
│       │   └── create/
│       │       └── page.tsx   # Tworzenie nowej rundy
│       └── components/
│           ├── BingoBoard.tsx  # Komponent planszy
│           ├── WordList.tsx    # Lista słów do głosowania
│           ├── PlayerList.tsx  # Lista uczestników
│           └── BingoModal.tsx  # Modal z filmem po bingo
└── docs/
    └── ARCHITECTURE.md        # Ten dokument
```

## Model danych (DynamoDB)

### Tabela: Rounds

| Atrybut | Typ | Opis |
|---------|-----|------|
| `roundId` (PK) | String | UUID rundy |
| `status` | String | `collecting` / `playing` / `finished` |
| `boardSize` | Number | 3 lub 4 (rozmiar planszy NxN) |
| `createdAt` | String | ISO timestamp utworzenia |
| `collectingEndsAt` | String | ISO timestamp końca zbierania słów |
| `roundEndsAt` | String | ISO timestamp końca rundy |
| `shareCode` | String | Krótki kod do udostępniania (np. 6 znaków) |

**GSI: ShareCodeIndex** - PK: `shareCode` - do szybkiego wyszukiwania po kodzie

### Tabela: Words

| Atrybut | Typ | Opis |
|---------|-----|------|
| `roundId` (PK) | String | ID rundy |
| `wordId` (SK) | String | UUID słowa |
| `text` | String | Treść słowa/frazy |
| `votes` | Number | Liczba głosów |
| `createdBy` | String | Imię osoby która zgłosiła |
| `createdAt` | String | ISO timestamp |

### Tabela: Players

| Atrybut | Typ | Opis |
|---------|-----|------|
| `roundId` (PK) | String | ID rundy |
| `playerName` (SK) | String | Imię gracza (unikalne w ramach rundy) |
| `joinedAt` | String | ISO timestamp dołączenia |
| `hasBingo` | Boolean | Czy gracz trafił bingo |

### Tabela: Boards

| Atrybut | Typ | Opis |
|---------|-----|------|
| `roundId` (PK) | String | ID rundy |
| `playerName` (SK) | String | Imię gracza |
| `cells` | List | Tablica obiektów `{wordId, text, checked}` |
| `boardSize` | Number | 3 lub 4 |

## API Endpoints

### Rundy
- `POST /rounds` - Utwórz nową rundę
- `GET /rounds/:roundId` - Pobierz szczegóły rundy
- `GET /rounds/code/:shareCode` - Znajdź rundę po kodzie

### Słowa
- `GET /rounds/:roundId/words` - Lista słów w rundzie
- `POST /rounds/:roundId/words` - Zgłoś nowe słowo
- `POST /rounds/:roundId/words/:wordId/vote` - Zagłosuj na słowo

### Gracze
- `POST /rounds/:roundId/players` - Dołącz do rundy (podaj imię)
- `GET /rounds/:roundId/players` - Lista graczy w rundzie

### Plansze
- `GET /rounds/:roundId/boards/:playerName` - Pobierz planszę gracza
- `PATCH /rounds/:roundId/boards/:playerName` - Odhacz/ododhacz słowo
- `POST /rounds/:roundId/boards/:playerName/check-bingo` - Sprawdź bingo

## Flow aplikacji

### Faza 1: Tworzenie rundy
1. Organizator wchodzi na stronę główną
2. Tworzy nową rundę (konfiguruje: czas trwania, rozmiar planszy)
3. Otrzymuje link/kod do udostępnienia

### Faza 2: Zbieranie słów (domyślnie 24h przed startem gry)
1. Uczestnicy wchodzą po linku/kodzie
2. Widzą listę zgłoszonych słów z liczbą głosów
3. Mogą zgłosić nowe słowo lub zagłosować na istniejące
4. Po upłynięciu czasu system wybiera TOP X słów

### Faza 3: Gra
1. Uczestnik podaje swoje imię
2. System generuje losowo ułożoną planszę z wybranych słów
3. Uczestnik odhacza słowa podczas spotkań
4. System sprawdza bingo po każdym odhaczeniu
5. Przy bingo - odtworzenie filmiku celebracyjnego

### Faza 4: Zakończenie
1. Po upłynięciu czasu rundy - runda się kończy
2. Widoczne wyniki: kto trafił bingo, ile słów odhaczonych

## Strategia SSR

Next.js App Router z jak największym wykorzystaniem Server Components:

| Strona | Rendering | Uzasadnienie |
|--------|-----------|--------------|
| Strona główna | SSR | Statyczna treść |
| Tworzenie rundy | SSR + Client Actions | Formularz wymaga interakcji |
| Strona rundy (słowa) | SSR + Client polling | Lista słów odświeżana co kilka sekund |
| Plansza bingo | SSR initial + Client state | Odhaczanie wymaga szybkiej interakcji |
| Lista graczy | SSR | Odświeżana przy wejściu |

## Detekcja Bingo

Algorytm sprawdzania bingo dla planszy NxN:
1. Sprawdź każdy wiersz (N wierszy)
2. Sprawdź każdą kolumnę (N kolumn)
3. Sprawdź obie przekątne (2 przekątne)

Bingo = wszystkie komórki w wierszu/kolumnie/przekątnej zaznaczone.

## Identyfikacja graczy

Brak logowania - gracz identyfikowany po imieniu w ramach rundy.
Imię musi być unikalne w ramach rundy.
Stan planszy (odhaczone słowa) przechowywany server-side w DynamoDB.
Po powrocie na stronę gracz podaje to samo imię i odzyskuje swoją planszę.

## Koszty AWS (szacunkowo)

Przy założeniu ~50 użytkowników:
- **DynamoDB**: Free tier (25 WCU/RCU) powinien wystarczyć
- **Lambda**: Free tier (1M req/miesiąc) powinien wystarczyć
- **API Gateway**: Free tier (1M calls/miesiąc) powinien wystarczyć
- **Next.js (SSR via Lambda@Edge lub Lambda)**: Minimalne koszty

**Szacowany koszt miesięczny: ~$0-1** (w ramach free tier)
