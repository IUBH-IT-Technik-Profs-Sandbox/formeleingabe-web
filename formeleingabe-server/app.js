import express from "express"
import bodyParser from "body-parser"
import fs from "node:fs";
import path from "node:path"

const app = express()


const basefile = fs.realpathSync("./data/")
const fileStorage = {};
fileStorage.normalize = (pat) => {
    try {
        const p = path.resolve(basefile, pat)
        //const rewritten = fs.realpathSync(p)
        if (p.startsWith(basefile)) return p;
    } catch (e) {
        console.log(e)
    }
    return null
}
fileStorage.hasFile = async (file) => {
    let stat;
    try { stat = await fs.promises.stat(fileStorage.normalize(file))} catch(e) {}
    return stat && stat.isFile()
}
fileStorage.createFile = async (file, content) => {
    await fs.promises.writeFile(fileStorage.normalize(file), content)
}
fileStorage.listTokens = async () => {
    const filenames = await fs.promises.readdir(basefile)
    const tokens = []
    for(let f of filenames) {
        const match = /tok-([^-]*)-responses.json/.exec(f)
        if(match) tokens.push(match[1])
    }
    return tokens;
}


fileStorage.readResponses = async (token) => {
    try {
        const content = await fs.promises.readFile(path.resolve(basefile, `tok-${token}-responses.json`))
        return JSON.parse(content);
    } catch (e) {
        return null;
    }
}


app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

app.post("/app/init", async (req, res) => {
    let rand, filename;
    do {
        rand  = (Math.trunc(Math.random()*65536*256)).toString(16)
        filename = `tok-${rand}-intro.html`
    } while(await fileStorage.hasFile(filename))
    try {
        await fileStorage.createFile(filename, rand)
        res.send({token: rand})
    } catch (e) {
        res.json({error: e})
    }
})

app.post("/app/upload", async (req,res)=> {
    try {
        const token = req.body["token"]
        const content = req.body["content"]
        await fileStorage.createFile(`tok-${token}-content.html`, content)
        res.json( {result: "ok"})
    } catch (e) {
        console.log("error ", e)
        res.json({result: "error"})
    }
})


const questionList = [ "level", "domain", "likedEquatio", "likedMathlive", "likedWiris", "latexExperience", "wirisFeeling", "equatioFeeling", "mathliveFeeling", "furtherComments" ]
app.post("/app/respond", (req,res)=> {
    try {
        const responses = {date: new Date()}
        for(let q of questionList) responses[q] = req.body[q]
        fileStorage.createFile(`tok-${req.body['token']}-responses.json`, JSON.stringify(responses))
        res.json({ok: "ok"})
    } catch (e) {
        res.json({error: e})
    }
})

const usernames = "formulateam---WeShallGetSome"

app.get("/app/allresponses", (req,res) => {
    res.send(`<!DOCTYPE html>
<html><head><title>allresponses</title></head><body><form action="/app/allresponses" method="POST">
    User: <input name="user"><br> Password: <input name="pass" type="password"><br><input type="submit"></form></body></html>`)
})

// protected
app.post("/app/allresponses", async (req,res)=> {
    if(usernames.indexOf(req.body.user + "---" + req.body.pass)===-1) {
        res.status(400).send({message: 'Wrong password'});
        return
    }
    res.write(`<!DOCTYPE html>
<html><head><title>Survey result</title></head><body><table><thead><tr>`)
    const tokens = await fileStorage.listTokens()
    res.write(`<td>ID</td><td>date</td>`)
    for(let q of questionList) res.write(`<td>${q}</td>`)
    res.write(`</tr></thead><tbody>`)
    for(let tok of tokens) {
        const responses = await fileStorage.readResponses(tok)
        if(!responses) continue;
        res.write(`<tr>`)
        if(fileStorage.hasFile(`tok-${tok}-content.html`))
            res.write(`<td><a href="/app/showresponse/?token=${tok}">${tok}</a></td>`)
        else
            res.write(`<td>${tok}</td>`)
        res.write(`<td>${responses.date}</td>`)
        for(let q of questionList) res.write(`<td>${responses[q]}</td>`)
        res.write(`</tr>`)
    }
    res.write(`</tbody></table></body></html>`)
    await res.end()
})

app.get("/app/showresponse", (req,res)=> {
    try {
        const filename = `tok-${req.query['token']}-content.html`
        const normalized = fileStorage.normalize(filename)
        res.sendFile(normalized)
    } catch (e) {
        res.sendError(e)
    }
})

app.use((req,res,next) => {
    console.log(req.path)
    next()
})
app.use( express.static(path.resolve("../dist"), {maxAge: '2h', extensions: ["html"]})) //


app.listen(3000)


export default app;