import multer from 'multer';

const storage = multer.diskStorage({
    // file refers to when user hit the req it also send a file to server to store.
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ storage: storage });