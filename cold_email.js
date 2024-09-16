const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
require('dotenv').config();

const dbFile = 'emails.db';
const credentials = require('./credentials.json');
const gmailAcct = credentials.JAMES;

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
    const emailList = ['uwdok1@gmail.com','harrah4greenleaf@gmail.com','bonnie@brixxcultivation.com','stillwater@shopcannacure.com','info@shopcannacure.com','shakeshackok@gmail.com','beyondthepinesok@gmail.com','getbakdshawnee@gmail.com','greensupremeseminole@gmail.com','bigdaddysgasco@gmail.com','cannabismarketplaceok@gmail.com','420.uptown.wellness@gmail.com','mainstreetmeds@gmail.com','reupdispensary@gmail.com','travis@kindloveok.com','mwedman@grogenexusa.com','sales@cake-cannabis.com','flavorchasersdispensary@gmail.com','thenativenugs@gmail.com','info@skyleafok.com','herbalmedsdispensaryoneastpine@gmail.com','orders@greencountrybud.com','okieogcannabis@gmail.com','cannalandok@gmail.com','luckysevendispo@gmail.com','topshelfstocktulsa@gmail.com','tulsagreentherapy@gmail.com','greencraft918@gmail.com','ttownmedicalrx@gmail.com','alfred@endo-holdings.com']
    const mailOptions = {
      from: `"${gmailAcct.NAME}" <${gmailAcct.EMAIL}>`,
      //subject: `Cashless ATMs: The Smart Choice for Your Dispensary`,
      //subject: `Transform Your Dispensary with Tap to Pay & Mobile Payments`,
      subject: `Transform Your Dispensary Payments – Accept Major Credit Cards & Mobile!`,
      //subject: `Upgrade Your Payment System: Debit & Credit Solutions for Dispensaries`,
      //subject: `Streamline Your Payment Processing with the Best Rates`,
      text: 
      //CC #1
      // `Hi,\n\n` +
      // `Are you currently looking for a credit card solution that could boost your dispensary\’s revenue?\n\n` +
      // `Our system offers Tap to Pay, Apple Pay, and Google Pay, making transactions quick and convenient for your customers. Dispensaries that accept credit cards typically see a 30% to 70% increase in sales. Plus, it\’s easy to set up and integrates seamlessly with your existing system.\n\n` +
      // `If this sounds like something you\’re interested in, let\’s set up a quick call to discuss the details. I\’d love to help you get started.\n\n` +
      // 'Best,\n' +
      // `${gmailAcct.NAME}\n` +
      // 'Business Development Representative\n' +
      // 'Spectrum Payment Solutions\n' +
      // `Email: ${gmailAcct.EMAIL}`

      //CC #2
      `Hi,\n\n` +
      `Are you currently looking for a credit card solution that can boost your dispensary’s revenue?\n\n` +
      `Our system allows you to accept all major credit cards, as well as Tap to Pay, Apple Pay, and Google Pay, making transactions quick and convenient for your customers. Dispensaries that accept credit cards and mobile payments typically see a 30% to 70% increase in sales.\n\n` +
      `If this sounds like something you\’re interested in, I\’d be happy to set up a quick call to discuss the details and help you get started.\n\n` +
      'Best,\n' +
      `${gmailAcct.NAME}\n` +
      'Business Development Representative\n' +
      'Spectrum Payment Solutions\n' +
      `Email: ${gmailAcct.EMAIL}`

      //Both #1
      // `Hi,\n\n` +
      // `Are you seeking a way to enhance your dispensary's payment options and boost your sales? We offer separate credit and debit card solutions designed to do just that.\n\n` +
      // `- For debit, our Cashless ATM solution starts with a $2.50 surcharge and gives you the option to earn a rebate on every transaction.\n` +
      // `- Our credit card solution has a starting rate of 4.95% + $3 per transaction and accepts all major credit cards, including Tap to Pay & Mobile Payments. We also offer the option to add a fee to the customer’s bill to offset the rate to the merchant, helping to keep your costs down.\n` +
      // `- Both solutions are easy to set up, work for in-store and delivery services, and come with no contracts or maintenance fees.\n\n` +
      // `I’d love to set up a quick call to discuss how our payment solutions can benefit your dispensary. When would be a good time for you?\n\n` +
      // `Looking forward to helping you elevate your business.\n\n` +
      // 'Best,\n' +
      // `${gmailAcct.NAME}\n` +
      // 'Business Development Representative\n' +
      // 'Spectrum Payment Solutions\n' +
      // `Email: ${gmailAcct.EMAIL}`

      //Both #2
      // `Hi,\n\n` +
      // `Are you interested in upgrading your payment options? We offer a cashless ATM solution with 4G compatibility—great for delivery services—and you get rebates on every transaction. Plus, our credit card solution accepts mobile payments, making it super convenient for your customers.\n\n` +
      // `Setup is easy, and we provide free terminals to get you going. Let\’s connect and see how we can help you improve your payment processing!\n\n` +
      // 'Best,\n' +
      // `${gmailAcct.NAME}\n` +
      // 'Business Development Representative\n' +
      // 'Spectrum Payment Solutions\n' +
      // `Email: ${gmailAcct.EMAIL}`

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

      //Vape Stores
      // `Hi,\n\n` +
      // `Are you having issues with your current payment processor, like restrictions on products such as D8, Glass, or Kratom, volume limits being capped, or money being held in reserves? We can help. Since 2008, we've been the first smoke processor, partnering with the biggest brands and wholesalers.\n\n` +
      // `We offer rates as low as 1.50% for stores and 2.75% for brands and wholesalers. Let us improve your revenue and lower your costs without any downtime or additional expenses. Interested in learning more? Let\’s connect!\n\n` +
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
