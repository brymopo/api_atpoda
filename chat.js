const conversation = require("./models/conversation");

module.exports = (io)=>{
    const Message = require("./controllers/message")


    function getAllRoomMembers(room, _nsp) {
        var roomMembers = [];
        var nsp = (typeof _nsp !== 'string') ? '/' : _nsp;

        for( var member in io.nsps[nsp].adapter.rooms[room] ) {
            roomMembers.push(member);
        }

        return roomMembers;
    }

    io.on('connection',(socket)=>{
        console.log('User Connected');
        console.log(socket.id);

        let conversations = JSON.parse(socket.handshake.query.conversations);
        
        if(conversations.length){
            conversations.forEach(id=>{
                socket.join(id);
                console.log('joined room: ',id)
            });  
        }             

        socket.on('message',async (form)=>{
            try {
                let data = JSON.parse(form);
            
                let newMsg = await Message.createMessage(data.message);

                let newConversation;

                if(!data.room){
                    newConversation = await Message.createConversation(newMsg);
                    Message.pushConvToUsers(newConversation);
                }else{
                    newConversation = await Message.pushMsgToConv(data.room,newMsg);
                }
                
                let room = newConversation._id;

                socket.join(room);
                io.sockets.emit("message",newConversation)
                               
            } catch (error) {
                console.log("An error occured")
                console.log("Error: ",error)
            }                      
            
                 
        })

        socket.on('disconnect',()=>{
            console.log('user logged off');
            console.log('id: ',socket.id);
        })
    })         
}