import { Router, Request, Response } from 'express'
import { collection, doc, setDoc } from 'firebase/firestore';
import db from '../firestore'
import { getDoc } from 'firebase/firestore/lite';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  /* ユーザー登録
      パラメータ: username, email, password
  */
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Missing fields');
  }

  try {
    const userCollection = collection(db, 'users');
    const userRef = doc(userCollection);
    await setDoc(userRef, {
      username,
      email,
      password 
    });
    res.status(201).send({ id: userRef.id });
  } catch (error) {
    console.log('error: ', error)
    return res.status(500).json({error: 'Failed to make user.'});
  }
});

router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      return res.status(404).send('User not found');
    }
    res.status(200).send(docSnap.data());
  } catch (error){
    console.log('error: ', error)
    return res.status(500).json({error: 'Failed to get user.'});
}
});

export default router;