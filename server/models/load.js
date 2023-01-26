const loadProgram = (number, res) => {
    const response = {
        source_code: "I2luY2x1ZGU8c3RkaW8uaD4KCmludCBtYWluKCkKewogIHByaW50ZigiSGVsbG8iKTsKICByZXR1cm4gMDsKfQo=",
    }
    res.send(response)
}


module.exports = { loadProgram }