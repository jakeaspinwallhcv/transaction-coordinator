from __future__ import annotations

from flask import Flask, redirect, render_template, request, url_for

from app import add_task, complete_task, create_transaction, list_transactions

app = Flask(__name__)


@app.get("/")
def index():
    transactions = list_transactions()
    return render_template("index.html", transactions=transactions)


@app.post("/create")
def create():
    address = request.form["address"]
    closing_date = request.form["closing_date"]
    create_transaction(address, closing_date)
    return redirect(url_for("index"))


@app.post("/<transaction_id>/add-task")
def add_task_route(transaction_id: str):
    description = request.form["description"]
    due_date = request.form["due_date"]
    add_task(transaction_id, description, due_date)
    return redirect(url_for("index"))


@app.post("/<transaction_id>/<int:task_index>/complete")
def complete_task_route(transaction_id: str, task_index: int):
    complete_task(transaction_id, task_index)
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run()
