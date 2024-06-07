import express from 'express';
import cors from 'cors';
import userRoutes from './routes/users';
import playlistRoutes from './routes/playlists';
import clipRoutes from './routes/clips';
import playlistClipRoutes from './routes/playlistClips';

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors({
    origin: 'http://127.0.0.1:5173', //アクセス許可するオリジン
    credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
}))

app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/playlistclips', playlistClipRoutes);

export default app;
