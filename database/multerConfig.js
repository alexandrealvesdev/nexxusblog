const multer = require('multer');
const path = require('path');

// Configurar o local onde as imagens serão armazenadas no servidor
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // O diretório onde as imagens serão armazenadas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Nome do arquivo após o upload
    }
});

// Configurar o filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('O arquivo não é uma imagem!'), false);
    }
};

// Configurar o Multer com as opções
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
