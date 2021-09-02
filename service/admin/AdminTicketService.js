require("dotenv").config();
var Ticket = require('../../model/Ticket');
var { TelegramBot } = require('../../core');

exports.updateTicket = function(req) {
    return new Promise(function(resolve, reject) {
        var update = {};
        if(req.body.closed || req.body.closed == false)
          update.closed = req.body.closed;
          if(req.body.closed == true) {
            update.status = "Geschlossen";
          } else {
            update.status = "Offen";
          }
        if(req.body.message) {
          update = { $addToSet: { messages: { date: new Date().getTime(), userid: req.user._id, username: req.user.username, role: req.user.role, message: req.body.message  }  } };
          update.status = "Beantwortet";
        }
        Ticket.findByIdAndUpdate(req.params.id, update, {new: true})
        .then(ticket => {
          if(ticket) {
            resolve({ticket, message: "Dein Ticket wurde aktualisiert"});
            var priority;
            switch(ticket.priority) {
                case 1:
                    priority = "Niedrig"
                    break;
                 case 1:
                    priority = "Mittel"
                    break;
                case 1:
                    priority = "Hoch"
                    break;

            }
            TelegramBot.editMessageText(
                "<B>Support-Ticket</B> \n" +
                "\n" +
                "Titel: <B>" + ticket.title + "</B>\n" +
                "Kategorie: <B>" + ticket.category + "</B>\n" +
                "Priorität <B>" + priority + "</B>\n" +
                "\n" + 
                'Link: <B><a href="' + process.env.TELEGRAM_TICKETURL.replace('%id%', ticket._id) + '">Öffnen</a></B>\n' +
                "Status: <B>" + ticket.status + "</B>", {
                chat_id: process.env.TELEGRAM_CHATID,
                message_id: ticket.telegramid,
                parse_mode: 'html'
            });
            
            Ticket.findByIdAndUpdate(req.params.id, { telegramid: 0 }).then();
          } else {
            reject();
          }
        });
    });
}

exports.getTickets = function(req) {
    return new Promise(function(resolve, reject) {
      Ticket.find()
      .then(tickets => {
          resolve({tickets});
      });
    });
}
