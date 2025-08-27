from __future__ import annotations

import argparse
import json
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path

DATA_FILE = Path("transactions.json")


@dataclass
class Task:
    description: str
    due_date: str
    completed: bool = False


@dataclass
class Transaction:
    id: str
    property_address: str
    closing_date: str
    tasks: list[Task] = field(default_factory=list)


def load_data(path: Path = DATA_FILE) -> dict[str, Transaction]:
    if path.exists():
        raw = json.loads(path.read_text())
        data: dict[str, Transaction] = {}
        for tid, tr in raw.items():
            tasks = [Task(**task) for task in tr.get("tasks", [])]
            data[tid] = Transaction(tid, tr["property_address"], tr["closing_date"], tasks)
        return data
    return {}


def save_data(data: dict[str, Transaction], path: Path = DATA_FILE) -> None:
    serialisable = {
        tid: {
            "property_address": tr.property_address,
            "closing_date": tr.closing_date,
            "tasks": [asdict(task) for task in tr.tasks],
        }
        for tid, tr in data.items()
    }
    path.write_text(json.dumps(serialisable, indent=2))


def create_transaction(address: str, closing_date: str, path: Path = DATA_FILE) -> Transaction:
    data = load_data(path)
    tid = str(uuid.uuid4())
    tx = Transaction(tid, address, closing_date)
    data[tid] = tx
    save_data(data, path)
    return tx


def add_task(transaction_id: str, description: str, due_date: str, path: Path = DATA_FILE) -> Task:
    data = load_data(path)
    tx = data[transaction_id]
    task = Task(description, due_date)
    tx.tasks.append(task)
    save_data(data, path)
    return task


def complete_task(transaction_id: str, task_index: int, path: Path = DATA_FILE) -> None:
    data = load_data(path)
    tx = data[transaction_id]
    tx.tasks[task_index].completed = True
    save_data(data, path)


def list_transactions(path: Path = DATA_FILE) -> dict[str, Transaction]:
    return load_data(path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Transaction coordination helper")
    sub = parser.add_subparsers(dest="command")

    create_p = sub.add_parser("create", help="Create a new transaction")
    create_p.add_argument("address")
    create_p.add_argument("closing_date")

    add_p = sub.add_parser("add-task", help="Add a task to a transaction")
    add_p.add_argument("transaction_id")
    add_p.add_argument("description")
    add_p.add_argument("due_date")

    complete_p = sub.add_parser("complete-task", help="Mark a task as complete")
    complete_p.add_argument("transaction_id")
    complete_p.add_argument("task_index", type=int)

    sub.add_parser("list", help="List transactions and tasks")

    args = parser.parse_args()

    if args.command == "create":
        tx = create_transaction(args.address, args.closing_date)
        print(f"Created transaction {tx.id} for {tx.property_address}")
    elif args.command == "add-task":
        add_task(args.transaction_id, args.description, args.due_date)
        print("Task added")
    elif args.command == "complete-task":
        complete_task(args.transaction_id, args.task_index)
        print("Task completed")
    elif args.command == "list":
        data = list_transactions()
        for tid, tx in data.items():
            print(f"{tid}: {tx.property_address} (closing {tx.closing_date})")
            for idx, task in enumerate(tx.tasks):
                status = "✅" if task.completed else "⬜"
                print(f"  [{idx}] {status} {task.description} (due {task.due_date})")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
