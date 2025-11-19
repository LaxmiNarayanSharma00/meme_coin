import { Router } from 'express';
import { TokenController } from '../controllers/token.controller';

const router = Router();
const tokenController = new TokenController();

// Define the route and connect it to the controller's getTokens method
// We use .bind(tokenController) to make sure 'this' inside the controller refers to the class instance
router.get('/tokens', tokenController.getTokens.bind(tokenController));

export default router;