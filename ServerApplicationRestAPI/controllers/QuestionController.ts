import { Bson, RouterContext } from "../deps.ts";
import Question, { QuestionType } from "../db/models/Question.ts";

class QuestionController {
  // GET /api/survey
  getBySurvey = async (ctx: RouterContext) => {
    ctx.response.body = await Question.findBySurveyId(
      (await ctx.params.surveyId) as string,
    );
  };

  getSingleQuestion = async (ctx: RouterContext) => {
    ctx.response.body = await Question.findOneByQuestionId(
      (await ctx.params.id) as string,
    );
  };

  // POST /api/survey
  createQuestion = async (ctx: RouterContext) => {
    try {
      const { value } = ctx.request.body({ type: "json" });
      const { text, type, required, data } = await value;
      const id: Bson.Document | undefined = await Question.save(
        ctx.params.surveyId as string,
        text,
        type,
        required,
        data,
      );
      console.log(
        "[DB RESPONSE]: ",
        `INSERTED INTO DATABASE, _id: ${id?.toString()}`,
      );
      ctx.response.body = {
        id: id?.toString(),
        text,
        type,
        required,
        data,
      };
    } catch (err) {
      console.error("[ERROR]", err);
    }
  };

  updateQuestion = async (ctx: RouterContext) => {
    const { value } = ctx.request.body({ type: "json" });
    const { text, type, required, data } = await value;
    console.log(type);
    const response = await Question.updateQuestionById(
      ctx.params.id as string,
      text,
      type,
      required,
      data,
    );
    if (response === "success") {
      ctx.response.body = {
        message: "Updated Successfully",
        text,
        type,
        required,
        data,
      };
    } else {
      ctx.response.status = 400;
      ctx.response.body = { message: "Bad Request" };
    }
  };

  deleteQuestion = async (ctx: RouterContext) => {
    const response = await Question.deleteQuestion(
      (await ctx.params.id) as string,
    );
    if (response === "success") {
      ctx.response.body = {
        message: "Success",
      };
    } else {
      ctx.response.status = 400;
      ctx.response.body = { message: "Bad Request" };
    }
  };
}

const questionController = new QuestionController();
export default questionController;
