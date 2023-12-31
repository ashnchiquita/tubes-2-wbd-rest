import express from "express";
import bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./config/data-source";
import { UserRoutes } from "./route/user-routes";
import "reflect-metadata";
import { ServerConfig } from "./config/server-config";
import { Route } from "./type/route";
import { RecipeRoutes } from "./route/recipe-routes";
import * as path from "path";
import { CollectionRoutes } from "./route/collection-routes";
import cors from "cors";
import { SoapRoutes } from "./route/soap-routes";
import { AppRoutes } from "./route/app-routes";

AppDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();
    app.use(
      cors({
        origin: [process.env.APP_URL, process.env.SPA_URL],
        credentials: true,
        exposedHeaders: ["Authorization", "X-API-KEY"],
        methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
      })
    );

    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(bodyParser.json());
    app.use(
      "/public",
      express.static(path.join(__dirname, "..", "storage", "images"))
    );

    // register express routes from defined application routes
    // const Routes = UserRoutes.concat(RecipeRoute, Route2, Route3 ....)
    const Routes: Route[] = UserRoutes.concat(
      RecipeRoutes,
      CollectionRoutes,
      SoapRoutes,
      AppRoutes,
    );

    Routes.forEach((route) => {
      if (route.middleware) {
        (app as any)[route.method](
          route.route,
          route.middleware,
          (req: Request, res: Response, next: Function) => {
            const result = new (route.controller as any)()[route.action](
              req,
              res,
              next
            );

            if (result instanceof Promise) {
              result.then((result) =>
                result !== null && result !== undefined
                  ? res.send(result)
                  : undefined
              );
            } else if (result !== null && result !== undefined) {
              res.json(result);
            }
          }
        );
      } else {
        (app as any)[route.method](
          route.route,
          (req: Request, res: Response, next: Function) => {
            const result = new (route.controller as any)()[route.action](
              req,
              res,
              next
            );
            if (result instanceof Promise) {
              result.then((result) =>
                result !== null && result !== undefined
                  ? res.send(result)
                  : undefined
              );
            } else if (result !== null && result !== undefined) {
              res.json(result);
            }
          }
        );
      }
    });

    // start express server
    app.listen(ServerConfig.port);

    console.log(
      "Express server has started on port",
      ServerConfig.port,
      "Open http://localhost:" + ServerConfig.port + " to see results"
    );
  })
  .catch((error) => console.log(error));
