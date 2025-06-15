const PDFDocument = require('pdfkit');

const generateOrderReceiptPDF = async (order, cartItems) => {
  if (!order || !cartItems || cartItems.length === 0) {
    throw new Error('Invalid data: order or cart items are missing');
  }

  const doc = new PDFDocument();
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => console.log('PDF generated successfully'));

  // Start writing the PDF
  doc.fontSize(16).text('Order Receipt', { align: 'center' });
  doc.moveDown();
  doc.text(`Order ID: ${order.id}`);
  doc.text(`Date: ${order.createdAt}`);
  doc.text(`Total Amount: $${order.totalAmount.toFixed(2)}`);
  doc.text(`Shipping Address: ${order.shippingAddress}`);
  doc.moveDown();

  // Add cart items
  doc.text('Items:');
  cartItems.forEach((item) => {
    doc.text(`- ${item.Product.name}: $${item.Product.price} x ${item.quantity} = $${item.subtotal}`);
  });

  doc.end();
  return Buffer.concat(buffers);
};

module.exports = generateOrderReceiptPDF;

