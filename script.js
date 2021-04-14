const puppy = require("puppeteer");
const fs = require("fs");
const data=require("./data.json");

let argum = process.argv;
let location = argum[2];

for(let i=3;i<argum.length;i++){location = location + " " + argum[i];}

let gmail_ = fs.readFileSync("1.txt","utf-8");

let addresses_name = gmail_.split("\r\n");


async function main(){
    let browser = await puppy.launch({
        headless : false,
        defaultViewport : false,
        args: ["--start-maximized"],
    });
    let pages = await browser.pages();
    let tab = pages[0];
    await tab.goto("https://www.google.com/maps/@28.5987879,77.320955,15z");    
    await tab.waitForNavigation({waitUntil: "networkidle0"});
    await tab.waitForSelector("input.tactile-searchbox-input");
    await tab.type("input.tactile-searchbox-input",location); 
    await tab.keyboard.press("Enter");
    await wait(2000);
    await tab.waitForSelector('button[jsaction="pane.placeActions.share"]');

    await tab.click('button[jsaction="pane.placeActions.share"]');
    await tab.waitForSelector(".section-copy-link-input-container input") ;
    let input_field = await tab.$(".section-copy-link-input-container input") ;
    let locationLink = await tab.evaluate(ele => ele.getAttribute("value"),input_field);
    console.log(locationLink);       
    await tab.goto("https://accounts.google.com/");
    await wait(2000);
    await tab.waitForSelector('input[aria-label="Email or phone"]');
    await tab.type('input[aria-label="Email or phone"]',data.id); 
    await tab.keyboard.press("Enter");
    await wait(1500);
    await tab.waitForSelector('input[aria-label="Enter your password"]');
    await tab.type('input[aria-label="Enter your password"]',data.pass); 
    await tab.keyboard.press("Enter");
    await tab.waitForNavigation({waitUntil : "networkidle0"});
    await tab.goto("https://www.google.com/gmail");
    for(let i=0;i<addresses_name.length;i++){        
        await file_creation(addresses_name[i]);
        await composeMail(addresses_name[i],locationLink,tab);              
    } 
    tab.close();            
}
async function composeMail(addresses_name,locationLink,tab){
    await wait(1000);
    addresses_name = addresses_name.split(" - ");
    let add = addresses_name[0];
    let name = addresses_name[1];
    let details = fs.readFileSync("details.txt","utf-8");
    let ms = fs.readFileSync("message.txt","utf-8");
    details = details.split("#");
    ms = ms.split("$");
    let i = 0;
    let j = 0;
    let ans;
    while(i<ms.length || j<details.length){
        if(i<ms.length){ans = ans + ms[i++];}
        if(j<details.length){ans = ans + details[j++];}
    }

    await tab.click(".T-I.T-I-KE.L3");
    await wait(1000);
    await tab.keyboard.type(add,{delay:2});
    await tab.keyboard.press("Enter");
    await wait(200);
    await tab.keyboard.press("Tab");
    await wait(200);
    await tab.keyboard.type(data.Topic,{delay:2});
    await wait(200);
    await tab.keyboard.press("Tab");
    await wait(200);
    await tab.keyboard.type(ans,{delay:1});
    await tab.keyboard.press("Enter");
    await tab.keyboard.press("Enter");
    await tab.keyboard.type("Location Link : " + locationLink,{delay:1});
    await wait(200);
    await tab.keyboard.press("Tab");
    await wait(200);
    await tab.keyboard.press("Enter");
    console.log("Mail sent to : "+name);
    await wait(500);
}

async function file_creation(addresses_name){
    addresses_name = addresses_name.split(" - ");
    let name = addresses_name[1];
    let d = name + "#";
    d = d + data.Event+"#";
    d = d + location + "#";
    d = d + data.date_sender+"#";
    d = d + data.date_receiver+"#";
    d = d + data.contact + "#";
    d = d + data.id + "#";
    d = d + "-" + data.name;
    fs.writeFileSync("details.txt",d);
}

async function wait(time){
    return new Promise(function (resolve,reject){
        setTimeout(resolve,time);
    });
}

main();
