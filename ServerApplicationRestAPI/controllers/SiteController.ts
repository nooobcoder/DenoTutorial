import { RouterContext, Bson } from "../deps.ts";
import { renderView } from "../helpers.ts";
import Question from "../db/models/Question.ts";
import Survey from "../db/models/Survey.ts";
import { surveysCollection } from "../db/mongo.ts";

class SiteController {
	surveys = async (ctx: RouterContext) => {
		const surveys: Array<Object | any> = await Survey.findAllSurveys();
		surveys.reverse();
		ctx.response.body = await renderView("surveys", { surveys }); // surveys is the file name to be rendered
	};

	static async checkSurveyExists(surveyId: string): Promise<boolean> {
		return (await surveysCollection.findOne({
			_id: new Bson.ObjectId(surveyId),
		}))
			? true
			: false;
	}

	viewSurvey = async (ctx: RouterContext) => {
		// console.log(await ctx.params.id);
		const survey: any = await Survey.findBySurveyIdPublicAPI(
			(await ctx.params.id) as string
		);
		// console.log(survey);
		if (!survey) {
			ctx.response.body = await renderView("notFound");
			return;
		} else {
			const questions = await Question.findBySurveyId(survey._id);
			ctx.response.body = await renderView(`survey`, {
				survey,
				questions,
			});
		}
	};

	submitSurvey = async (ctx: RouterContext) => {
		const surveyId = ctx.params.id;
		const errors: any = {};
		const answers: any = {};
		const isValid = SiteController.checkSurveyExists(surveyId as string);
		if (!isValid) {
			ctx.response.body = await renderView(`notFound`);
		} else {
			const body = ctx.request.body();
			const formData: URLSearchParams = (await body.value) as URLSearchParams;
			console.log(formData);

			const questions = await Question.findBySurveyId(surveyId as string);
			for (const question of questions) {
				let value: string | string[] | null = formData.get(
					question._id
				);
				if (question.type === "choice" && question.data.multiple) {
					value = formData.getAll(question._id);
				}
				if (question.required) {
					if (
						!value ||
						(question.type === "choice" &&
							question.data.multiple &&
							!value.length)
					) {
						errors[question.id] = "This field is required";
					}
				}
				answers[question._id] = value;
			}
			console.error("[ERRORS]", errors, answers);
			if (Object.keys(errors).length > 0) {
			/* 	ctx.response.body = await renderView("surveys", {
					// survey,
					questions,
					errors,
					answers,
				}); */
				return;
			}
			// TODO: Save the answers
		}
	};
}

const siteController = new SiteController();
export default siteController;
