import { Router } from 'express';
import { TokenController } from '../controllers/token.controller';

const router = Router();
const tokenController = new TokenController();


router.get('/tokens', tokenController.getTokens.bind(tokenController));

export default router;