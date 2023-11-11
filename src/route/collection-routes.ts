import { NextFunction, Request, Response } from "express";
import { CollectionController } from "../controller/CollectionController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { Route } from "../type/route";

const authMiddleware = new AuthMiddleware();

export const CollectionRoutes: Route[] = [
  {
    method: "post",
    route: "/collection",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "create",
  },
  {
    method: "post",
    route: "/collection/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "addRecipe",
  },
];