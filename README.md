# (jada, alt her er AI generert)
``` ikke tenkt å hostes noe sted, kjør lokalt```

# EHF Faktura Generator

En norsk EHF fakturagenerator bygget med Next.js og Tailwind CSS.

## Funksjoner

- ✓ Administrer avsendere (organisasjoner og personer)
- ✓ Administrer mottakere (organisasjoner og personer)
- ✓ Import av firmaopplysninger fra Brønnøysundregistrene
- ✓ Opprett fakturaer i norsk EHF-format
- ✓ Generer og last ned PDF-fakturaer direkte
- ✓ Støtte for norsk og engelsk språk
- ✓ Responsiv design for mobil og desktop
- ✓ Lokal JSON-lagring (ingen database nødvendig)

## Installasjon

1. Installer avhengigheter:
```bash
npm install
```

2. Start utviklingsserveren:
```bash
npm run dev
```

3. Åpne nettleseren på [http://localhost:3000](http://localhost:3000)

## Bruk

1. **Avsendere**: Legg til din bedrift eller personlige informasjon
2. **Mottakere**: Legg til kunder ved å søke i Brønnøysundregistrene eller manuelt
3. **Ny Faktura**: Opprett fakturaer og last ned som PDF

## Datalagring

Alle data lagres lokalt i `/data`-mappen som JSON-filer:
- `senders.json` - Avsendere
- `receivers.json` - Mottakere
- `invoices.json` - Fakturaer (metadata)

PDF-filer genereres on-the-fly og lastes ned direkte uten å bli lagret på serveren.

## Bygg for produksjon

```bash
npm run build
npm start
```

## Teknologi

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- jsPDF (PDF-generering)
- Brønnøysundregistrene API
