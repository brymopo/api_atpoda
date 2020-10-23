const setupMessage = require('../controllers/email').setupMessage;
const setupTransport = require('../controllers/email').setupTransport;
const findInputError = require('../controllers/email').findInputError;

test('should output an email object',()=>{
    let data = {text:"I am text",html:"I am html"}

    const email = setupMessage('bmoreno@gmail.com','This is a test',data);

    expect(email).toStrictEqual({
        from:"'Atpoda Web' <atpodaweb@gmail.com>",
        to:'bmoreno@gmail.com',
        subject:'This is a test',
        text:"I am text",
        html:"I am html"
    })
});

test('should throw an error if no arguments',()=>{
    expect(()=>{
        findInputError();
    }).toThrow('Missing one or more arguments');
});

test('should throw an error if recepient not an email',()=>{
    expect(()=>{
        let data = {text:"I am text",html:"I am html"}
        findInputError('notanemail','subject',data);
    }).toThrow('Recepient is not an email');
});

test('should throw an error if no text or html properties',()=>{
    expect(()=>{
        let data = {}
        findInputError('email@example.com','subject',data);
    }).toThrow('either text and/or HTML is missing');
})

test('should throw an error if text or html are empty',()=>{
    expect(()=>{
        let data = {text:"",html:""}
        findInputError('email@example.com','subject',data);
    }).toThrow('text and/or HTML cannot be empty');
})

test('should throw an error if text or html not strings',()=>{
    expect(()=>{
        let data = {text:[1,2],html:['a','b']}
        findInputError('email@example.com','subject',data);
    }).toThrow('text and html can only be strings')
})

test('integration should throw an error if no arguments',()=>{
    expect(()=>{
        const data = {text:"I am text",html:"I am html"};
        let email = setupMessage();
    }).toThrow('Missing one or more arguments');    

})