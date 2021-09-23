require("dotenv").config();
var User = require('../../model/User');
var Invoice = require('../../model/Invoice');
var { PayPal } = require('../../core');

PayPal.configure({
    'mode': process.env.PAYPAL_MODE,
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET,
})

exports.getURL = function(req) {
    return new Promise(function(resolve, reject) {
        if(!req.query.amount) return reject({ message: "Der Betrag muss eine Zahl sein" });
        if(isNaN(req.query.amount.replace(",", "."))) return reject({ message: "Der Betrag muss eine Zahl sein" });
        var amount = parseFloat(req.query.amount.replace(",", ".")).toFixed(2);

        var payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": process.env.PAYPAL_RETURN_URL,
                "cancel_url": process.env.PAYPAL_RETURN_URL
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Guthaben ShadeHost",
                        "price": amount,
                        "currency": "EUR",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "EUR",
                    "total": amount
                },
                "description": "Das ist eine Test Bestellung."
            }]
        };

        PayPal.payment.create(payment_json, (error, payment) => {
            if (error) return reject(error);
            const url = payment.links.find(i => i.rel == 'approval_url').href;
            resolve({ url });
        });
    });
}


exports.chargeUser = function(req) {
    return new Promise(function(resolve, reject) {
        if(!req.body.payerid) return reject({ message: "Die Zahlung ist fehlgeschlagen" });
        if(!req.body.paymentid) return reject({ message: "Die Zahlung ist fehlgeschlagen" });
        const payerId = req.body.payerid;
        const paymentId = req.body.paymentid;

        var execute_payment_json = {
            "payer_id": payerId
        };

        PayPal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                return reject(error);
            } else {
                resolve({ message: "Dein Konto wurde erfolgreich aufgeladen" })
                Invoice.findOne({ serviceid: payment.id })
                .then(result => {
                    if(!result) {
                        new Invoice({ user: req.user, userid: req.user._id, serviceid: payment.id, method: 'PayPal', amount: payment.transactions[0].amount.total, status: 'Bezahlt', data: JSON.stringify(payment) }).save()
                        .then();
                        User.findByIdAndUpdate(req.user._id, { balance: Number(Number(req.user.balance) + Number(payment.transactions[0].amount.total)) }).then();
                    }
                });
            }
        });
    });
}
