"""Kjører alle skraperne sekvensielt. Brukes av GitHub Actions cron i Fase 9.

Oda blokkerer GitHub Actions sine datacenter-IP-er (svarer 403 Forbidden i skyen),
selv om skraperen funker fint lokalt fra vanlig nett. Vi lar derfor IKKE en enkelt
skraper-feil velte hele jobben: så lenge minst én skraper lyktes, regnes kjøringen
som vellykket. Bare hvis ALLE feiler — typisk database nede eller nett borte —
avsluttes med feilkode, slik at ekte, systemiske problemer fortsatt blir synlige
som en rød kjøring i stedet for å drukne i forventet Oda-støy.
"""

import oda
import meny
import spar


def main() -> None:
    lyktes = []
    feilet = []

    for modul in (oda, meny, spar):
        navn = modul.__name__
        print(f"\n=== Kjører {navn} ===")
        try:
            modul.main()
            lyktes.append(navn)
        except Exception as e:
            print(f"FEIL i {navn}: {e}")
            feilet.append(navn)

    print("\n=== Oppsummering ===")
    print(f"Lyktes: {', '.join(lyktes) or 'ingen'}")
    print(f"Feilet: {', '.join(feilet) or 'ingen'}")

    # Velt jobben bare hvis INGEN skraper lyktes — da er noe systemisk galt.
    # Enkelt-feil (som Oda blokkert i skyen) er forventet og skal ikke gi rød kjøring.
    if not lyktes:
        raise SystemExit(f"Alle skrapere feilet: {', '.join(feilet)}")


if __name__ == "__main__":
    main()
