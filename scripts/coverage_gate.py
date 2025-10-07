"""Simple coverage gate script enforcing minimum percentage."""
from __future__ import annotations

import sys
import xml.etree.ElementTree as ET


MINIMUM_COVERAGE = 80.0


def main(path: str = "coverage.xml") -> int:
    try:
        tree = ET.parse(path)
    except FileNotFoundError:
        print(f"Coverage report not found at {path}", file=sys.stderr)
        return 1

    root = tree.getroot()
    line_rate = root.get("line-rate")
    if line_rate is None:
        print("coverage.xml missing line-rate attribute", file=sys.stderr)
        return 1

    coverage_pct = float(line_rate) * 100
    if coverage_pct < MINIMUM_COVERAGE:
        print(
            f"Coverage {coverage_pct:.2f}% is below required {MINIMUM_COVERAGE:.2f}%",
            file=sys.stderr,
        )
        return 1

    print(f"Coverage gate passed at {coverage_pct:.2f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
