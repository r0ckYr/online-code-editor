const {exec, spawn} = require("child_process");
const { FILE } = require("dns");
const fs = require('fs');
const l = require('../constants/languageOptions');
const s = require('../constants/statuses');

const DIRECTORY = "./tmp/"
const FILE_NAME = DIRECTORY+"myFile"
let processing = true

const commandList = [
    {
        id: 46,
        cmd: `bash ${FILE_NAME}.bash`
      },
      {
        id: 48,
        cmd: `gcc -o ${FILE_NAME} ${FILE_NAME}.c && ./tmp/myFile`
      },
      {
        id: 52,
        cmd: `g++ -o ${FILE_NAME} ${FILE_NAME}.cpp && ./tmp/myFile`
      },
      {
        id: 60,
        cmd: `go run ${FILE_NAME}.go`
      },
      {
        id: 62,
        cmd: `javac ${FILE_NAME}.java && ls tmp/ | grep '\.class' | sed 's/\.class//g' | xargs -I{} sh -c "cd tmp;java {};rm {}.class;cd .."` 
      },
      {
        id: 71,
        cmd: `python3 ${FILE_NAME}.python`
      },
]


var compileCode = async (languageId, cmd, res, response) => {
    try
    {
        var start = new Date().getTime();
        console.log("start")
        exec(cmd, (error, stdout, stderr) => {
            var end = new Date().getTime();
            var time = end - start;
            response.time = `${time}ms`;
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                processing = false
                response.stderr = stderr
                response.status.id = 6
                response.status.description = setDescription(response.status.id)
                response.stdout = btoa(stdout)
                response.compile_output = btoa(encodeURI(stderr))
                console.log(response)
                res.send(response)
            }
            else if (error) {
                console.log(`stderr: ${error.message}`);
                processing = false
                response.stderr = error
                response.status.id = 69
                response.status.description = setDescription(response.status.id)
                response.stdout = btoa(stdout)
                console.log(response)
                res.send(response)
            }
            else
            {
                console.log(`stdout: ${stdout}`);
                processing = false
                response.stderr = error
                response.status.id = 3
                response.stdout = btoa(stdout)
                response.status.description = setDescription(response.status.id)
                console.log(response)
                res.send(response)
            }
        });
    }
    catch(e)
    {
        console.log(e)
        processing = false
        return [e, 69, null]
    }

} 


var compileCode2 = async (languageId, cmd, res, response, stdInput) => {
    try
    {
        var start = new Date().getTime();
        console.log("start")
        var process = spawn(cmd, {shell: true})
        stdInput  = stdInput.split('\n')
        console.log(stdInput);
        for(var i=0;i<stdInput.length;i++)
        {
            if(stdInput[i].length > 0)
                process.stdin.write(stdInput[i])
        } 
        process.stdin.end()
        process.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            response.stderr = data
            response.status.id = 6
            response.status.description = setDescription(response.status.id)
            response.stdout = btoa("stdout")
            response.compile_output = btoa(encodeURI(data))
            console.log(response)
            res.send(response)
        })  
        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            response.stderr = ""
            response.status.id = 3
            response.stdout = btoa(data)
            response.status.description = setDescription(response.status.id)
            console.log(response)
            res.send(response)
        })
    }
    catch(e)
    {
        console.log(e)
        processing = false
        return [e, 69, null]
    }
}


const writeCode = (code, extension) => {
    try {
    fs.writeFileSync(`${FILE_NAME}.${extension}`, code);
    return null;
    // file written successfully
    } catch (err) {
    console.error(err);
    return err;
}
}

const getExtension = (languageId) =>
{
    for (var i=0;i<l.languageOptions.length;i++)
    {
        if(languageId===l.languageOptions[i].id)
        {
            return l.languageOptions[i].value;
        }
    }
    return null;
}

const getCommand = (languageId) =>
{
    for (var i=0;i<commandList.length;i++)
    {
        if(languageId===commandList[i].id)
        {
            return commandList[i].cmd;
        }
    }
    return null;
}


const setDescription = (statusID) =>
{
    for (var i=0;i<s.statuses.length;i++)
    {
        if(statusID===s.statuses[i].id)
        {
            return s.statuses[i].description;
        }
    }
    return null;
}


var runCode = async (req, res) =>{
    const response = {
        status: {
            id: 3,
            description: null
        },
        memory: "1234kB",
        time: "12s",
        stdout: null,
        stderr: "Error",
        compile_output: req.body.source_code
    }

    //get required components
    const languageId = req.body.language_id;
    const code = atob(req.body.source_code)
    var stdInput = ""
    if (req.body.stdin.length>0)
        var stdInput = atob(req.body.stdin)
    const languageExtension = getExtension(languageId);

    //write code to a file
    const fileError = writeCode(code, languageExtension)
    if(fileError)
    {
        console.log("return error code")
    }
    var cmd = getCommand(languageId)
    if(stdInput.length>0)
    {
        compileCode2(languageId, cmd, res, response, stdInput);
    }
    else
    {
        compileCode(languageId, cmd, res, response);
    }
}

module.exports = { runCode }