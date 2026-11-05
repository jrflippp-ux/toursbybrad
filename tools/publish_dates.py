"""Publish Brad's open tour dates to dates.json for the "Choose your date" picker.

Reads FREE/BUSY only from his primary Google Calendar (via the gws CLI), never
event titles: that calendar holds medical and family events. Any busy time on a
day closes the whole day (a tour is eight hours). 2nd and 4th Saturdays are
always closed. Only dates go into the public file.

Run daily. Commits and pushes dates.json only when it changes.
Usage: python tools/publish_dates.py [--no-push]
"""
import datetime as dt
import json
import os
import shutil
import subprocess
import sys

DAYS_AHEAD = 365
CHUNK = 60  # freebusy query window, days
JST = dt.timezone(dt.timedelta(hours=9))
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "dates.json")
GWS = shutil.which("gws") or os.path.expanduser("~/.bun/bin/gws.exe")


def busy_intervals(start, end):
    body = {"timeMin": start.isoformat(), "timeMax": end.isoformat(),
            "timeZone": "Asia/Tokyo", "items": [{"id": "primary"}]}
    r = subprocess.run([GWS, "calendar", "freebusy", "query", "--json", json.dumps(body)],
                       capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        sys.exit("gws freebusy failed: " + r.stderr.strip()[-300:])
    cal = json.loads(r.stdout)["calendars"]["primary"]
    if cal.get("errors"):
        sys.exit("freebusy errors: %s" % cal["errors"])
    return [(dt.datetime.fromisoformat(b["start"]).astimezone(JST),
             dt.datetime.fromisoformat(b["end"]).astimezone(JST)) for b in cal.get("busy", [])]


def main():
    today = dt.datetime.now(JST).date()
    last = today + dt.timedelta(days=DAYS_AHEAD)
    closed = set()

    d = today
    while d < last:
        e = min(d + dt.timedelta(days=CHUNK), last)
        for s, f in busy_intervals(dt.datetime.combine(d, dt.time(), JST),
                                   dt.datetime.combine(e, dt.time(), JST)):
            day = s.date()
            stop = (f - dt.timedelta(seconds=1)).date()
            while day <= stop:
                closed.add(day)
                day += dt.timedelta(days=1)
        d = e

    d = today
    while d <= last:
        if d.weekday() == 5 and (d.day - 1) // 7 in (1, 3):  # 2nd / 4th Saturday
            closed.add(d)
        d += dt.timedelta(days=1)

    data = {"from": today.isoformat(), "to": last.isoformat(),
            "closed": sorted(x.isoformat() for x in closed if today <= x <= last)}
    new = json.dumps(data, indent=0) + "\n"
    old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    if new == old:
        print("dates.json unchanged")
        return
    with open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(new)
    print("dates.json updated: %d closed dates" % len(data["closed"]))
    if "--no-push" in sys.argv:
        return
    git = ["git", "-C", REPO]
    subprocess.run(git + ["add", "dates.json"], check=True)
    subprocess.run(git + ["commit", "-q", "-m", "Update open tour dates"], check=True)
    subprocess.run(git + ["push", "-q"], check=True)
    print("pushed")


if __name__ == "__main__":
    main()
