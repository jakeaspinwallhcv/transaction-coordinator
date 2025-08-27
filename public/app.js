async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function loadTransactions() {
  const data = await fetchJSON('/api/transactions');
  const container = document.getElementById('transactions');
  container.innerHTML = '';
  data.forEach(tx => container.appendChild(renderTransaction(tx)));
}

function renderTransaction(tx) {
  const wrapper = document.createElement('div');
  wrapper.className = 'transaction';
  wrapper.dataset.id = tx.id;

  const title = document.createElement('h3');
  title.textContent = `${tx.property}`;
  const parties = document.createElement('p');
  parties.textContent = `${tx.buyer} ↔ ${tx.seller}`;
  wrapper.appendChild(title);
  wrapper.appendChild(parties);

  const list = document.createElement('div');
  tx.tasks.forEach(task => list.appendChild(renderTask(task, tx.id)));
  wrapper.appendChild(list);

  const form = document.createElement('form');
  form.innerHTML = `
    <input type="text" name="description" placeholder="New Task" required />
    <input type="date" name="dueDate" />
    <button type="submit">Add Task</button>
  `;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = { description: formData.get('description'), dueDate: formData.get('dueDate') };
    const task = await fetchJSON(`/api/transactions/${tx.id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    list.appendChild(renderTask(task, tx.id));
    form.reset();
  });
  wrapper.appendChild(form);

  return wrapper;
}

function renderTask(task, txId) {
  const div = document.createElement('div');
  div.className = 'task' + (task.completed ? ' completed' : '');
  const span = document.createElement('span');
  span.textContent = `${task.description}` + (task.dueDate ? ` (due ${task.dueDate})` : '');
  div.appendChild(span);
  const btn = document.createElement('button');
  btn.textContent = task.completed ? 'Undo' : 'Done';
  btn.addEventListener('click', async () => {
    const updated = await fetchJSON(`/api/transactions/${txId}/tasks/${task.id}`, { method: 'PATCH' });
    div.classList.toggle('completed', updated.completed);
    btn.textContent = updated.completed ? 'Undo' : 'Done';
  });
  div.appendChild(btn);
  return div;
}

document.getElementById('transaction-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const property = document.getElementById('property').value;
  const buyer = document.getElementById('buyer').value;
  const seller = document.getElementById('seller').value;
  const tx = await fetchJSON('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property, buyer, seller })
  });
  document.getElementById('transactions').appendChild(renderTransaction(tx));
  e.target.reset();
});

document.getElementById('contract-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('contract-file');
  if (!fileInput.files.length) return;
  const file = fileInput.files[0];
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const content = btoa(binary);
  const tx = await fetchJSON('/api/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, content })
  });
  document.getElementById('transactions').appendChild(renderTransaction(tx));
  e.target.reset();
});

loadTransactions();
