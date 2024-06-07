import { Router, Request, Response } from 'express'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import {v4 as uuidv4} from 'uuid';
import db from '../firestore';


const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  /* ユーザー登録
      パラメータ: username, email, password
  */

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Missing fields');
  }//ユーザー情報の不足

  try {
    const { username, email, password } = req.body;
    const id = uuidv4();
    const user = {
      id,
      user_name: username,
      email: email,
      password: password
    }

    //firestoreに格納
    await setDoc(doc(db, 'users', id), user)
    return res.status(201).json(user);
  } catch (error) {
    console.log('error: ', error)
    return res.status(500).json({error: 'Failed to make user.'});
  }
});

router.get('/:userId', async (req: Request, res: Response) => {
  /* ユーザー情報取得
  　パラメータ: userId
  */
  const { userId } = req.params;

  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    //ユーザーが存在すれば成功
    if (docSnap.exists()) {
      const user = docSnap.data();
      console.log('Docment data: ', user);
      res.status(200).json(user);
    }else{
      console.log('No such document.');
      res.status(401).json({error: 'That user does not exist.'});
    }
    
  } catch (error){
    console.log('error: ', error)
    return res.status(500).json({error: 'Failed to get user.'});
  }
});

export default router;