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
    const emailList = ['Mkaiser@peoplescare.Org','Yumingy@icloud.Com','Akwaabafarms@gmail.Com','Djw20@aol.Com','Dustin@therichardscompany.Net','DuxovLLC@gmail.Com','Jeremy+bcc@calaveraslittletrees.Com','John@desertkush.Com','Jscainc@gmail.Com','Mitcho.Thompson@phytomagic.Com','Phvesq@gmail.Com','Rc@thegrowceryla.Com','Tcrites@sparcsf.Org','Vincekrow@gmail.Com','Baycaredelivery@gmail.Com','Bryantmitch@gmail.Com','Jtproducer@gmail.Com','Keygardensdistro@gmail.Com','Calitreedtla@gmail.Com','DankoryLLC@gmail.Com','Dustin@goembarc.Com','George.Workman@kolaseed.Com','Info@massiveindustriesLLC.Com','Info@mercywellness.Com','Info@ranchosupply.Com','Justin.Nv@haloco.Com','Licensure@complexconcentrates.Com','Michael.Nguyen@fiacreinc.Com','Omgrown@gmail.Com','Peter@thepnegroup.Com']
    const mailOptions = {
      from: `"${gmailAcct.NAME}" <${gmailAcct.EMAIL}>`,
      // subject: `Seamless Transactions, Increased Revenue: Try Our Credit Card Processing Solutions`,
      // subject: `Tap Into Convenience: Enable Apple Pay for Your Dispensary`,
      //subject: `Cashless ATMs: The Smart Choice for Your Dispensary`,
      subject: `Simplify Payments, Maximize Rebates: Try Our Cashless ATMs`,
      text: 
      //Cashless ATM if they are a dispo #1
      // 'Hey,\n\n' +
      // 'Has your dispensary been having issues with debit card processing? We\'re experts in this space and can set you up with:\n\n' +
      // '- Cashless ATM/Debit Card Solutions\n' +
      // // '- Apple Pay & Samsung Pay\n' +
      // '- Terminals for Delivery Service\n' +
      // '- Quickbooks Integration\n' +
      // '- ACH Banking & Wire Services\n\n' +
      // 'Not only will this increase your number of transactions, but we\'re confident we can save you money compared to other providers. Additionally, you\'ll earn a rebate on every transaction made, adding even more to your savings. Our team will handle the easy setup so there\'s zero disruption to your business. Experience seamless transactions while saving on costs compared to other providers. Our team ensures easy setup with zero disruption to your dispensary\'s operations. Boost sales effortlessly.\n\n' +
      // 'Payment processing is a crucial part of growing your dispensary. Why not get it squared away properly with some folks who really know the cannabis industry?\n\n' +
      // 'I\'d love to hop on a quick call to explain more. When\'s a good time for you in the next few days? You can also shoot me back an email. Looking forward to hearing back from you soon!\n\n' +
      // 'Best,\n' +
      // `${gmailAcct.NAME}\n` +
      // 'Business Development Representative\n' +
      // 'Spectrum Payment Solutions\n' +
      // `Email: ${gmailAcct.EMAIL}`

      //Cashless ATM #1 if they are a dispo #2
      'Hey,\n\n' +
      'Are you looking for a simple, reliable payment solution for your dispensary? Our Cashless ATM solution is exactly what you need—no contracts, no maintenance fees, and no hidden costs. Plus, your first terminal is on us, and you can try our service with no risk. If you\'re not satisfied, you can cancel anytime without any charges.\n\n' +
      'Additionally, you\'ll earn a rebate on every transaction, potentially saving your dispensary thousands of dollars each month. Our plug-and-play terminals are easy to set up, requiring no complex integration. They are also 4G compatible, perfect for delivery services, and can include a tip line if desired.\n\n' +
      'I\'d love to discuss how our solution can benefit your dispensary. What time are you available for a call this week?\n\n' +
      'Best,\n' +
      `${gmailAcct.NAME}\n` +
      'Business Development Representative\n' +
      'Spectrum Payment Solutions\n' +
      `Email: ${gmailAcct.EMAIL}`


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
