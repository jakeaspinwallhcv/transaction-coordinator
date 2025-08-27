from pathlib import Path
import sys

# Ensure the application module is importable
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app import add_task, complete_task, create_transaction, list_transactions


def test_transaction_flow(tmp_path: Path) -> None:
    data_file = tmp_path / "data.json"
    tx = create_transaction("123 Main St", "2024-12-01", data_file)
    add_task(tx.id, "Schedule inspection", "2024-10-01", data_file)
    complete_task(tx.id, 0, data_file)
    data = list_transactions(data_file)
    assert tx.id in data
    assert data[tx.id].tasks[0].completed is True
