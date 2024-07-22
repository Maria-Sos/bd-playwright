const Imap = require('imap');
require('dotenv').config();
const { simpleParser } = require('mailparser');

const imapConfig = {
  user: process.env.USER_EMAIL,
  password: process.env.USER_PASSWORD,
  host: process.env.HOST,
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  }
};

function fetchLatestEmail() {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    function openInbox(cb) {
      imap.openBox('INBOX', false, cb);
    }

    imap.once('ready', () => {
      console.log('IMAP connection ready');
      openInbox((err, box) => {
        if (err) {
          console.error('Error opening inbox:', err);
          return reject(err);
        }
        imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            console.error('Error searching emails:', err);
            return reject(err);
          }
          if (!results || !results.length) {
            console.error('No unseen emails found');
            return reject('No unseen emails found');
          }
          
          const f = imap.fetch(results, { bodies: '' });

          f.on('message', (msg, seqno) => {
            console.log('Fetching message:', seqno);
            msg.on('body', (stream, info) => {
              simpleParser(stream, (err, parsed) => {
                if (err) {
                  console.error('Error parsing email:', err);
                  return reject(err);
                }
                console.log('Email parsed:', parsed.subject);
                resolve(parsed);
              });
            });
          });

          f.once('end', () => {
            console.log('Done fetching all messages');
            imap.end();
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
}

module.exports = { fetchLatestEmail };