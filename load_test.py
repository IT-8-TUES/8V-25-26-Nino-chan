"""
Load test for the CalTUES backend.

Install deps (outside the backend venv, or inside it):
    pip install httpx

Usage:
    python load_test.py                     # default: 50 requests, 10 concurrent
    python load_test.py --total 200 --concurrency 25
    python load_test.py --base-url http://localhost:5000
"""

import argparse
import asyncio
import statistics
import time

import httpx

BASE_URL = "http://localhost:5000"
TODAY = "2026-05-19"


# ---------------------------------------------------------------------------
# Scenarios — each is (label, method, path, json_body)
# Unauthenticated endpoints only; add a jwt header to HEADERS below if needed.
# ---------------------------------------------------------------------------
SCENARIOS = [
    ("search  – empty query",    "GET",  "/event?title=&user=&page_num=0",  None),
    ("search  – title filter",   "GET",  "/event?title=a&user=&page_num=0", None),
    (f"home   – date {TODAY}",   "GET",  f"/event/{TODAY}",                 None),
]

HEADERS: dict[str, str] = {}


# ---------------------------------------------------------------------------
# Core runner
# ---------------------------------------------------------------------------

async def _one(client: httpx.AsyncClient, method: str, path: str,
               body, base_url: str) -> tuple[float, int | None, str | None, bool]:
    """Returns (elapsed_ms, status_code, error_str, keep_alive)."""
    start = time.perf_counter()
    try:
        r = await client.request(method, base_url + path, json=body)
        elapsed = (time.perf_counter() - start) * 1000
        conn_hdr = r.headers.get("connection", "").lower()
        keep_alive = "keep-alive" in conn_hdr
        return elapsed, r.status_code, None, keep_alive
    except Exception as exc:
        elapsed = (time.perf_counter() - start) * 1000
        return elapsed, None, str(exc), False


async def run_scenario(
    label: str,
    method: str,
    path: str,
    body,
    base_url: str,
    total: int,
    concurrency: int,
) -> None:
    bar = "=" * 62
    print(f"\n{bar}")
    print(f"  {label}")
    print(f"  {method} {path}")
    print(f"  {total} requests  |  concurrency {concurrency}")
    print(bar)

    limits = httpx.Limits(
        max_connections=concurrency,
        max_keepalive_connections=concurrency,
    )

    times: list[float] = []
    errors = 0
    keep_alive_count = 0
    sem = asyncio.Semaphore(concurrency)

    async def bounded(idx: int):
        async with sem:
            return await _one(client, method, path, body, base_url)

    async with httpx.AsyncClient(
        limits=limits,
        timeout=10.0,
        headers=HEADERS,
        http2=False,  # HTTP/1.1 keep-alive — matches Waitress
    ) as client:
        # one warm-up request (not counted)
        await _one(client, method, path, body, base_url)

        wall_start = time.perf_counter()
        results = await asyncio.gather(*[bounded(i) for i in range(total)])
        wall_ms = (time.perf_counter() - wall_start) * 1000

    for i, (elapsed, status, err, ka) in enumerate(results):
        if err:
            errors += 1
            print(f"  [{i:>4}]  ERROR   {err}")
            continue
        if ka:
            keep_alive_count += 1
        flag = ""
        if elapsed >= 200:
            flag = "  << SLOW"
        elif elapsed >= 50:
            flag = "  < check"
        print(f"  [{i:>4}]  {elapsed:7.1f} ms  HTTP {status}  "
              f"{'keep-alive' if ka else 'close      '}{flag}")

    if not times and errors == total:
        print("\n  All requests failed.")
        return

    # collect only successful timings
    times = [elapsed for elapsed, _, err, _ in results if err is None]

    s = sorted(times)
    p95 = s[int(len(s) * 0.95)]
    p99 = s[int(len(s) * 0.99)]

    print(f"""
  ── Summary ──────────────────────────────────────────────
  Requests   : {len(times)} ok, {errors} errors
  Keep-alive : {keep_alive_count}/{len(times)} responses
  Min        : {min(times):.1f} ms
  Mean       : {statistics.mean(times):.1f} ms
  Median     : {statistics.median(times):.1f} ms
  p95        : {p95:.1f} ms
  p99        : {p99:.1f} ms
  Max        : {max(times):.1f} ms
  Wall time  : {wall_ms:.0f} ms
  Throughput : {len(times) / (wall_ms / 1000):.1f} req/s
  ─────────────────────────────────────────────────────────""")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def main(base_url: str, total: int, concurrency: int) -> None:
    for label, method, path, body in SCENARIOS:
        await run_scenario(label, method, path, body, base_url, total, concurrency)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CalTUES backend load tester")
    parser.add_argument("--base-url",    default=BASE_URL, help="Server base URL")
    parser.add_argument("--total",       type=int, default=50,  help="Total requests per scenario")
    parser.add_argument("--concurrency", type=int, default=10,  help="Max concurrent requests")
    args = parser.parse_args()

    jwt = input("JWT token (leave blank to skip): ").strip()
    if jwt:
        HEADERS["jwt"] = jwt

    asyncio.run(main(args.base_url, args.total, args.concurrency))
