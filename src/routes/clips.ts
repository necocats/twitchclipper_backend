import { Router, Request, Response } from 'express'
import { serverTimestamp, doc, setDoc, getDoc, collection, query, where, getDocs, DocumentData, DocumentReference, deleteDoc } from 'firebase/firestore';
import db from '../firestore'
import * as dotenv from 'dotenv'
dotenv.config();

const router = Router();
const axios = require('axios');

router.post('/', async (req: Request, res: Response) => {
    /* 新しいクリップの追加
        パラメータ：userId, clipUrl
    */
    try {
        // userID, clipUrlを受け取っているかどうか
        const { userId, clipUrl } = req.body;
        if(!userId || !clipUrl){
            return res.status(400).json({error: 'userId and clipUrl are required.'})
        }

        // クリップURLのパラメータ削除
        const urlObject = new URL(clipUrl);
        urlObject.search = '';

        // Twitch APIでクリップ情報の取得 (参考：https://dev.twitch.tv/docs/api/reference/#get-clips)
        const clipId: string = urlObject.toString().split('/').at(-1) as string;
        // console.log("clipId: ", clipId)
        const clipRequestUrl = 'https://api.twitch.tv/helix/clips?id=' + clipId;
        // console.log("clipRequestUrl: ", clipRequestUrl)
        const response = await axios.get(clipRequestUrl, {headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.TWITCH_AUTHORIZATION_TOKEN,
            'Client-ID': process.env.TWITCH_CLIENT_ID
        }})
        const clipData = response.data.data[0]
        // console.log("clipData: ", clipData);

        // クリップ情報整理
        const clip = {
            user_id: userId,
            title: clipData.title,
            clip_id: clipId,
            clip_url: clipUrl,
            thumbnail_url: clipData.thumbnail_url,
            broadcaster_name: clipData.broadcaster_name,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        }
        // console.log("clip_data: ", clip);

        // firestoreに格納
        // const docRef = await addDoc(collection(db, "clips"), clip);
        await setDoc(doc(db, 'clips', clipId), clip);
        // console.log("Document written with ID: ", docRef.id);
        return res.status(201).json(clip);
    } catch (error) {
        console.log('error: ', error)
        return res.status(500).json({error: 'Failed to add clip.'});
    }
    
});

router.get('/:clipId', async (req: Request, res: Response) => {
    /* 特定のクリップの取得
        パラメータ: clipId
    */
    try {
        const { clipId } = req.params;
        console.log(clipId);
        const docRef = doc(db, 'clips', clipId);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            const clip = docSnap.data();
            console.log('Docment data: ', clip);
            res.status(200).json(clip);
        } else {
            console.log('No such document.');
            res.status(401).json({error: 'That clip does not exist.'});
        }

    } catch (error) {
        console.log('error: ', error)
        return res.status(500).json({error: 'Failed to get clip.'});
    }
});

router.get('/', async (req: Request, res: Response) => {
    /* 特定プレイリストのクリップ全部取得
        パラメータ: playlistId
    */
        try {
            // playlistIdのclipIdを取得するクエリ作成
            const playlistId = req.query.playlistId;
            const playlistsRef = collection(db, 'playlistClips');
            const q_playlist = query(playlistsRef, where('playlist_id', '==', playlistId));
    
            // クエリを実行して、clipId一覧取得
            const clipIds: object[] = [];
            const qs_playlist = await getDocs(q_playlist);

            // プレイリストにクリップが登録されていなければ空の配列を返す
            if (qs_playlist.empty) {
                return res.status(200).json([]);
            }

            qs_playlist.forEach((doc) => {
                clipIds.push(doc.data()["clip_id"]);
            });

            // clipId一覧からclip一覧取得
            const clipsRef = collection(db, 'clips');
            const q_clip = query(clipsRef, where('clip_id', 'in', clipIds));
            const clips: object[] = [];
            const qs_clip = await getDocs(q_clip);
            qs_clip.forEach((doc) => {
                clips.push(doc.data());
            });

            // レスポンス
            res.status(200).json(clips);
        } catch (error){
            console.log('error: ', error)
            return res.status(500).json({error: 'Failed to get clips in playlist.'});
        }
})

router.delete('/:clipId', async (req: Request, res: Response) => {
    /* クリップの削除
        パラメータ: clipId
    */
    try {
        const { clipId } = req.params;
        // クリップを削除
        await deleteDoc(doc(db, 'clips', clipId));
        console.log('Document deleted with ID: ', clipId);
        return res.status(200).json({message: 'Clip deleted successfully.'});
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).json({error: 'Failed to delete clip.'});
    }
});


export default router;

