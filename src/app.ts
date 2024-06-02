import express from 'express';
import userRoutes from './routes/users';
import playlistRoutes from './routes/playlists';
import clipRoutes from './routes/clips';
import playlistClipRoutes from './routes/playlistClips';

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/playlistClips', playlistClipRoutes);

export default app;
