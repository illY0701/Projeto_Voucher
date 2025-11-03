const { CartItem, Voucher, CartCalculator, TipoVoucher, IllegalArgumentException } = require('../src/carrinho');

describe('Serviço de Cálculo de Carrinho de Compras com Vouchers', () => {
  let calculator;

  beforeEach(() => {
    calculator = new CartCalculator();
  });

  // 1. Teste o cálculo com uma lista de itens, mas sem voucher
  test('Deve calcular o total sem voucher', () => {
    const items = [
      new CartItem('Mouse', 50, 2),
      new CartItem('Teclado', 100, 1)
    ];
    expect(calculator.calculateTotal(items)).toBe(200); // (50 * 2) + (100 * 1)
  });

  // 2. Teste com um voucher de valor fixo que resulta em total positivo
  test('Deve aplicar voucher de valor fixo corretamente', () => {
    const items = [
      new CartItem('Monitor', 1000, 1)
    ];
    const voucher = new Voucher('FIXED100', TipoVoucher.FIXED_AMOUNT, 100);
    expect(calculator.calculateTotal(items, voucher)).toBe(900);
  });

  // 3. Teste com um voucher de valor percentual
  test('Deve aplicar voucher percentual corretamente', () => {
    const items = [
      new CartItem('Mouse', 100, 1),
      new CartItem('Teclado', 100, 1)
    ];
    const voucher = new Voucher('PERC20', TipoVoucher.PERCENTAGE, 20);
    expect(calculator.calculateTotal(items, voucher)).toBe(160); // 200 - (200 * 0.2)
  });

  // 4. Teste caso de borda: desconto maior que subtotal
  test('Deve retornar zero quando desconto fixo é maior que subtotal', () => {
    const items = [
      new CartItem('Mouse', 50, 1)
    ];
    const voucher = new Voucher('FIXED100', TipoVoucher.FIXED_AMOUNT, 100);
    expect(calculator.calculateTotal(items, voucher)).toBe(0);
  });

  // 5. Teste com lista vazia
  test('Deve retornar zero para lista vazia', () => {
    expect(calculator.calculateTotal([])).toBe(0);
  });

  // 6. Teste com lista nula
  test('Deve lançar IllegalArgumentException para lista nula', () => {
    expect(() => calculator.calculateTotal(null))
      .toThrow(IllegalArgumentException);
    expect(() => calculator.calculateTotal(null))
      .toThrow('Lista de itens não pode ser nula');
  });

  // Testes adicionais para validação
  test('Deve validar tipo do voucher', () => {
    expect(() => new Voucher('INVALID', 'INVALID_TYPE', 10))
      .toThrow('Tipo de voucher inválido');
  });

  test('Deve arredondar valores corretamente', () => {
    const items = [
      new CartItem('Produto', 101.00, 1) // Arredondado para 101.00
    ];
    const voucher = new Voucher('PERC10', TipoVoucher.PERCENTAGE, 10);
    // 101.00 - (101.00 * 0.10) = 90.90
    expect(calculator.calculateTotal(items, voucher)).toBe(90.90);
  });
});
