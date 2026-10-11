#!/usr/bin/env python3
"""Export time in heart rate Zone 3 and above (Z3 + Z4 + Z5) per Garmin Connect activity to a CSV
that the ZoneOut page can import.

Setup (one time):
    python3 -m venv scripts/garmin/.venv
    scripts/garmin/.venv/bin/pip install garminconnect

Run:
    scripts/garmin/.venv/bin/python scripts/garmin/export_zone3plus.py --since 2026-01-01

Your Garmin email/password (and MFA code if enabled) are prompted for interactively and never
written anywhere except Garmin's own token cache at ~/.garminconnect. Output goes to
scripts/garmin/zone3plus.csv (git-ignored).
"""
from __future__ import annotations

import argparse
import csv
import getpass
import os
import sys
import time
from pathlib import Path

from garminconnect import Garmin

TOKENSTORE = "~/.garminconnect"
PAGE_SIZE = 100
MIN_ZONE = 3


def login() -> Garmin:
    store = os.path.expanduser(TOKENSTORE)

    # 1. Reuse cached tokens from a previous run (no prompts).
    try:
        api = Garmin()
        api.login(store)
        return api
    except Exception:
        pass

    # 2. Credential login.
    email = input("Garmin email: ").strip()
    password = getpass.getpass("Garmin password: ")
    if hasattr(Garmin(), "garth"):
        # Older garminconnect (garth backend, Python 3.9): login() takes no path, prompts for MFA itself
        # and does not save tokens, so dump them explicitly.
        api = Garmin(email, password)
        api.login()
        api.garth.dump(store)
    else:
        # Newer garminconnect: login(path) loads or logs in with credentials, and saves tokens.
        api = Garmin(email, password, prompt_mfa=lambda: input("MFA code: ").strip())
        api.login(store)
    return api


def zone3plus_seconds(api: Garmin, activity_id) -> int | None:
    zones = api.get_activity_hr_in_timezones(str(activity_id))
    if not zones:
        return None
    return round(sum(z.get("secsInZone") or 0 for z in zones if (z.get("zoneNumber") or 0) >= MIN_ZONE))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--since", default="1970-01-01", help="only activities on/after this local date (YYYY-MM-DD)")
    parser.add_argument("--out", default=str(Path(__file__).with_name("zone3plus.csv")))
    args = parser.parse_args()

    api = login()
    rows = []
    start = 0
    done = False
    while not done:
        page = api.get_activities(start, PAGE_SIZE)
        if not page:
            break
        for act in page:
            date = (act.get("startTimeLocal") or "")[:10]
            if not date:
                continue
            if date < args.since:
                done = True  # activities come newest-first, so everything after this is older
                break
            try:
                secs = zone3plus_seconds(api, act["activityId"])
            except Exception as e:
                print(f"  skipped {act['activityId']} ({date}): {e}", file=sys.stderr)
                continue
            if secs:
                rows.append(
                    {
                        "activity_id": act["activityId"],
                        "date": date,
                        "name": act.get("activityName") or "",
                        "type": (act.get("activityType") or {}).get("typeKey", ""),
                        "zone3plus_seconds": secs,
                    }
                )
                print(f"{date}  {secs // 60}:{secs % 60:02d}  {act.get('activityName') or ''}")
            time.sleep(0.3)  # be polite to Garmin's servers
        start += PAGE_SIZE

    with open(args.out, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["activity_id", "date", "name", "type", "zone3plus_seconds"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"\nWrote {len(rows)} activities to {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
