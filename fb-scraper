const defaultOptions = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"
    },
    jar: true
}
const request = require("request-promise").defaults(defaultOptions);
const fs = require("fs");
const inquirer = require('inquirer');
const credentials = require("./credentials");

async function main() {
    const options = {
        method: "POST",
        uri: "https://mobile.facebook.com/login/device-based/regular/login/?refsrc=https%3A%2F%2Fmobile.facebook.com%2F%3Fref%3Ddbl&lwv=100&ref=dbl",
        form: {
            email: credentials.email,
            pass: credentials.pass,
        },
        simple: false,
        resolveWithFullResponse: true
    }
    try {
        const result = await request(options);
        console.log("first request: ", result.headers.location);
        if (result.headers.location == "https://mobile.facebook.com/checkpoint/?ref=dbl&_rdr") {
            console.log("checkpoint!");
            let checkpoint = [{
                type: 'input',
                name: 'smsCode',
                message: "SMS code: ",
            }];
            const fbCode = await inquirer.prompt(checkpoint).then(answers => {
                return answers['smsCode'];
            });
            console.log("fbCode ",fbCode);
            const options2 = {
                method: "POST",
                uri: "https://mobile.facebook.com/checkpoint/?ref=dbl&_rdr",
                form: {
                    email: credentials.email,
                    pass: credentials.pass,
                    approvals_code: fbCode
                },
                simple: false,
                resolveWithFullResponse: true
            }
            const result2 = await request(options2);
            console.log(result2);
            // writeToFile2(JSON.stringify(result2));
            // const postPage = await request.get(result2.headers.location);
            // writeToFile(postPage);
            




        }
        const checkpoint = await request.get(result.headers.location);
        writeToFile(checkpoint);
    } catch (error) {
        console.error(error);
        console.error("ERROR");
    }
}

function writeToFile(body) {
    fs.writeFile("./test.html", body, function (err) {
        if (err) {
            console.error(err);
        }
        console.log("Saved");
    });
}
function writeToFile2(body) {
    fs.writeFile("./options2.html", body, function (err) {
        if (err) {
            console.error(err);
        }
        console.log("Saved");
    });
}

main();
