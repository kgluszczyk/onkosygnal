// Central Polish UI strings. The disclaimer is load-bearing — do not weaken it.
export const ui = {
  siteName: 'OnkoSygnał',
  tagline: 'Wiedza, nie diagnoza.',
  skipToContent: 'Przejdź do treści',
  banderola: 'Narzędzie edukacyjne • nie diagnoza',
  disclaimer:
    'To narzędzie edukacyjne, nie diagnoza. Nie oblicza Twojego ryzyka raka — pokazuje, ' +
    'które objawy warto skonsultować z lekarzem POZ i jak. W razie niepokojących objawów ' +
    'zawsze zgłoś się do lekarza. W stanie nagłym zadzwoń pod 112.',
  hero: {
    kicker: 'ONKOSYGNAŁ • WIEDZA, NIE DIAGNOZA',
    title: 'Wsłuchaj się w sygnały. Zrozum je. Działaj spokojnie.',
    lede:
      'OnkoSygnał pomaga rozpoznać objawy alarmowe, poznać Twoje prawo do szybkiej ' +
      'diagnostyki DiLO i bezpłatne badania NFZ. To wiedza, nie diagnoza — spokojny ' +
      'następny krok to rozmowa z lekarzem.',
    emergency: 'Objawy nagłe? Zadzwoń 112 lub zgłoś się na SOR',
  },
  sections: {
    signal: { n: '01', title: 'Sygnał', lead: 'Opisz, co czujesz — własnymi słowami.' },
    context: { n: '02', title: 'Kontekst, nie wyrok' },
    signs: { n: '03', title: 'Objawy alarmowe' },
    dilo: { n: '04', title: 'Masz prawo do DiLO' },
    screening: { n: '05', title: 'Bezpłatne badania NFZ' },
    doctor: { n: '06', title: 'Weź to do lekarza' },
    emergency: { n: '07', title: 'Kiedy nie czekać' },
  },
  search: {
    label: 'Opisz, co czujesz — własnymi słowami',
    placeholder: 'np. „od trzech tygodni chrypka, która nie mija, i chudnę bez powodu”',
    button: 'Sprawdź sygnały',
    atInput: 'To wiedza, nie diagnoza — pokazuje, które objawy warto skonsultować z lekarzem.',
    privacy: 'Nic nie wysyłamy — analiza działa w Twojej przeglądarce.',
    restingHint: 'Wpisz objawy powyżej. Pokażemy spokojne wskazówki i Twoje prawa — bez oceny ryzyka.',
    recognized: 'Rozpoznane sygnały',
    empty: 'Wpisz objawy powyżej, aby zobaczyć spokojne wskazówki.',
    noMatch:
      'Nie rozpoznaliśmy konkretnego objawu alarmowego w Twoim opisie. To nie znaczy, że ' +
      'wszystko jest w porządku — jeśli coś Cię niepokoi lub objawy się utrzymują, skonsultuj ' +
      'się z lekarzem POZ.',
    resultsHeading: 'Rozpoznane sygnały',
    cardHeader: 'Rozpoznano sygnał',
    redFlag: 'Uwaga',
    common: 'Sygnał niespecyficzny',
    emergency: 'Nagły przypadek',
    emergencyBanner:
      'Niektóre z opisanych objawów mogą wymagać natychmiastowej pomocy. W razie stanu ' +
      'nagłego zadzwoń pod 112 lub zgłoś się na SOR.',
    howCommon: 'Jak częsty w Polsce',
    casesPerYear: 'osób rocznie',
    seedNote: 'dane szacunkowe — do weryfikacji',
    context: 'To jak często występuje w Polsce — nie Twoje osobiste ryzyko.',
    ageEmphasis: 'Ten objaw jest szczególnie istotny w Twoim wieku.',
    whatToDo: 'Co zrobić',
    inlineDisclaimer: 'kontekst, nie diagnoza',
  },
  context: {
    heading: 'Dopasuj wyniki',
    optional: 'nieobowiązkowe',
    hint: 'Nie zapisujemy tych danych. Pomagają pokazać właściwy kontekst (np. badania przesiewowe).',
    sex: 'Płeć',
    female: 'Kobieta',
    male: 'Mężczyzna',
    unknown: 'Nie podaję',
    age: 'Wiek',
  },
  screening: {
    heading: 'Bezpłatne badania przesiewowe dla Ciebie',
    intro:
      'Na podstawie płci i wieku możesz kwalifikować się do bezpłatnych badań ' +
      'profilaktycznych na NFZ (bez skierowania).',
    eligible: 'Przysługuje Ci — bezpłatnie w ramach NFZ',
    every: 'co',
    years: 'lata / lat',
    ageRange: 'wiek',
    none: 'Podaj płeć i wiek, aby zobaczyć badania przesiewowe, które Ci przysługują.',
  },
  dilo: {
    heading: 'Masz prawo do szybkiej ścieżki (karta DiLO)',
    quote: 'Podejrzenie nowotworu otwiera Twoje ustawowe prawo do szybkiej diagnostyki.',
    rights: 'Co daje karta DiLO',
    deadlines: 'Ustawowe terminy',
    days: 'dni',
    whatToAsk: 'Co powiedzieć lekarzowi POZ',
  },
  doctor: {
    button: 'Przygotuj podsumowanie dla lekarza',
    print: 'Pobierz / Drukuj podsumowanie',
    heading: 'Podsumowanie do rozmowy z lekarzem',
    generated: 'Wygenerowano',
    yourWords: 'Zgłaszane objawy (Twoimi słowami)',
    symptoms: 'Rozpoznane sygnały',
    questions: 'Sugerowane pytania do lekarza',
    notes: 'Notatki lekarza',
    diloNote: 'Część objawów może kwalifikować do karty DiLO — warto o to zapytać.',
    footer:
      'Wygenerowano przez OnkoSygnał — narzędzie edukacyjne, nie diagnoza ani skierowanie.',
  },
  nav: { home: 'Sygnał', signs: 'Objawy', rights: 'Prawa', screening: 'Badania', about: 'O projekcie' },
  footer:
    'OnkoSygnał to projekt edukacyjny. Nie zbiera danych osobowych i nie zastępuje ' +
    'konsultacji lekarskiej.',
  closing: 'Najważniejszy krok to rozmowa z lekarzem. To narzędzie ma Ci ją ułatwić.',
} as const;
