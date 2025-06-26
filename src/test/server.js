import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const app = express();
const port = 3000;

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname));
app.use(cors());


// Указываем путь к HTML-файлу
app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'test/html' });
    res.sendFile(join(__dirname, './index.html'));
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});