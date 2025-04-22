class apiError extends Error{
    constructor(
        statuscode,
       message = "something went wrong",
       errors=[],
       statck=""
    ){
        super(message)
        this.statuscode = statuscode,
        this.data=null,
        this.message=message,
        this.success=false,          
        this.errors=errors

     if(stack){
      this.stack= stack
     }else{
        Error.captureStackTrace(this,this.constructor)
     }


    }
}
export {apiError}