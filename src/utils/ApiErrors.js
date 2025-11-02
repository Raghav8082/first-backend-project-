class ApiError extends Error{
    constructor(statuscode,message="something wend wrong " , error = [], stack =" "){
        super(message)
        this.statuscode = statuscode  
        this.data = null
        this.message = message 
        this.success= false ; 
        this.errors=errors 

        if(statcks){
            this.stacks = statcks 
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}


export {ApiError}