// Helper: faz requisições JSON para a API do carrinho
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

// Helper: atalho para document.getElementById
function el(id) { return document.getElementById(id); }

// Atualiza a lista de itens do carrinho na interface
async function refreshItems() {
  const items = await api('/api/items');
  const ul = el('lista-itens');
  ul.innerHTML = '';
  items.forEach((i, idx) => {
    const li = document.createElement('li');
    li.textContent = `${i.name} (Qtd: ${i.quantity}) — R$ ${Number(i.price).toFixed(2)}`;

    const btn = document.createElement('button');
    btn.textContent = '✖';
    btn.title = 'Remover item';
    btn.className = 'delete-btn';
    btn.addEventListener('click', async () => {
      const ok = confirm(`Confirma remover "${i.name}" do carrinho?`);
      if (!ok) return;
      const res = await api(`/api/items/${idx}`, { method: 'DELETE' });
      if (res.error) return showMsg(res.error, true);
      await refreshItems();
      await showTotal();
      showMsg('Item removido');
    });

    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// Atualiza o total do carrinho na interface
async function showTotal() {
  const { total } = await api('/api/total');
  el('saida-total').textContent = `Total: R$ ${Number(total).toFixed(2)}`;
}

// Exibe mensagem temporária de sucesso/erro (some após 3s)
function showMsg(txt, isError = false) {
  const m = el('mensagem');
  m.textContent = txt;
  m.className = isError ? 'msg error' : 'msg success';
  setTimeout(() => { m.textContent = ''; m.className = 'msg'; }, 3000);
}

// Inicializa handlers de eventos quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  // Handler: adiciona novo produto ao carrinho
  el('btn-adicionar').addEventListener('click', async () => {
    const nome = el('produto-nome').value.trim();
    const preco = el('produto-preco').value;
    const quantidadeRaw = el('produto-quantidade') ? el('produto-quantidade').value : '1';
    const quantidade = Number(quantidadeRaw);
    if (!nome || preco === '') return showMsg('Nome e preço são obrigatórios', true);
    if (!Number.isInteger(quantidade) || quantidade < 1) return showMsg('Quantidade deve ser inteiro maior ou igual a 1', true);
    const res = await api('/api/add-product', { method: 'POST', body: { nome, preco, quantidade } });
    if (res.error) return showMsg(res.error, true);
    el('produto-nome').value = '';
    el('produto-preco').value = '';
    if (el('produto-quantidade')) el('produto-quantidade').value = '1';
    await refreshItems();
    showMsg('Produto adicionado');
  });

  // Handler: aplica voucher de desconto ao carrinho
  el('btn-aplicar').addEventListener('click', async () => {
    const code = el('voucher-codigo').value.trim();
    const type = el('voucher-tipo').value;
      let value = parseFloat(el('voucher-valor').value);
    if (!code || !type || value === '') return showMsg('Preencha todos os campos do voucher', true);
      if (isNaN(value) || value <= 0) return showMsg('Valor do voucher inválido', true);
      if (type === 'PERCENTAGE' && value > 100) return showMsg('Porcentagem não pode ser maior que 100%', true);
    const res = await api('/api/apply-voucher', { method: 'POST', body: { code, type, value } });
    if (res.error) return showMsg(res.error, true);
    showMsg('Voucher aplicado');
    await showTotal();
  });

  // Handler: força atualização do total
  el('btn-total').addEventListener('click', async () => {
    await showTotal();
  });

  // Handler: reseta o carrinho (remove todos os itens) após confirmação
  el('btn-reset').addEventListener('click', async () => {
    const ok = confirm('Confirma resetar o carrinho? Esta ação removerá todos os itens.');
    if (!ok) return;
    await api('/api/reset', { method: 'POST' });
    await refreshItems();
    await showTotal();
    showMsg('Carrinho resetado');
  });

  // Carrega estado inicial do carrinho
  refreshItems();
  showTotal();
});
