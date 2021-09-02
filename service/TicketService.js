require("dotenv").config();
var Ticket = require('../model/Ticket');
var { TelegramBot } = require('../core');

exports.createTicket = function(req) {
    return new Promise(function(resolve, reject) {
      if(!req.body.title) return reject({ message: "Du musst einen Title angeben"});
      if(!req.body.category) return reject({ message: "Du musst eine Kategorie angeben"});
      if(!req.body.question) return reject({ message: "Du musst eine Frage eingeben"});
      if(!req.body.priority) return reject({ message: "Du musst eine Priorität angeben"});
      new Ticket({ telegramid: 0, userid: req.user._id, email: req.user.email, title: req.body.title, category: req.body.category, priority: req.body.priority,
        messages: [{ date: new Date().getTime(), userid: req.user._id, username: req.user.username, role: req.user.role, message: req.body.question  }]}).save()
      .then(ticket => {
        if(ticket) {
          resolve({ticket, message: "Dein Ticket wurde erfolgreich erstellt"});
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
          if(ticket.telegramid != 0) return; 
          TelegramBot.sendMessage(process.env.TELEGRAM_CHATID, 
              "<B>Support-Ticket</B> \n" +
              "\n" +
              "Titel: <B>" + ticket.title + "</B>\n" +
              "Kategorie: <B>" + ticket.category + "</B>\n" +
              "Priorität <B>" + priority + "</B>\n" +
              "\n" + 
              'Link: <B><a href="' + process.env.TELEGRAM_TICKETURL.replace('%id%', ticket._id) + '">Öffnen</a></B>\n' +
              "Status: <B>" + ticket.status + "</B>", { parse_mode: 'html'}).then(msg => {
                  Ticket.findByIdAndUpdate(ticket._id, { telegramid: msg.message_id }).then();
          });
        } else {
          reject();
        }
      });
    });
}

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
          update.status = "Offen";
        }
        Ticket.findByIdAndUpdate(req.params.id, update, {new: true})
        .then(ticket => {
          if(ticket) {
            resolve({ticket, message: "Dein Ticket wurde aktualisiert"})
            if(req.body.message) {
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
                if(ticket.telegramid != 0) return; 
                TelegramBot.sendMessage(process.env.TELEGRAM_CHATID, 
                    "<B>Support-Ticket</B> \n" +
                    "\n" +
                    "Titel: <B>" + ticket.title + "</B>\n" +
                    "Kategorie: <B>" + ticket.category + "</B>\n" +
                    "Priorität <B>" + priority + "</B>\n" +
                    "\n" + 
                    'Link: <B><a href="' + process.env.TELEGRAM_TICKETURL.replace('%id%', ticket._id) + '">Öffnen</a></B>\n' +
                    "Status: <B>" + ticket.status + "</B>", { parse_mode: 'html'}).then(msg => {
                        Ticket.findByIdAndUpdate(req.params.id, { telegramid: msg.message_id }).then();
                });
            }
          } else {
            reject();
          }
        });
    });
}

exports.getTickets = function(req) {
    return new Promise(function(resolve, reject) {
      Ticket.find({ userid: req.user._id })
      .then(tickets => {
          resolve({tickets});
      });
    });
}
