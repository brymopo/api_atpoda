const Message = require("./message");
const Conversation = require('./conversation');

exports.getAllRoomMembers = (room, _nsp)=>{
    var roomMembers = [];
    var nsp = (typeof _nsp !== 'string') ? '/' : _nsp;

    for( var member in io.nsps[nsp].adapter.rooms[room] ) {
        roomMembers.push(member);
    }

    return roomMembers;
}

exports.joinRooms = async (userId,socket,io)=>{

    try{
        socket.join(userId);
        let conversations = await Conversation.getConversations(userId);
        console.log('conv: ',conversations);
        if(conversations.length){
            conversations.forEach(conv=>{
                socket.join(conv._id);
                console.log('joined room: ',conv._id)
            })
            io.to(userId).emit('onInit',conversations);
        }
    }catch(error){
        console.log('an error occured');
        console.log(error)
    }
    
}

exports.handleChatConversation = async (form,socket,io)=>{
    try {
        let data = JSON.parse(form);
    
        let newMsg = await Message.createMessage(data.message);

        let chatConversation;

        if(!data.room){
            //  ABSCENCE OF A DATA.ROOM IMPLIES NO CONVERSATION EXISTS YET.

            chatConversation = await Message.createConversation(newMsg);
            Message.pushConvToUsers(chatConversation);
            let room = chatConversation._id;
            let recepient = newMsg.recepient;
            io.to(recepient).emit('message:new',room);
            socket.join(room);
            io.to(room).emit("message",chatConversation);   

        }else{

            chatConversation = await Message.pushMsgToConv(data.room,newMsg);
            io.to(data.room).emit("message",chatConversation);   
        }                 
                       
    } catch (error) {
        console.log("An error occured")
        console.log("Error: ",error)
    }                      
    
}