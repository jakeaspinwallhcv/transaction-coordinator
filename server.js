const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_FILE = path.join(__dirname, 'data', 'transactions.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const CONTRACT_DIR = path.join(__dirname, 'data', 'contracts');

function readTransactions() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeTransactions(transactions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 2));
}

function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, decodeURI(urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(content);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/contracts') && req.method === 'POST') {
    try {
      const { name, content } = await parseBody(req);
      const raw = Buffer.from(content || '', 'base64').toString('utf8');
      const details = JSON.parse(raw);
      let transactions = readTransactions();
      const tx = { id: randomUUID(), property: details.property || '', buyer: details.buyer || '', seller: details.seller || '', tasks: [] };
      transactions.push(tx);
      writeTransactions(transactions);
      fs.mkdirSync(CONTRACT_DIR, { recursive: true });
      fs.writeFileSync(path.join(CONTRACT_DIR, `${tx.id}-${name || 'contract.txt'}`), raw);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(tx));
    } catch (err) {
      res.writeHead(400);
      return res.end('Invalid contract');
    }
  }

  if (req.url.startsWith('/api/transactions')) {
    const parts = req.url.split('/').filter(Boolean); // ['api', 'transactions', id?, 'tasks', taskId?]
    const method = req.method;
    let transactions = readTransactions();

    if (parts.length === 2 && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(transactions));
    }

    if (parts.length === 2 && method === 'POST') {
      try {
        const data = await parseBody(req);
        const tx = { id: randomUUID(), property: data.property || '', buyer: data.buyer || '', seller: data.seller || '', tasks: [] };
        transactions.push(tx);
        writeTransactions(transactions);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(tx));
      } catch (err) {
        res.writeHead(400);
        return res.end('Invalid JSON');
      }
    }

    if (parts.length === 4 && parts[2] && parts[3] === 'tasks' && method === 'POST') {
      try {
        const data = await parseBody(req);
        const tx = transactions.find(t => t.id === parts[2]);
        if (!tx) {
          res.writeHead(404); return res.end('Transaction not found');
        }
        const task = { id: randomUUID(), description: data.description || '', dueDate: data.dueDate || '', completed: false };
        tx.tasks.push(task);
        writeTransactions(transactions);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(task));
      } catch (err) {
        res.writeHead(400); return res.end('Invalid JSON');
      }
    }

    if (parts.length === 5 && parts[3] === 'tasks' && method === 'PATCH') {
      const tx = transactions.find(t => t.id === parts[2]);
      if (!tx) { res.writeHead(404); return res.end('Transaction not found'); }
      const task = tx.tasks.find(t => t.id === parts[4]);
      if (!task) { res.writeHead(404); return res.end('Task not found'); }
      task.completed = !task.completed;
      writeTransactions(transactions);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(task));
    }

    res.writeHead(404);
    return res.end('Not found');
  }

  // static files
  serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

