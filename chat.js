const Conversation = require("./controllers/conversation");
const Chat = require('./controllers/chat');

module.exports = (io)=>{    

    io.on('connection',(socket)=>{
        
        let userId = socket.handshake.query.userId;
        
        Chat.joinRooms(userId,socket,io);            

        socket.on('message',(form)=>{
            Chat.handleChatConversation(form,socket,io);
        });

        socket.on('conv:get',async (id)=>{
            let conversation = await Conversation.showConversation(id);
            socket.join(conversation._id);
            io.to(userId).emit('message',conversation);
        })        
    })         
}