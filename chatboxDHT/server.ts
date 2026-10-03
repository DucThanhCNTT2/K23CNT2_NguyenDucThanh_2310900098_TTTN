import { startServer } from './server/app';
import { logInternalError } from './server/httpErrors';

startServer().catch((error) => {
	logInternalError(error, 'Backend startup');
	process.exit(1);
});
