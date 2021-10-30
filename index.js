import puppeteer from 'puppeteer';
import fs from 'fs';

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

const previousSession = fs.existsSync('cookies.json')
if (previousSession) {
    // If file exist load the cookies
    const cookiesString = fs.readFileSync('cookies.json');
    const parsedCookies = JSON.parse(cookiesString);
    if (parsedCookies.length !== 0) {
        for (let cookie of parsedCookies) {
            await page.setCookie(cookie)
        }
        console.log('Session has been loaded in the browser');
        resgatar();
    }
} else {
    login();
}

async function login() {
    await page.goto('https://streamelements.com');

    await page.waitForTimeout(90000);

    const cookiesFilePath = 'cookies.json';
    // Save Session Cookies
    const cookiesObject = await page.cookies()
    // Write cookies to temp file to be used in other profile pages
    fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
    function(err) { 
        if (err) {
            console.log('The file could not be written.', err)
        }
            console.log('Session has been successfully saved')
        }
    );

    await page.waitForTimeout(5000);
    
    await browser.close();
}

async function resgatar() {
    await page.goto('https://streamelements.com/igorsy1/store');
    //await page.goto('https://streamelements.com/nycts/store');

    await page.waitForTimeout(2000);

    while (true) {
        const item = await page.$(`h2.item-title[title='Teste']`);

        if (!item) continue;

        const quantidade = await page.evaluate(() => {
            const itemCard = document.querySelector(`h2[title='Teste']`)?.parentNode?.parentNode;

            return itemCard.querySelector('span[ng-if="item.quantity.current === 0"]')?.innerText;
        });

        if (quantidade !== 'Sold out') {
            await page.evaluate(() => {
                const itemCard = document.querySelector(`h2[title='Teste']`).parentNode.parentNode;
                itemCard.querySelector('button').click();
            });
            break;
        };
    }

    await page.waitForTimeout(500);

    await page.evaluate(() => {
        const card = document.querySelector('form.ng-pristine.ng-valid');
        const botaoContinue = card.querySelector('button');
        botaoContinue.click();
    });

    await page.waitForTimeout(500);
    await page.type('#input_36', 'a');

    await page.evaluate(() => {
        const cardRedeem = document.querySelector('form[name="vm.redemptionForm"]');
        const botao = cardRedeem.querySelector('button.md-primary.md-raised.md-button.md-dark-theme.md-ink-ripple');
        botao.click();
    });

    await browser.close();
};