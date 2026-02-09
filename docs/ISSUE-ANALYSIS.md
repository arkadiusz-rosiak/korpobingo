# Analiza backlogu KorpoBingo - Raport

Data analizy: 2026-02-09

---

## 1. Podsumowanie stanu backlogu

### Struktura
- **5 epików** (#1-#5) - dobrze zorganizowane tematycznie
- **18 user stories** (#6-#23) - powiązane z epikami przez "Part of #N"
- Wszystkie issues mają etykiety (`user-story`, `epic`, `frontend`, `backend`, `infra`, `mvp`)
- Wszystkie przypisane do milestone'a **MVP**
- Brak przypisanych osób (assignees) - do uzupełnienia przy planowaniu sprintu

### Co jest dobrze
- Jasna struktura epik -> user stories
- Konsekwentny format: User Story (jako/chcę/aby), Kryteria akceptacji (checklisty), Szczegóły techniczne
- Dobre pokrycie głównego flow aplikacji (tworzenie rundy -> słowa -> gra -> bingo)
- Szczegóły techniczne pomagają deweloperom zrozumieć scope
- Epiki mają checklisty powiązanych stories

### Co wymaga poprawy
- Brak priorytetów / kolejności implementacji (nie wiadomo od czego zacząć)
- Brak zależności między stories (np. US3.1 wymaga US2.4 i US1.2)
- Brak estymat złożoności (story points)
- Brak definicji "Done" na poziomie projektu
- Brak issues dotyczących UX/UI, testów, dokumentacji, bezpieczeństwa

---

## 2. Brakujące acceptance criteria - analiza per issue

### US1.1: Tworzenie nowej rundy z konfiguracją (#6)
Brakuje:
- **Walidacja formularza**: minimalne/maksymalne wartości czasu trwania, co jeśli użytkownik wpisze 0 minut?
- **ShareCode UX**: jak wygląda wygenerowany link? Czy jest przycisk "Kopiuj link"? Jak długi jest shareCode?
- **Responsive design**: jak formularz wygląda na telefonie vs desktopie?
- **Error states**: co jeśli utworzenie rundy się nie powiedzie? (błąd API, timeout)
- **Feedback po utworzeniu**: co dokładnie widzi użytkownik po kliknięciu "Utwórz"? Redirect? Modal? Toast?
- **Nazwa rundy**: czy jest wymagana? Jakie ograniczenia (długość, znaki)?
- **Architektura mówi o `collectingEndsAt` i `roundEndsAt`** - ale issue wspomina tylko o "czasie trwania fazy zbierania". Brakuje konfiguracji czasu trwania samej gry.
- **Domyślny rozmiar planszy**: 3x3 czy 4x4?

### US1.2: Automatyczne zamykanie fazy zgłaszania słów (#7)
Brakuje:
- **Mechanizm przedłużenia**: o ile czasu przedłużana jest faza zbierania? Czy organizator jest powiadamiany?
- **Minimalna liczba słów**: ile słów jest "wystarczające"? Dokładnie 9/16 czy może być więcej?
- **Powiadomienie użytkowników**: jak uczestnicy dowiadują się o zmianie fazy? (polling? push?)
- **Co jeśli zero słów?**: czy runda może przejść do fazy gry bez słów?
- **Ręczne uruchomienie gry**: czy organizator może ręcznie zamknąć zbieranie przed czasem?
- **Edge case**: co jeśli jest dokładnie 9/16 słów ale np. 3 mają 0 głosów?

### US1.3: Wyświetlanie statusu rundy (#8)
Brakuje:
- **Empty state**: co widzi użytkownik gdy wejdzie na nieistniejącą rundę?
- **Timer UX**: format odliczania (dni:godziny:minuty? "Zostało 2 dni"?)
- **Faza "Zakończona"**: co dokładnie widać na ekranie zakończonej rundy? Wyniki? Statystyki?
- **Przejście między fazami**: czy jest animacja/powiadomienie przy zmianie fazy?
- **Mobile**: jak timer i status wyglądają na małym ekranie?

### US2.1: Zgłaszanie nowego słowa/frazy (#9)
Brakuje:
- **Anonimowość**: czy widać kto zgłosił jakie słowo? (pole `createdBy` jest w DB, ale czy wyświetlane?)
- **Identyfikacja zgłaszającego**: skąd system wie kim jest zgłaszający jeśli nie ma logowania? Cookies? Pytanie o imię?
- **Empty state**: jak wygląda lista gdy nie ma jeszcze żadnych słów?
- **Limit słów na osobę**: czy jest ograniczenie ile słów może zgłosić jedna osoba?
- **Moderacja treści**: co z wulgaryzmami/obraźliwymi treściami? Czy organizator może usuwać słowa?
- **Edycja/usunięcie**: czy zgłaszający może edytować lub usunąć swoje słowo?
- **Feedback wizualny**: toast/animacja po udanym zgłoszeniu

### US2.2: Głosowanie na istniejące słowa (#10)
Brakuje:
- **Identyfikacja głosującego**: jak system wie, że dany użytkownik już głosował? (brak logowania!)
- **Cofnięcie głosu**: czy można cofnąć głos?
- **Limit głosów**: czy jest limit głosów na osobę? Można głosować na wszystko?
- **Głosowanie na własne słowo**: czy można głosować na słowo, które samemu się zgłosiło (poza automatycznym)?
- **Mobile UX**: jak wygląda interakcja głosowania na telefonie (tap target size)?

### US2.3: Wyświetlanie listy słów z liczbą głosów (#11)
Brakuje:
- **Odświeżanie**: jak często lista się aktualizuje? Polling? Real-time?
- **Paginacja/scroll**: co jeśli jest 100+ słów? Infinite scroll? Paginacja?
- **Wyszukiwanie**: czy jest wyszukiwarka wśród słów?
- **Licznik**: "X słów zgłoszonych, potrzeba jeszcze Y" - czy jest wskaźnik postępu?

### US2.4: Automatyczny wybór TOP X słów (#12)
Brakuje:
- **Transparentność**: czy uczestnicy widzą które słowa zostały wybrane a które nie?
- **Nadmiarowe słowa**: co jeśli jest 50 słów a potrzeba 9? Czy niewybranych 41 przepada?
- **Minimalny próg głosów**: czy słowo z 0 głosów może trafić na planszę?

### US3.1: Podanie imienia i otrzymanie planszy (#13)
Brakuje:
- **Kolizja imion**: co się stanie gdy dwóch graczy poda to samo imię? Issue mówi o unikalności ale nie opisuje UX - jaki komunikat błędu?
- **Persystencja sesji**: issue wspomina o cookie/localStorage, ale nie opisuje scenariusza: użytkownik wraca po zamknięciu przeglądarki - czy automatycznie rozpoznaje go po cookie? Czy musi ponownie wpisać imię?
- **Walidacja imienia**: czy tylko litery? Spacje? Emoji? Polskie znaki?
- **Mobile keyboard**: automatyczne focusowanie pola? Typ klawiatury?
- **Wyłączenie możliwości dołączenia po zakończeniu rundy**: co widzi użytkownik gdy runda jest zakończona a on próbuje dołączyć?

### US3.2: Odhaczanie słów na planszy (#14)
Brakuje:
- **Offline/slow network**: co jeśli odhaczenie nie zostanie zapisane (brak sieci)? Optimistic UI?
- **Animacja odhaczenia**: jaki feedback wizualny? Dźwięk?
- **Multi-device**: jeśli gram na telefonie i laptopie jednocześnie, czy odhaczenia się synchronizują?
- **Rozmiar komórek**: jak długie frazy mieszczą się w komórce planszy? Truncation? Font-size?
- **Accessibility**: czy odhaczanie działa z klawiatury? Screen reader?

### US3.3: Wykrywanie bingo (#15)
Brakuje:
- **Wiele bingo**: co jeśli dwóch graczy trafi bingo jednocześnie? Kto jest "pierwszy"?
- **Bingo notification**: jak INNI gracze dowiadują się, że ktoś trafił bingo?
- **Kontynuacja gry**: czy gra kończy się po pierwszym bingo, czy trwa dalej?
- **False bingo prevention**: co zapobiega ręcznemu odhaczeniu wszystkich pól?

### US3.4: Celebracja bingo filmikiem YouTube (#16)
Brakuje:
- **Mobile autoplay**: YouTube autoplay jest blokowane na wielu przeglądarkach mobilnych - jak to obsłużyć?
- **Fallback**: co jeśli filmik jest niedostępny/usunięty z YouTube?
- **Głośność/dźwięk**: gracz jest na spotkaniu - odtworzenie filmiku z dźwiękiem może być katastrofalne! Czy domyślnie muted?
- **Celebracja dla innych graczy**: czy inni widzą czyjeś bingo?
- **Customowy filmik**: czy organizator może ustawić inny filmik?

### US4.1: Wyświetlanie listy uczestników (#17)
**UWAGA - decyzja PO**: Paski postępu (liczba odhaczonych pól, np. "Kasia: 7/16") są **ZAWSZE widoczne** obok imienia gracza na liście uczestników. Podgląd planszy innego gracza jest na żądanie (kliknięcie w imię).

Brakuje:
- **Kolejność listy**: po czym sortowani? Czas dołączenia? Alfabetycznie? Po postępie?
- **Online/offline status**: czy widać kto aktualnie jest online?
- ~~**Postęp graczy**: czy obok imienia widać np. "5/9 odhaczonych"?~~ **ROZWIĄZANE** - postęp zawsze widoczny (decyzja PO)
- **Format postępu**: pasek wizualny? Tekst "7/16"? Oba? Kolor paska?
- **Responsywność**: jak lista wygląda na telefonie? Pod planszą? W bocznym panelu?
- **Aktualizacja postępu**: jak często odświeżany jest postęp innych graczy? Polling? Real-time?

### US4.2: Podgląd planszy innego uczestnika (#18)
**UWAGA - decyzja PO**: Podgląd planszy jest **na żądanie** - kliknięcie w imię gracza na liście. Postęp (liczba odhaczonych) jest zawsze widoczny na liście (patrz US4.1).

Brakuje:
- **Nawigacja**: przycisk "Wróć do mojej planszy" - gdzie dokładnie?
- **Real-time**: czy podgląd jest live (widać gdy ktoś odhacza) czy snapshot?
- **URL**: czy podgląd ma osobny URL (można bookmarkować)?
- **Mobile**: modal vs osobna strona na telefonie?
- **Trigger**: kliknięcie w imię otwiera planszę - czy jest to jasne dla użytkownika? Affordance (np. ikonka "pokaż planszę")?

### US4.3: Dołączanie do rundy w trakcie trwania (#19)
Brakuje:
- **Limit graczy**: czy jest maksymalna liczba graczy? (specyfikacja mówi 3-8)
- **Dołączanie w fazie zbierania słów**: to issue dotyczy fazy gry, ale co z fazą zbierania? Czy każdy może wejść i zgłaszać słowa?
- **Powiadomienie**: czy inni gracze widzą że ktoś dołączył?

### US5.1 - US5.4 (Infrastruktura, #20-#23)
Brakuje:
- **Monitoring/logging**: brak wzmiank o observability
- **Error handling**: brak globalnej strategii obsługi błędów
- **CORS**: konfiguracja CORS dla API
- **Rate limiting**: ochrona przed nadmiernym wywoływaniem API
- **Backup/recovery**: strategia backupu danych DynamoDB

---

## 3. Brakujące user stories

### 3.1 Identyfikacja i sesja użytkownika
**Brak story:** Persystencja sesji gracza
- Jak gracz jest rozpoznawany po powrocie (odświeżenie strony, zamknięcie przeglądarki)?
- Mechanizm: cookie + localStorage? Token?
- Co jeśli gracz wyczyści cookies - traci planszę na zawsze?
- Scenariusz: gracz otwiera link na telefonie, potem na laptopie - co się dzieje?
- **To jest kluczowa luka** - bez logowania identyfikacja gracza jest krytycznym problemem.

### 3.2 Udostępnianie rundy (Share UX)
**Brak story:** Pełny UX udostępniania rundy
- Jak organizator udostępnia rundę? Tylko link? QR code? Kod do wpisania?
- Przycisk "Kopiuj link" z feedbackiem
- Share na mobile (Web Share API?)
- Wyświetlanie shareCode w czytelny sposób (np. "BINGO-A3F2")
- Co widzi osoba, która otwiera link - landing page czy od razu dołączanie?

### 3.3 Moderacja treści
**Brak story:** Organizator jako moderator
- Usuwanie nieodpowiednich słów
- Czy organizator ma jakiekolwiek specjalne uprawnienia?
- Jak identyfikujemy organizatora? (Skoro nie ma logowania)
- Czy organizator może edytować konfigurację rundy po jej utworzeniu?

### 3.4 Ekran zakończonej rundy
**Brak story:** Widok zakończonej rundy
- Co widzi użytkownik gdy runda się skończy?
- Podsumowanie: kto trafił bingo, ile słów odhaczonych przez każdego gracza
- Ranking graczy
- Czy można "zagrać ponownie" (nowa runda z tymi samymi słowami)?
- Jak długo dane rundy są dostępne? (TTL na DynamoDB?)

### 3.5 Strona główna
**Brak story:** UX strony głównej
- Co widzi użytkownik na stronie głównej?
- CTA: "Utwórz nową rundę" + "Dołącz do rundy (wpisz kod)"
- Czy jest lista swoich rund? (potrzebna historia/sesja)
- Jak wygląda strona na mobile vs desktop?

### 3.6 Handling duplikatów słów
**Częściowo w US2.1** (case-insensitive), ale brakuje:
- Co z podobnymi frazami? ("synergies" vs "synergia" vs "synergy")
- Czy system sugeruje istniejące słowa podczas wpisywania? (autocomplete)
- Normalizacja: trimowanie spacji, wielkie/małe litery

### 3.7 Powiadomienia w grze
**Brak story:** System powiadomień
- Ktoś trafił bingo - jak inni się dowiadują?
- Zmiana fazy rundy - jak powiadomić uczestników?
- Nowy uczestnik dołączył
- Mechanizm: polling? WebSocket? Server-Sent Events? Push notifications?

### 3.8 Obsługa błędów i edge cases
**Brak story:** Globalna obsługa błędów
- Co gdy API jest niedostępne?
- Co gdy DynamoDB throttluje?
- Loading states na każdej stronie
- 404 - nieistniejąca runda
- Timeout przy dłuższych operacjach

### 3.9 Accessibility (a11y)
**Brak story:** Dostępność aplikacji
- Nawigacja klawiaturą po planszy bingo
- Screen reader support (aria-labels na komórkach)
- Kontrast kolorów (odhaczone vs nieodhaczone)
- Focus management w modalach
- Reduced motion dla animacji

### 3.10 Onboarding / Pierwsze użycie
**Brak story:** Doświadczenie nowego użytkownika
- Jak nowy użytkownik rozumie o co chodzi w grze?
- Krótki tutorial / instrukcja?
- Tooltip / help text na kluczowych elementach?
- Czy strona główna wyjaśnia zasady?

### 3.11 Performance i UX na wolnym połączeniu
**Brak story:** Optymalizacja na wolne sieci
- Skeleton loading
- Optimistic updates (odhaczanie pól bez czekania na API)
- Offline indicator
- Debounce na formularzach

---

## 4. Edge cases i error handling - szczegółowe scenariusze

### Identyfikacja gracza (KRYTYCZNE)
1. **Gracz A podaje imię "Jan", zamyka przeglądarkę, otwiera ponownie** - jak odzyskuje sesję?
2. **Gracz A podaje "Jan" na telefonie, potem "Jan" na laptopie** - ten sam gracz czy konflikt?
3. **Gracz A podaje "Jan", Gracz B też próbuje "Jan"** - jaki komunikat? Sugestia alternatywy?
4. **Gracz podaje imię w fazie zbierania, potem w fazie gry** - to ten sam gracz?

### Faza zbierania słów
5. **Zgłoszono 5 słów, potrzeba 9 (plansza 3x3)** - faza się przedłuża, ale o ile? Co jeśli nikt więcej nie zgłosi?
6. **Zgłoszono 100 słów** - jak wygląda lista? Scroll? Wydajność?
7. **Dwóch graczy jednocześnie zgłasza to samo słowo** - race condition w sprawdzaniu duplikatów
8. **Gracz zgłasza puste słowo / same spacje** - walidacja?
9. **Gracz głosuje, potem zamyka przeglądarkę i wraca** - czy pamięta na co głosował?

### Faza gry
10. **Gracz odhacza pole przy braku sieci** - czy zmiana jest lokalna i sync później?
11. **Gracz szybko klika wiele pól** - debounce? Kolejka requestów?
12. **Gracz odhacza wszystkie pola ręcznie (cheating)** - czy jest walidacja?
13. **Runda kończy się w trakcie gry** - co widzi gracz? Blokada planszy?
14. **Gracz odświeża stronę planszy** - czy stan jest zachowany?

### Bingo i zakończenie
15. **Dwóch graczy trafia bingo w tej samej sekundzie** - kto jest pierwszy?
16. **Gracz trafia bingo, potem cofa odhaczenie** - czy bingo jest cofnięte?
17. **Filmik YouTube jest niedostępny** - fallback?
18. **Runda kończy się bez żadnego bingo** - co wyświetlić?

### Techniczne
19. **DynamoDB throttling** - retry strategy?
20. **Lambda cold start** - UX przy pierwszym wejściu?
21. **Concurrent writes do tego samego rekordu** - optymistic locking?
22. **ShareCode collision** - jak zapewnić unikalność?

---

## 5. Pytania do Product Ownera

### Kluczowe decyzje biznesowe

1. **Identyfikacja gracza**: Jak dokładnie identyfikujemy gracza bez logowania? Samo imię to za mało - potrzebny jest mechanizm sesji. Czy akceptujemy ryzyko utraty sesji (np. po wyczyszczeniu cookies)?

2. **Rola organizatora**: Czy organizator ma specjalne uprawnienia? Czy może:
   - Usuwać słowa?
   - Ręcznie uruchamiać fazę gry?
   - Kończyć rundę przed czasem?
   - Kickować graczy?

3. **Kontynuacja po bingo**: Czy gra kończy się po pierwszym bingo, czy gracze mogą kontynuować? Czy może być wiele "zwycięzców"?

4. **Limit graczy**: Specyfikacja mówi 3-8 graczy. Czy to twardy limit? Co jeśli 9. osoba chce dołączyć?

5. **Czas życia rundy**: Jak długo dane rundy są przechowywane? Czy stare rundy są automatycznie usuwane (TTL)?

6. **Filmik bingo - audio**: Gracz jest na spotkaniu Teams. Odtworzenie filmiku z dźwiękiem będzie słyszalne dla wszystkich. Czy filmik powinien być domyślnie wyciszony? Czy to w ogóle dobry UX na spotkaniu?

7. **Offline experience**: Czy gra ma działać offline/przy słabym połączeniu? (spotkania w salach konferencyjnych często mają słaby WiFi)

8. **Faza zbierania - identyfikacja**: W fazie zbierania słów nie ma jeszcze "graczy" (imię podaje się w fazie gry). Jak identyfikować osoby zgłaszające słowa i głosujące? To samo pytanie co punkt 1, ale w innej fazie.

9. **Język interfejsu**: Tylko polski? Tylko angielski? Wielojęzyczny? (treść słów bingo jest zwykle po angielsku - corporate buzzwords)

10. **Wielokrotne bingo**: Czy gracz, który trafił bingo w wierszu, dalej gra na kolumnę/przekątną?

11. ~~**Prywatność plansz**: Czy podgląd plansz innych graczy jest zawsze dostępny?~~ **ROZWIĄZANE** - decyzja PO: postęp (liczba odhaczonych pól) jest zawsze widoczny, podgląd pełnej planszy na żądanie (kliknięcie w imię).

12. **Resetowanie planszy**: Czy gracz może poprosić o nowy random shuffle swojej planszy?

---

## Podsumowanie priorytetów

### Krytyczne luki (blokujące MVP)
1. Mechanizm identyfikacji i sesji gracza (brak logowania, a potrzebna persystencja)
2. UX udostępniania rundy (shareCode flow)
3. Obsługa "za mało słów na planszę" (edge case w US1.2)
4. Ekran zakończonej rundy

### Ważne luki (powinny być w MVP)
5. System powiadomień o bingo / zmianie fazy
6. Error states i loading states na wszystkich stronach
7. Responsywny design (mobile-first, bo gra pod stołem na telefonie)
8. Rola i uprawnienia organizatora

### Nice-to-have (po MVP)
9. Accessibility (a11y)
10. Onboarding / instrukcja gry
11. Performance na słabym WiFi
12. Moderacja treści
