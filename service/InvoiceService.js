require("dotenv").config();
var Invoice = require('../model/Invoice');
var { PDF, FS } = require('../core');

var Default_INVOICE = "";
FS.readFile("./templates/pdf/Invoice.html", (error, data) => {
    if(error) {
        throw error;
    }
    Default_INVOICE = data.toString();
});

exports.showInvoice = function(req, res) {
    return new Promise(function(resolve, reject) {
        Invoice.findById(req.params.id)
        .then(result => {
            if(!result) return reject({ message: "Invoice wurde nicht gefunden" })
            var amount = parseFloat(JSON.stringify(result.amount).replace(/"/g, ''));
            var timestamp = Number(JSON.stringify(result.created).replace(/"/g, ''));

            var Invoice = Default_INVOICE
                .replace(/%username%/g, result.user.username)
                .replace(/%email%/g, result.user.email)
                .replace(/%uuid%/g, result._id)
                .replace(/%product%/g, result.product)
                .replace(/%paymethod%/g, result.method)
                .replace(/%date%/g, new Date(timestamp).toLocaleString('de-DE'))
                .replace(/%amount%/g, amount.toFixed(2))
                .replace(/%vat%/g, (amount - (amount / 1.19)).toFixed(2))
                .replace(/%netprice%/g, (amount / 1.19).toFixed(2))

            
            PDF.create(Invoice).toStream((err, pdfStream) => {
                if (err) {   
                return res.sendStatus(500);
                } else {
                    res.setHeader('Content-type', 'application/pdf');
                res.statusCode = 200             
                pdfStream.on('end', () => {
                    return res.end();
                })
                pdfStream.pipe(res);
                }
            })
        }).catch(error => {
            return reject(error);
        })
    });
}

exports.getInvoices = function(req, res) {
    return new Promise(function(resolve, reject) {
        Invoice.find({ userid: req.user._id })
        .then(result => {
            var invoices = [];
            result.forEach(invoice => {
                invoice.user = undefined;
                invoice.data = undefined;
                invoices.push(invoice);
            });
            resolve({invoices});
        });
    });
}
