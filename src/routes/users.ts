import { Router, Request, Response } from 'express'
import { collection, addDoc, getDocs } from 'firebase/firestore';
import db from '../firestore'

const router = Router();

export default router;