import { Router, Request, Response } from 'express'
import { collection, doc, getDoc, serverTimestamp, setDoc, query, where, getDocs } from 'firebase/firestore';
import {v4 as uuidv4} from 'uuid';
import db from '../firestore';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    /* プレイリストの作成
        パラメータ: userId, playlistName, description
    */
    try {
        // プレイリスト情報の整理, idはuuidを使用
        const { userId, playlistName, description } = req.body;
        const id = uuidv4();
        const playlist = {
            id,
            user_id: userId,
            playlist_name: playlistName,
            description,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        }

        // firestoreに格納
        await setDoc(doc(db, 'playlists', id), playlist)
        return res.status(201).json(playlist);
    } catch (error) {
        console.log('error: ', error)
        return res.status(500).json({error: 'Failed to make playlist.'});
    }

    
});

router.get('/:playlistId', async (req: Request, res: Response) => {
    /* 特定のプレイリスト情報取得
        パラメータ: playlistId
    */
    try {
        // playlistIdのプレイリストを取得するクエリ作成
        const { playlistId } = req.params;
        const docRef = doc(db, 'playlists', playlistId);
        const docSnap = await getDoc(docRef);

        // プレイリストが存在するならOK
        if(docSnap.exists()){
            const playlist = docSnap.data();
            console.log('Docment data: ', playlist);
            res.status(200).json(playlist);
        } else {
            console.log('No such document.');
            res.status(401).json({error: 'That playlist does not exist.'});
        }

    } catch (error){
        console.log('error: ', error)
        return res.status(500).json({error: 'Failed to get playlist.'});
    }
});

router.get('/', async (req: Request, res: Response) => {
    /* 特定のプレイリスト情報取得
        パラメータ: userId
    */
    try {
        // userIdのプレイリストを取得するクエリ作成
        const userId = req.query.userId;
        const playlistsRef = collection(db, 'playlists');
        const q = query(playlistsRef, where('user_id', '==', userId));

        // クエリを実行して、プレイリスト一覧取得
        const playlists: object[] = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            playlists.push(doc.data());
        });

        // レスポンス
        res.status(200).json(playlists);
    } catch (error){
        console.log('error: ', error)
        return res.status(500).json({error: 'Failed to get playlists.'});
    }
});

export default router;