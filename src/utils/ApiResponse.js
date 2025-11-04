class ApiResponse{

    constructor(statuscode , data , message="success" ){
        this.statuscode = statuscode
        this.message = message
        this.data= data 
        this.statuscode = statuscode < 400 
    } 
}

export { ApiResponse }