const text = document.querySelector("#textmsg")
const password = document.querySelector('#password')
const result = document.querySelector("#result")

function base64UrlDecode(base64Url) {
    // Replace non-base64 characters and pad the base64Url string
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let padding = base64.length % 4;
    if (padding) {
        base64 += '='.repeat(4 - padding);
    }
    return atob(base64); // Decode base64 to string
}

function decodeJwtPayload(token) {
    // Split the JWT into its three parts
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT');
    }

    // Decode the payload part (second part of the JWT)
    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);

    // Parse the JSON string
    return JSON.parse(decodedPayload);
}

function encodeTokenToEmojis(token) {
    return token.split("").map(char => `&#128${char.charCodeAt(0)};`).join(" ");
}
function decodeEmojisToChars(emojis) {
    return emojis.split(" ").map(code => {
        let emoji = code.replace('&#128', '').replace(';', '');
        // console.log(emoji);
        let codePoint = emoji.codePointAt(0);
        return `&#${codePoint};`;
    }).join(" ");
}
function decodeEmojisToToken(emojis) {
    return emojis.split(" ").map(code => {
        // Extract the numeric part of the emoji code
        let numericPart = code.replace('&#128', '').replace(';', '');
        // Convert numeric part to character
        return String.fromCharCode(parseInt(numericPart));
    }).join("");
}

function encryption() {
    document.querySelector("#encrypt-btn").addEventListener("click", function () {
        var pass = document.getElementById("password").value;
        var input = document.getElementById("textmsg").value;

        // Create JWT payload
        if(input == ""){
            document.querySelector("#result").innerHTML = "Please enter text some text to encode";
            return;
        }
        if(pass == ""){
            document.querySelector("#result").innerHTML = "Please enter a Password for encryption";
            return;
        }
        var payload = { msg: input };

        // Generate JWT using the password as the secret
        var header = { alg: "HS256", typ: "JWT" };
        var token = KJUR.jws.JWS.sign(null, JSON.stringify(header), JSON.stringify(payload), pass);
        // console.log(token);
        // Convert JWT to emojis
        var clutter = encodeTokenToEmojis(token);
        // console.log(clutter);
        document.querySelector("#result").innerHTML = clutter;
        document.querySelector("#copy-btn").style.display = "block";
    });
}

function decryption() {
    document.querySelector("#decrypt-btn").addEventListener("click", function () {
        var clutter2 = '';
        var input2 = document.querySelector("#emojimsg").value;
        var finalPass = document.querySelector("#finalpassword").value;
        if(input2 == ""){
            document.querySelector("#result").innerHTML = "Please enter Emojis to decode";
            document.querySelector("#result").style.display = "block";
            return;
        }
        if(finalPass == ""){
            document.querySelector("#result").innerHTML = "Please enter a Password for decryption";
            document.querySelector("#result").style.display = "block";
            return;
        }
        try {
            var emojis = decodeEmojisToChars(input2);
            var token = decodeEmojisToToken(emojis);
            // Verify JWT using the provided password
            // console.log(token);
            var isValid = KJUR.jws.JWS.verifyJWT(token, finalPass, { alg: ['HS256'] });
            if (isValid) {
                // Decode payload if valid
                var payload = KJUR.jws.JWS.parse(token).payloadObj;
                document.querySelector("#result").style.display = "block";
                document.querySelector("#result").style.color = "#eee";
                document.querySelector("#result").innerHTML = payload.msg;
                document.querySelector("#copy-btn").style.display = "block";

            } else {
                document.querySelector("#result").style.display = "block";
                document.querySelector("#result").style.color = "red";
                document.querySelector("#result").innerHTML = "Wrong password";
            }

        } catch (e) {
            document.querySelector("#result").style.display = "block";
            document.querySelector("#result").style.color = "red";
            document.querySelector("#result").innerHTML = "Error: " + e.message;
        }
    });

}



function btnClicking() {

    document.querySelector("button").addEventListener("click", function () {
        document.querySelector("#result").style.display = "block"
    })
    document.querySelector("#dec-btn").addEventListener("click", function () {
        document.querySelector("#result").style.display = "none"
        document.querySelector("#copy-btn").style.display = "none"
        document.querySelector("#decryption").style.display = "block"
        document.querySelector("#encryption").style.display = "none"
        document.querySelector("#dec-btn").style.backgroundColor = "#333"
        document.querySelector("#enc-btn").style.backgroundColor = "#222"
        document.querySelector("#main>h1 span img").style.rotate = '270deg'
    })
    document.querySelector("#enc-btn").addEventListener("click", function () {
        document.querySelector("#decryption").style.display = "none"
        document.querySelector("#result").style.display = "none"
        document.querySelector("#copy-btn").style.display = "none"
        document.querySelector("#encryption").style.display = "block"
        document.querySelector("#dec-btn").style.backgroundColor = "#222"
        document.querySelector("#enc-btn").style.backgroundColor = "#333"
        document.querySelector("#main>h1 span img").style.rotate = '90deg'

    })
}
function copyToClipboard() {
    const resultText = document.querySelector("#result").innerText;
    const textarea = document.createElement("textarea");
    textarea.value = resultText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    document.querySelector("#copy-btn").innerText = "Copied!";
    setTimeout(() => {
        document.querySelector("#copy-btn").innerText = "Copy to clipboard";
    }, 2000);
}
document.querySelector("#copy-btn").addEventListener("click", copyToClipboard);


encryption();

decryption()

btnClicking();
