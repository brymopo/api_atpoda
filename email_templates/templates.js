exports.resetPassword = (user,token)=>{
    return `
    <div style="border:2px solid #262626;width:95%;margin:30px auto;padding:1rem">       
        <h1>Hola ${user.firstName},</h1>
        <br>
        <br>
        <p>Puedes reestablecer tu clave de acceso dandole click al siguente vinculo: </p>
        <p> Nombre de usuario: ${user.username} </p> 
        <br> 
        <a href="${process.env.FRONT}/#/nueva_clave/${token.token}">Reestablecer clave </a>
    </div>
    `
};

exports.firstValidation = (user,token)=>{
    return `
    <div style="border:2px solid #262626;width:95%;margin:30px auto;padding:1rem">        
        <h1>Hola ${user.firstName},</h1>
        <br>
        <br>
        <p>Por favor verifica tu cuenta dandole click al siguente vinculo: </p>
        <br> 
        <a href="${process.env.FRONT}/#/confirmation/${token.token}">Validar Correo Electronico </a> 
    </div>
    `

}
