import { Router, RouterContext } from "./deps.ts";
import authController from "./controllers/AuthController.ts";
import siteController from "./controllers/SiteController.ts";
import surveyController from "./controllers/SurveyController.ts";
import authMiddleware from "./middlewares/authMiddleware.ts";
import questionController from "./controllers/QuestionController.ts";
const router = new Router();

router
	.get("/", siteController.surveys)
	.get("/survey/:id", siteController.viewSurvey)
	.post("/survey/:id", siteController.submitSurvey)
	// API Endpoints for authentication
	.post("/api/login", authController.login)
	.post("/api/register", authController.register)
	// API Endpoints for surveys
	.get("/api/survey", authMiddleware, surveyController.getAllForUser)
	.get("/api/survey/:id", authMiddleware, surveyController.getSingleSurvey)
	.post("/api/survey", authMiddleware, surveyController.createSurvey)
	.put("/api/survey/:id", authMiddleware, surveyController.updateSurvey)
	.delete("/api/survey/:id", authMiddleware, surveyController.deleteSurvey)
	// API Endpoints for questions
	.get(
		"/api/question/:surveyId/questions",
		authMiddleware,
		questionController.getBySurvey
	)
	.get(
		"/api/question/:id",
		authMiddleware,
		questionController.getSingleQuestion
	)
	.post(
		"/api/question/:surveyId",
		authMiddleware,
		questionController.createQuestion
	)
	.put("/api/question/:id", authMiddleware, questionController.updateQuestion)
	.delete(
		"/api/question/:id",
		authMiddleware,
		questionController.deleteQuestion
	);

export default router;
