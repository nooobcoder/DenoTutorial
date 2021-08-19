import { questionCollection, surveysCollection } from "../mongo.ts";
import { Bson } from "../../deps.ts";

export enum QuestionType {
  CHOICE = "choice",
  TEXT = "text",
}

export default class Question {
  public id: string = "";
  public surveyId: string;
  public text: string;
  public type: QuestionType;
  public required: boolean;
  public data: any;
  constructor(
    surveyId: string,
    text: string,
    type: QuestionType,
    required: boolean,
    data: any,
  ) {
    this.surveyId = surveyId;
    this.type = type;
    this.required = required;
    this.data = data;
    this.text = text;
  }

  static async checkSurveyExists(surveyId: string): Promise<boolean> {
    return (await surveysCollection.findOne({
        _id: new Bson.ObjectId(surveyId),
      }))
      ? true
      : false;
  }

  static async findBySurveyId(surveyId: string): Promise<any> {
    return await questionCollection
      .find({ surveyId: new Bson.ObjectID(surveyId) })
      .toArray();
  }

  static async findOneByQuestionId(id: string): Promise<any> {
    return await questionCollection.findOne({
      _id: new Bson.ObjectId(id),
    });
  }

  static async updateQuestionById(
    id: string,
    text: string,
    type: QuestionType,
    required: boolean,
    data: any,
  ): Promise<string> {
    const response: any = await questionCollection.findOne({
      _id: new Bson.ObjectId(id),
    });
    console.log("[RESPONSE]", response);
    if (response) {
      // Update to database
      /* 	const {
				matchedCount,
				modifiedCount,
				upsertedId,
			} = */
      await questionCollection.updateOne(
        { _id: new Bson.ObjectId(id) },
        {
          $set: {
            text,
            type,
            required,
            data,
          },
        },
      );
      return "success";
    } else {
      return "failure";
    }
  }

  static async save(
    surveyId: string,
    text: string,
    type: QuestionType,
    required: boolean,
    data: any,
  ) {
    if (await this.checkSurveyExists(surveyId)) {
      const insertId = await questionCollection.insertOne({
        surveyId: new Bson.ObjectID(surveyId),
        text: text,
        type: type,
        required: required,
        data: data,
      });
      return insertId;
    } else {
      return undefined;
    }
  }

  static async deleteQuestion(questionId: string): Promise<string> {
    const deleteCount = await questionCollection.deleteOne({
      _id: new Bson.ObjectId(questionId),
    });
    if (deleteCount > 0) {
      return "success";
    } else return "failure";
  }
}
