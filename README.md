# Transaction Coordinator

A minimal command-line tool for real estate professionals to track key tasks after a purchase and sale agreement is executed.

## Features
- Create transactions with property address and closing date.
- Add, complete, and list tasks associated with each transaction.
- Manage tasks through a simple web interface for desktop or mobile browsers.

## Command-line usage
```
python app.py create "123 Main St" 2024-12-01
python app.py add-task TRANSACTION_ID "Schedule inspection" 2024-10-01
python app.py complete-task TRANSACTION_ID 0
python app.py list
```

Transactions persist in `transactions.json` in the working directory.

## Web interface

Install dependencies and start the server:

```
pip install -r requirements.txt
python web.py
```

Then open `http://localhost:5000` to manage transactions in your browser.
