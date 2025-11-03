// Tipo do voucher: percentual ou valor fixo
const TipoVoucher = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
};

// CartItem: representa um item no carrinho com preço e quantidade
class CartItem {
  constructor(name, price, quantity) {
    this.name = name;
    this.price = price;
    this.quantity = quantity;
  }
}

// Voucher: cupom de desconto com tipo (percentual ou fixo) e valor
class Voucher {
  constructor(code, type, value) {
    if (!Object.values(TipoVoucher).includes(type)) {
      throw new Error('Tipo de voucher inválido');
    }
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      throw new Error('Valor do voucher inválido');
    }
    if (type === TipoVoucher.PERCENTAGE && value > 100) {
      throw new Error('Porcentagem não pode ser maior que 100%');
    }
    this.code = code;
    this.type = type;
    this.value = value;
  }
}

// CartCalculator: calcula o total do carrinho aplicando descontos do voucher
class CartCalculator {
  // Calcula o total dos itens aplicando voucher se fornecido
  calculateTotal(items, voucher = null) {
    if (items === null) {
      throw new IllegalArgumentException('Lista de itens não pode ser nula');
    }

    if (items.length === 0) {
      return 0;
    }

    // Calcula subtotal (soma de price * quantity de todos os itens)
    const subtotal = items.reduce((total, item) => 
      total + parseFloat((item.price * item.quantity).toFixed(2)), 0);

    // Se não há voucher, retorna o subtotal
    if (!voucher) {
      return Number(subtotal.toFixed(2));
    }

    // Aplica desconto baseado no tipo do voucher
    let discount = 0;
    if (voucher.type === TipoVoucher.FIXED_AMOUNT) {
      discount = voucher.value;
    } else { // PERCENTAGE
      // Calcula o desconto com precisão de 2 casas decimais
      discount = parseFloat((subtotal * voucher.value / 100).toFixed(2));
    }

    // Garante que o total não seja negativo
    const total = Math.max(0, parseFloat((subtotal - discount).toFixed(2)));
    return total;
  }
}

// Erro customizado para argumentos inválidos
class IllegalArgumentException extends Error {
  constructor(message) {
    super(message);
    this.name = 'IllegalArgumentException';
  }
}

module.exports = { 
  CartItem,
  Voucher,
  CartCalculator,
  TipoVoucher,
  IllegalArgumentException
};
