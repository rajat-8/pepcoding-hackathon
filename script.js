#! /usr/bin/env node

const pup = require("puppeteer");
const fs = require("fs");

let word = process.argv.slice(2);
word = word[0];
let tab;
let trend_res = [];

async function meaning(){
    let words = await tab.$$(".css-o8eka5.e1wg9v5m0");
    let wordi = words[0];
    let final_word = await tab.evaluate(function(ele){
        return ele.textContent;
    },wordi);
    
    let phon_sounds = await tab.$$(".pron-ipa-content.css-1ksa987.evh0tcl1");
    let phon_sound = phon_sounds[0];
    let final_phon_sound = await tab.evaluate(function(ele){
        return ele.textContent;
    },phon_sound);
    console.log("WORD - " + final_word + "  Phonetic Sound - "+final_phon_sound);

    let means =await tab.$$(".one-click-content.css-ibc84h.e1q3nk1v1");
    let mean = means[0];
    let final_mean = await tab.evaluate(function(ele){
        return ele.textContent;
    },mean);
    console.log("Meaning - " + final_mean );
}

async function wotd(){
    const browser = await pup.launch({
        headless: false,
        defaultViewport: false,
        args :["--start-maximized"]
    });
    const pages = await browser.pages();
    tab = pages[0];
    await tab.goto(`https://www.dictionary.com`);
    await tab.waitForSelector(".colored-card-heading.css-186rtdh.efsdum82")
    let wotd = await tab.$(".colored-card-heading.css-186rtdh.efsdum82");
    let wotdurl = await tab.evaluate(function(ele){
        return ele.textContent;
    },wotd);

    await tab.goto(`https://www.dictionary.com/browse/`+wotdurl);
    console.log("WORD OF THE DAY ( WOTD )");
    await meaning();
    await browser.close();

}

async function trend(){
    const browser = await pup.launch({
        headless: false,
        defaultViewport: false,
        args :["--start-maximized"]
    });
    const pages = await browser.pages();
    tab = pages[0];
    await tab.goto(`https://www.dictionary.com`);
    await tab.waitForSelector(".trending-words.trending-words-word.css-hhvldk.ewx439u1");
    let trend_words = await tab.$$(".trending-words.trending-words-word.css-hhvldk.ewx439u1");
    let popularity = await tab.$$(".trending-words.trending-words-value.css-1aww5bt.ewx439u0");
    
    for(let i=1;i<=10;i++){
        let data = [];      
        data["popularity_gain"] = {};
        let trend_word = await tab.evaluate(function(ele){
            return ele.textContent;
        },trend_words[i]);
        data.push({"word": trend_word});
        let pop = await tab.evaluate(function(ele){
            return ele.textContent;
        },popularity[i]);
        data.push({"popularity gain": pop});

        trend_res.push({"Word" :data});
    }
    console.log(trend_res);
    
    await browser.close();

}

const main = async () => {
    if(word=="wotd"){
        wotd();
    }
    else if(word == "trending"){
        await trend();
        fs.writeFileSync("trending_word.json", JSON.stringify(trend_res));
    }
    else{
        const browser = await pup.launch({
            headless: false,
            defaultViewport: false,
            args :["--start-maximized"]
        });
        const pages = await browser.pages();
        tab = pages[0];

        await tab.goto(`https://www.dictionary.com/browse/`+word);

        await tab.waitForSelector(".css-1avshm7.e16867sm0");
        let item = await tab.$$(".no-results-title.css-12rb09.e6aw9qa1");
        if(item.length == 0 ){
            await meaning();
        }
        else{
            console.log("There is no such word: So, here is a :");
            wotd();
        }
        await browser.close();
    }
}

main();