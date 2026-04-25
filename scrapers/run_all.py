"""Kjører alle skraperne sekvensielt. Brukes av GitHub Actions cron i Fase 9."""

import oda
import meny
import spar


def main() -> None:
    for modul in (oda, meny, spar):
        navn = modul.__name__
        print(f"\n=== Kjører {navn} ===")
        try:
            modul.main()
        except NotImplementedError as e:
            print(f"Hopper over {navn}: {e}")
        except Exception as e:
            print(f"FEIL i {navn}: {e}")
            raise


if __name__ == "__main__":
    main()
