const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
require('dotenv').config();

const dbFile = 'emails.db';
const credentials = require('./credentials.json');
const gmailAcct = credentials.HANNAH;

// Function to initialize SQLite database
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

// Function to create the sent_emails table if it doesn't exist
async function createTableIfNotExists(db) {
  return new Promise((resolve, reject) => {
    const query = `CREATE TABLE IF NOT EXISTS sent_emails (
      id INTEGER PRIMARY KEY,
      sender_email TEXT,
      recipient_email TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;    
    db.run(query, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


// Function to execute SQLite queries
async function runQuery(db, query, params) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Function to check if email was sent within a specific timeframe
async function checkSentEmail(db, senderEmail, recipientEmail, timeframeInMinutes) {
  const thresholdTime = new Date(Date.now() - timeframeInMinutes * 60000).toISOString();
  const query = `SELECT COUNT(*) AS count FROM sent_emails WHERE sender_email = ? AND recipient_email = ? AND timestamp >= ?`;
  const row = await runQuery(db, query, [senderEmail, recipientEmail, thresholdTime]);
  return row.count > 0;
}

// Function to record sent email in the database
async function recordSentEmail(db, senderEmail, recipientEmail) {
  const query = `
    INSERT OR IGNORE INTO sent_emails (sender_email, recipient_email)
    VALUES (?, ?)`;
  await runQuery(db, query, [senderEmail, recipientEmail]);

  const updateQuery = `
    UPDATE sent_emails
    SET timestamp = CURRENT_TIMESTAMP
    WHERE sender_email = ? AND recipient_email = ?`;
  await runQuery(db, updateQuery, [senderEmail, recipientEmail]);
}

// Function to send emails
async function sendEmails(db, transporter, senderEmail, emailList, mailOptions) {
  for (const email of emailList) {
    try {
      // Check if the email exists in the database
      const emailExists = await checkSentEmail(db, senderEmail, email, 4320);
      if (emailExists || ['tom@slocalroots.store' || 'th.chi@aol.com' || 'info@cloverdalewellness.org'].includes(email)) {
        console.log(`Email already sent to ${email} within the timeframe.`);
        continue; // Skip sending the email if it already exists
      }

      // If the email doesn't exist, send the email
      mailOptions.to = email;
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email}:`, info.response);
      
      // Record the sent email in the database
      await recordSentEmail(db, senderEmail, email);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }
}



async function main() {
  let db;
  try {
    db = await initializeDatabase();
    console.log('Database connection opened successfully');
    await createTableIfNotExists(db);
    console.log('Table created successfully');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailAcct.EMAIL,
        pass: gmailAcct.PASS
      }
    });
    const senderEmail = `${gmailAcct.EMAIL}`; // Update with sender's email
    const emailList = ['greenpharmironriver@gmail.com','admin@cannaplugmi.com','ngocaj@aol.com','sturgismanagement@enjoylevels.com','quincy@joyology.com','greencare313@yahoo.com','bruce_kello@yahoo.com','bruce_kello@yahoo.com','employment2009@aol.com','farmscience@aol.com','detroit@flowerbowl.com','5anddime.frontdesk@gmail.com','fiveanddime@pharmacoinc.com','motownmeds@pharmacoinc.com','shakeandbake@pharmacoinc.com','apollocannabisco@gmail.com','flowerbowlmain@gmail.com','fiveanddimedet@gmail.com','info@houseofevo.com','greenbeanflint@gmail.com','anthony@exoticscannabisco.com','jackson@firstclasscannabisco.com','lansing@firstclasscannabisco.com','camden@firstclasscannabisco.com','mountpleasant@enjoylevels.com','kalamazooorders@shophod.com','portage@firstclasscannabisco.com','bentonharbor@firstclasscannabisco.com','monroe@firstclasscannabisco.com','hello@shophcc.com']
    const mailOptions = {
      from: `"${gmailAcct.NAME}" <${gmailAcct.EMAIL}>`,
      // subject: `Seamless Transactions, Increased Revenue: Try Our Credit Card Processing Solutions`,
      // subject: `Tap Into Convenience: Enable Apple Pay for Your Dispensary`,
      //subject: `Cashless ATMs: The Smart Choice for Your Dispensary`,
      subject: `Transform Your Dispensary with Tap to Pay & Mobile Payments`,
      text: 
      //Cashless ATM if they are a dispo #1
      `Hi,\n\n` +
      `Are you currently looking for a credit card solution that could boost your dispensary\’s revenue?\n\n` +
      `Our system offers Tap to Pay, Apple Pay, and Google Pay, making transactions quick and convenient for your customers. Dispensaries that accept credit cards typically see a 30% to 70% increase in sales. Plus, it\’s easy to set up and integrates seamlessly with your existing system.\n\n` +
      `If this sounds like something you\’re interested in, let\’s set up a quick call to discuss the details. I\’d love to help you get started.\n\n` +
      'Best,\n' +
      `${gmailAcct.NAME}\n` +
      'Business Development Representative\n' +
      'Spectrum Payment Solutions\n' +
      `Email: ${gmailAcct.EMAIL}`

      //Cashless ATM #1 if they are a dispo #2
      // 'Hi,\n\n' +
      // 'Are you searching for a simple and reliable payment solution for your dispensary? Our Cashless ATM solution is just what you need. We offer no contracts or maintenance fees, and the first terminal is free, reducing your initial investment. You\'ll earn rebates on every transaction, potentially saving your dispensary thousands each month.\n\n' +
      // 'Our terminals are easy to set up with a plug-and-play system, 4G compatible for delivery services, and can include a tip line if desired. Enjoy quick two-day funding and an online dashboard to review transactions effortlessly. Plus, you can try our service risk-free and cancel anytime without any charges.\n\n' +
      // 'I\'d love to discuss how our solution can benefit your dispensary. What time are you available for a call this week?\n\n' +
      // 'Best,\n' +
      // `${gmailAcct.NAME}\n` +
      // 'Business Development Representative\n' +
      // 'Spectrum Payment Solutions\n' +
      // `Email: ${gmailAcct.EMAIL}`


      //Cashless ATM if they are dispo w no cashless payment #1
      // 'Hey,\n\n' +
      // 'I noticed your dispensary doesn\’t take debit cards. Our Cashless ATM Solution can fix that! Are you looking for a simple, reliable payment solution? Our Cashless ATM is perfect—no contracts, no fees, no hidden costs. Plus, your first terminal is free.\n\n' +
      // 'You\'ll earn a rebate on every transaction, potentially saving thousands each month. Our terminals are easy to set up, 4G compatible for delivery, and support tap-to-pay. We can also round transactions to the closest dollar.\n\n' +
      // 'Interested in saving money and enhancing customer convenience? Let me know when you\'re available for a call this week.\n\n' +
      // 'Best,\n' +
      // `${gmailAcct.NAME}\n` +
      // 'Business Development Representative\n' +
      // 'Spectrum Payment Solutions\n' +
      // `Email: ${gmailAcct.EMAIL}`
      
    };
    await sendEmails(db, transporter, senderEmail, emailList, mailOptions);
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed successfully');
        }
      });
    }
  }
}

main();
