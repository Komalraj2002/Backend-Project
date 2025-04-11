class apiError extends Error{
    constructor(
        statuscode,
       message = "something went wrong",
       error=[],
       statck=""
    ){
        super(message)
        this.statuscode = statuscode,
        this.data=null,
        this.message=message,
        this.success=false,
        this.errors=errors

     if(statck){
      this.stack= statck
     }else{
        Error.captureStackTrace(this,this.constructor)
     }


    }
}
export {apiError}