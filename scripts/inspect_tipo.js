const m = require('../src/carrinho');
console.log('TipoVoucher export:', m.TipoVoucher);
console.log('values:', Object.values(m.TipoVoucher));
console.log("includes PERCENTAGE?", Object.values(m.TipoVoucher).includes('PERCENTAGE'));
console.log('typeof values[0]:', typeof Object.values(m.TipoVoucher)[0]);
console.log('All keys:', Object.keys(m.TipoVoucher));
