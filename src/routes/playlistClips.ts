import { Router, Request, Response } from 'express'
import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import {v4 as uuidv4} from 'uuid';
import db from '../firestore';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
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

});

router.delete('/', async (req: Request, res: Response) => {
    /* 特定プレイリストの特定クリップ削除
        パラメータ: playlistId, clipId
    */
    const {playlistId, clipId} = req.body;
    if(!playlistId || !clipId){
        return res.status(500).json({error: 'playlistId and clipId are required.'})
    }

    try {
        // 消したいドキュメントの取得
        const playlistClipsRef = collection(db, "playlistClips");
        const q = query(playlistClipsRef, where("playlist_id", "==", playlistId), where("clip_id", "==", clipId));
        // クエリ実行
        const querySnapshot = await getDocs(q);
        // 一致するドキュメント削除
        querySnapshot.forEach(async (document) => {
            // doc.data() is never undefined for query doc snapshots
            await deleteDoc(doc(db, "playlistClips", document.id));
            console.log('doc.id: ', document.id);
        });

        return res.status(201).json({"ok": "delete successful"});
    } catch (error) {
        console.log('error: ', error)
        return res.status(500).json({error: 'Failed to delete clip in the playlist.'});
    }

    
});

export default router;