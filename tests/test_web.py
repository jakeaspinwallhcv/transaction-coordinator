from pathlib import Path
import sys

# Ensure modules are importable
sys.path.append(str(Path(__file__).resolve().parents[1]))

import app as app_module
import web


def test_web_flow(tmp_path, monkeypatch):
    data_file = tmp_path / "data.json"
    monkeypatch.setattr(app_module, "DATA_FILE", data_file)

    client = web.app.test_client()
    resp = client.post(
        "/create",
        data={"address": "321 Oak", "closing_date": "2024-12-01"},
        follow_redirects=True,
    )
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert "321 Oak" in body
