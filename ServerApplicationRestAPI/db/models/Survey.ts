import { surveysCollection } from "../mongo.ts";
import { Bson } from "../../deps.ts";

export default class Survey {
  public userId: string;
  public name: string;
  public description: string;

  constructor({ userId = "", name = "", description = "" }) {
    this.userId = userId;
    this.name = name;
    this.description = description;
  }

  static async findAllForUser(userId: string) {
    return await surveysCollection
      .find({ userId: new Bson.ObjectID(userId) })
      .toArray();
  }

  static async findAllSurveys() {
    return await surveysCollection.find().toArray();
  }

  static async findBySurveyId(id: string, userId: string) {
    return await surveysCollection.findOne({
      _id: new Bson.ObjectId(id),
      userId: new Bson.ObjectId(userId),
    });
  }

  static async findBySurveyIdPublicAPI(id: string) {
    return await surveysCollection.findOne({
      _id: new Bson.ObjectId(id),
    });
  }

  static async updateSurveyById(
    id: string,
    userId: string,
    updateName: string,
    updateDescription: string,
  ): Promise<string> {
    const response: any = await surveysCollection.findOne({
      _id: new Bson.ObjectId(id),
    });

    if (response.userId.toString() === userId.toString()) {
      if (response) {
        // Update to database
        console.log(updateName);
        console.log(updateDescription);
        /* 	const {
				matchedCount,
				modifiedCount,
				upsertedId,
			} = */
        await surveysCollection.updateOne(
          { _id: new Bson.ObjectId(id) },
          {
            $set: {
              name: updateName,
              description: updateDescription,
            },
          },
        );
        return "success";
      } else {
        return "failure";
      }
    } else {
      return "failure";
    }
  }

  async save() {
    const insertId = await surveysCollection.insertOne({
      userId: this.userId,
      name: this.name,
      description: this.description,
    });
    return insertId;
  }

  static async deleteSurvey(
    surveyId: string,
    userId: string,
  ): Promise<string> {
    const deleteCount = await surveysCollection.deleteOne({
      _id: new Bson.ObjectId(surveyId),
      userId: new Bson.ObjectID(userId),
    });
    if (deleteCount > 0) {
      return "success";
    } else return "failure";
  }
}
