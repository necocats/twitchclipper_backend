import { Router, Request, Response } from 'express'
import { serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import db from '../firestore'

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

        // Twitch APIでクリップ情報の取得 (参考：https://dev.twitch.tv/docs/api/reference/#get-clips)
        const clipId: string = clipUrl.split('/').at(-1);
        // console.log("clipId: ", clipId)
        const clipRequestUrl = 'https://api.twitch.tv/helix/clips?id=' + clipId;
        // console.log("clipRequestUrl: ", clipRequestUrl)
        const response = await axios.get(clipRequestUrl, {headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mwu60w5g16rbqcf9lyovu29a9swwx4',
            'Client-ID': 'bawuvr2cu7oz49616wfogtharu2u9w'
        }})
        const clipData = response.data.data[0]
        // console.log("clipData: ", clipData);

        // クリップ情報整理
        const clip = {
            userId,
            title: clipData.title,
            clipId,
            clipUrl,
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

export default router;