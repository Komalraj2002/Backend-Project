import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { // REQ IS FROM FRONTEND , FILE IS THE IMAGE,VIDEO ETC , CB HERE IS CALLBACK
      cb(null, "./public/temp") //null = no error save the file in folder(destination) ./public/temp
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) //null = no error safe the file as (filename) file.originalname eg photo.png
    }
  })
  
  export const upload = multer({ 
    storage
   })