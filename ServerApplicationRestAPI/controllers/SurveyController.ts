import { Bson, RouterContext } from "../deps.ts";
import User from "../db/models/User.ts";
import Survey from "../db/models/Survey.ts";

class SurveyController {
  // GET /api/survey
  getAllForUser = async (ctx: RouterContext) => {
    const user: User = ctx.state.user;
    ctx.response.body = await Survey.findAllForUser(user._id);
  };

  getSingleSurvey = async (ctx: RouterContext) => {
    const user = ctx.state.user;

    const requestedSurveyId = ctx.params.id;
    const response: any = await Survey.findBySurveyId(
      requestedSurveyId as string,
      user._id,
    );
    if (response.userId) {
      ctx.response.status = 200; // HTTP 201 - Resource Successful
      ctx.response.body = {
        userId: response.userId,
        surveyName: response.name,
        surveyDescription: response.description,
      };
    } else {
      ctx.response.status = 404;
    }
  };

  // POST /api/survey
  createSurvey = async (ctx: RouterContext) => {
    try {
      const user = ctx.state.user;

      const { value } = ctx.request.body({ type: "json" }); // Getting the request body
      const { name, description } = await value; // Extracting the required fields from the request

      const surveyObj = new Survey({
        // @ts-ignore
        userId: new Bson.ObjectID(user._id),
        name,
        description,
      });
      const insertedId = await surveyObj.save();

      ctx.response.status = 201;
      // TODO: Fix the userId below, set to a manual value for now
      ctx.response.body = {
        id: insertedId,
        name: surveyObj.name,
        userId: surveyObj.userId,
        email: surveyObj.description,
      };
      console.log(
        "[DB RESPONSE]: ",
        `INSERTED INTO DATABASE, _id: ${insertedId}`,
      );
    } catch (error) {
      console.error("[ERROR]", error);
    }
  };

  updateSurvey = async (ctx: RouterContext) => {
    const user = ctx.state.user;

    const requestedSurveyId = ctx.params.id;
    const { value } = ctx.request.body({ type: "json" });
    const { name, description } = await value;

    const response = await Survey.updateSurveyById(
      requestedSurveyId as string,
      user._id as string,
      name,
      description,
    );
    if (response === "success") {
      ctx.response.body = {
        message: "Success",
        updatedName: name,
        updatedDescription: description,
      };
    } else {
      ctx.response.status = 400;
      ctx.response.body = { message: "Bad Request" };
    }
  };

  deleteSurvey = async (ctx: RouterContext) => {
    const user = ctx.state.user;
    const requestedSurveyId = ctx.params.id;
    const response = await Survey.deleteSurvey(
      requestedSurveyId as string,
      user._id,
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

const surveyController = new SurveyController();
export default surveyController;
