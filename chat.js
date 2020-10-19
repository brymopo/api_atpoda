const Conversation = require("./controllers/conversation");
const Chat = require('./controllers/chat');

module.exports = (io)=>{    

    io.on('connection',(socket)=>{
        console.log('User Connected');
        console.log(socket.id);

        let userId = socket.handshake.query.userId;
        console.log('id: ',userId)

        Chat.joinRooms(userId,socket,io);            

        socket.on('message',(form)=>{
            Chat.handleChatConversation(form,socket,io);
        });

        socket.on('conv:get',async (id)=>{
            let conversation = await Conversation.showConversation(id);
            socket.join(conversation._id);
            io.to(userId).emit('message',conversation);
        })

        socket.on('disconnect',()=>{
            console.log('user logged off');
            console.log('id: ',socket.id);
        })
    })         
}