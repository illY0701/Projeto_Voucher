const express = require('express');
const path = require('path');
const { CartItem, Voucher, CartCalculator, TipoVoucher } = require('./src/carrinho');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const calculator = new CartCalculator();
let items = [];

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.delete('/api/items/:index', (req, res) => {
  const idx = Number(req.params.index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= items.length) {
    return res.status(400).json({ error: 'Índice inválido' });
  }
  const removed = items.splice(idx, 1)[0];
  res.json({ ok: true, removed });
});

app.post('/api/add-product', (req, res) => {
  const { nome: name, preco: price, quantidade } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'nome e preco são obrigatórios' });
  const qty = quantidade == null ? 1 : Number(quantidade);
  if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ error: 'quantidade inválida' });
  const item = new CartItem(name, Number(price), qty);
  items.push(item);
  res.json({ ok: true, item });
});

let currentVoucher = null;

app.post('/api/apply-voucher', (req, res) => {
  const { code, type, value } = req.body;
  console.log('[apply-voucher] received body:', req.body);
  try {
    currentVoucher = new Voucher(code, type, Number(value));
    res.json({ ok: true, voucher: currentVoucher });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/total', (req, res) => {
  const total = calculator.calculateTotal(items, currentVoucher);
  res.json({ total });
});

app.post('/api/reset', (req, res) => {
  items = [];
  currentVoucher = null;
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
