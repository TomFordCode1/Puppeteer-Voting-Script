const puppeteer = require('puppeteer');
const fs = require('fs');
const fastcsv = require('fast-csv');

// Define the website URL
const voteUrl = 'https://poll-maker.com/poll4936256x1175864a-152';

// Define selectors
const yesButtonSelector = '#qp_form4936256 > div.qp_ao > div:nth-child(4)';
const voteButtonSelector = '#qp_form4936256 > div.qp_bo > a.qp_hra.qp_btna';

// Function to generate a random string of lowercase letters and numbers
function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

// Function to generate a random email address with added words
function generateRandomEmail() {
  const randomString = generateRandomString(8); // Adjust the length as needed
  const emailProviders = ['@guerrillamail.com', '@tempmail.net', '@getairmail.com']; // Add more providers if needed
  const randomProvider = emailProviders[Math.floor(Math.random() * emailProviders.length)];
  const randomWord = ['Gnomophobia', 'Gnomiphile'][Math.floor(Math.random() * 2)]; // Randomly select one of the words
  const email = randomWord + randomString + randomProvider;
  return email;
}

(async () => {
  console.log('Starting Puppeteer script...');

  const browser = await puppeteer.launch({
    headless: false, // Set to false for non-headless mode (visible window)
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  // Create an array to store generated emails
  const generatedEmails = [];

  console.log('Generating and voting with 100 email addresses...');
  for (let i = 0; i < 100; i++) {
    const email = generateRandomEmail();
    generatedEmails.push(email);

    await page.goto(voteUrl);

    console.log(`Casting vote ${i + 1} with email: ${email}`);

    // Click "Yes" button
    await page.click(yesButtonSelector);

    // Wait for 2 seconds
    await page.waitForTimeout(2000);

    // Click the voting button
    await page.click(voteButtonSelector);

    // Wait for 2 seconds before the next vote
    await page.waitForTimeout(2000);
  }

  // Save the generated emails to a CSV file
  const csvStream = fs.createWriteStream('generated_emails.csv');
  const csvWriter = fastcsv.writeToStream(csvStream, { headers: true });

  generatedEmails.forEach((email) => {
    csvWriter.write({ Email: email });
  });

  csvWriter.end();

  console.log('Script completed. Generated emails saved to generated_emails.csv');

  // Keep the browser window open for inspection (comment out if not needed)
  // await browser.waitForSelector('body');

  // Close the browser when done
  await browser.close();
})();
