import app from './app';

const port = 8080;

app.get('/', (req, res) => {
res.send('Hello, Vercel!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
