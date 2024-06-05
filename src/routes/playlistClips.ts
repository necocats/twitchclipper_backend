import { Router, Request, Response } from 'express'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {v4 as uuidv4} from 'uuid';
import db from '../firestore';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    // CORSエラーに対応
    res.set({ 'Access-Control-Allow-Origin': '*' });
    try {
        // プレイリスト情報の整理, idはuuidを使用
        const { playlistId, clipId } = req.body;
        const id = uuidv4();
        const playlistClips = {
            id,
            playlist_id: playlistId,
            clip_id: clipId,
            added_at: serverTimestamp()
        }

        // firestoreに格納
        await setDoc(doc(db, 'playlistClips', id), playlistClips)
        return res.status(201).json(playlistClips);
    } catch (error) {
        console.log('error: ', error)
        return res.status(500).json({error: 'Failed to add clip to playlist.'});
    }

})

export default router;