"""Kjører alle skraperne sekvensielt. Brukes av GitHub Actions cron i Fase 9."""

import oda
import meny
import spar


def main() -> None:
    failed = []
    for modul in (oda, meny, spar):
        navn = modul.__name__
        print(f"\n=== Kjører {navn} ===")
        try:
            modul.main()
        except Exception as e:
            print(f"FEIL i {navn}: {e}")
            failed.append(navn)
    if failed:
        # La andre skrapere kjøre, men marker hele jobben som feilet
        raise SystemExit(f"Skraping feilet for: {', '.join(failed)}")


if __name__ == "__main__":
    main()
