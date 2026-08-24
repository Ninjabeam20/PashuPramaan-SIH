import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime

from app.supabase_passports import parse_ppm, passport_dates, product_quantity, qr_verify_url


def test_parse_ppm():
    assert parse_ppm("0.04 ppm") == 0.04
    assert parse_ppm(0.18) == 0.18
    assert parse_ppm(None) is None
    assert parse_ppm("n/a") is None


def test_product_quantity():
    assert product_quantity("Milk") == "250 L"
    assert product_quantity("meat") == "1 carcass"


def test_qr_url_default():
    os.environ.pop("VERIFY_PUBLIC_BASE_URL", None)
    assert qr_verify_url("PP-2026-ABCD") == "http://localhost:3001/verify/PP-2026-ABCD"
    os.environ["VERIFY_PUBLIC_BASE_URL"] = "https://example.test/"
    assert qr_verify_url("PP-2026-ABCD") == "https://example.test/verify/PP-2026-ABCD"
    os.environ.pop("VERIFY_PUBLIC_BASE_URL", None)


def test_passport_dates():
    issued, expiry = passport_dates(datetime(2026, 8, 24))
    assert issued == "2026-08-24"
    assert expiry == "2027-08-24"


if __name__ == "__main__":
    test_parse_ppm()
    test_product_quantity()
    test_qr_url_default()
    test_passport_dates()
    print("passport payload tests passed")
