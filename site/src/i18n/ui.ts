// Central Polish UI strings. The disclaimer is load-bearing — do not weaken it.
export const ui = {
  siteName: 'OnkoSygnał',
  tagline: 'Które objawy warto skonsultować z lekarzem?',
  skipToContent: 'Przejdź do treści',
  disclaimer:
    'To narzędzie edukacyjne, nie diagnoza. Nie oblicza Twojego ryzyka raka — pokazuje, ' +
    'które objawy warto skonsultować z lekarzem POZ i jak. W razie niepokojących objawów ' +
    'zawsze zgłoś się do lekarza. W stanie nagłym zadzwoń pod 112.',
  search: {
    label: 'Opisz swoje objawy własnymi słowami',
    placeholder: 'np. „od trzech tygodni mam kaszel i chudnę bez powodu”',
    button: 'Sprawdź',
    empty: 'Wpisz objawy, aby zobaczyć wskazówki.',
    noMatch:
      'Nie rozpoznaliśmy konkretnego objawu alarmowego w Twoim opisie. To nie znaczy, że ' +
      'wszystko jest w porządku — jeśli coś Cię niepokoi lub objawy się utrzymują, skonsultuj ' +
      'się z lekarzem POZ.',
    resultsHeading: 'Objawy warte konsultacji',
    redFlag: 'Objaw alarmowy',
    common: 'Objaw niespecyficzny',
    emergency: 'Stan nagły',
    emergencyBanner: 'Niektóre z opisanych objawów mogą wymagać natychmiastowej pomocy. W razie stanu nagłego zadzwoń pod 112 lub zgłoś się na SOR.',
    howCommon: 'Jak częsty w Polsce',
    casesPerYear: 'nowych zachorowań rocznie',
    seedNote: 'dane szacunkowe (KRN) — do weryfikacji',
    context: 'To liczba zachorowań w całej populacji — nie Twoje osobiste ryzyko.',
    ageEmphasis: 'Ten objaw jest szczególnie istotny w Twoim wieku.',
    whatToDo: 'Co zrobić',
    source: 'Źródło',
  },
  context: {
    heading: 'Opcjonalnie: dopasuj wyniki',
    hint: 'Nie zapisujemy tych danych. Pomagają jedynie pokazać właściwy kontekst (np. badania przesiewowe).',
    sex: 'Płeć',
    female: 'Kobieta',
    male: 'Mężczyzna',
    unknown: 'Nie podaję',
    age: 'Wiek',
  },
  screening: {
    heading: 'Bezpłatne badania przesiewowe dla Ciebie',
    intro: 'Na podstawie płci i wieku możesz kwalifikować się do bezpłatnych badań profilaktycznych na NFZ (bez skierowania).',
    every: 'co',
    years: 'lata / lat',
    ageRange: 'wiek',
    none: 'Podaj płeć i wiek powyżej, aby zobaczyć badania przesiewowe, które Ci przysługują.',
  },
  doctor: {
    button: 'Przygotuj podsumowanie dla lekarza',
    print: 'Drukuj / zapisz PDF',
    heading: 'Podsumowanie dla lekarza POZ',
    generated: 'Wygenerowano',
    yourWords: 'Opis pacjenta',
    symptoms: 'Objawy warte omówienia',
    diloNote: 'Część objawów może kwalifikować do karty DiLO (szybka ścieżka onkologiczna) — warto o to zapytać.',
    footer: 'Dokument wygenerowany przez OnkoSygnał — narzędzie edukacyjne. To NIE jest dokument medyczny, diagnoza ani skierowanie.',
  },
  dilo: {
    heading: 'Masz prawo do szybkiej ścieżki (karta DiLO)',
    rights: 'Co daje karta DiLO',
    deadlines: 'Ustawowe terminy',
    days: 'dni',
    whatToAsk: 'Co powiedzieć lekarzowi POZ',
  },
  nav: {
    home: 'Start',
    about: 'O projekcie',
  },
  footer:
    'OnkoSygnał to projekt edukacyjny. Nie zbiera danych osobowych i nie zastępuje ' +
    'konsultacji lekarskiej. Treści oparte na publicznych źródłach (KRN, Narodowy Portal ' +
    'Onkologiczny, NICE NG12).',
} as const;
