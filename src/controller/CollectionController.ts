import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Collection } from "../entity/Collection";
import { CollectionRecipe } from "../entity/CollectionRecipe";
import { AddRecipeRequest, CreateRequest } from "../type/collection";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Recipe } from "../entity/Recipe";

export class CollectionController {
  private colleRepo = AppDataSource.getRepository(Collection);
  private colleRecipeRepo = AppDataSource.getRepository(CollectionRecipe);
  private recipeRepo = AppDataSource.getRepository(Recipe);

  async create(req: Request, res: Response) {
    const userId = res.locals.id;
    const { title } = req.body as CreateRequest;

    if (!title) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: ReasonPhrases.BAD_REQUEST });
      return;
    }

    const collection = new Collection();
    collection.title = title;
    collection.user_id = userId;

    const savedCollection = await this.colleRepo.save(collection);

    if (!savedCollection) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      return;
    }

    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  }

  async addRecipe(req: Request, res: Response) {
    const userId = res.locals.id;
    const collecId = parseInt(req.params.id);
    const { recipe_id } = req.body as AddRecipeRequest;

    if (!recipe_id || !collecId || isNaN(collecId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });

      return;
    }

    const collection = await this.colleRepo.findOneBy({ id: collecId });
    if (!collection) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND,
      });

      return;
    }

    if (collection.user_id !== userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
      });

      return;
    }

    const recipe = await this.recipeRepo.findOneBy({ id: recipe_id });

    if (!recipe) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND,
      });

      return;
    }

    if (recipe.user_id !== userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
      });

      return;
    }

    const colleRecipe = new CollectionRecipe();
    colleRecipe.collectionId = collecId;
    colleRecipe.recipeId = recipe_id;

    const addedRecipe = await this.colleRecipeRepo.save(colleRecipe);

    if (!addedRecipe) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
      return;
    }

    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  }
}
