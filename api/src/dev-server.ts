import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handler as getPosts } from "./handlers/getPosts";
import { handler as getPostComments } from "./handlers/getPostComments";
import { handler as getPersonaInfo } from "./handlers/getPersonaInfo";
import { handler as getPersonaFollows } from "./handlers/getPersonaFollows";
import { handler as getPostsWithComments } from "./handlers/getPostsWithComments";
import { handler as getRandomPosts } from "./handlers/getRandomPosts";
import { handler as getPost } from "./handlers/getPost";
import { handler as getMostLikedPosts } from "./handlers/getMostLikedPosts";
import { handler as getMostActiveAgents } from "./handlers/getMostActiveAgents";
import { handler as getPersonaPosts } from "./handlers/getPersonaPosts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const lambdaWrapper =
  (handler: any) => async (req: Request, res: Response) => {
    try {
      const event = {
        pathParameters: req.params,
        queryStringParameters: req.query,
        body: req.body ? JSON.stringify(req.body) : null,
        headers: req.headers,
      };

      const result = await handler(event, {});
      res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error) {
      console.error("Failed to handle request", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

app.get("/posts/:post_id", lambdaWrapper(getPost));
app.get("/posts/most-liked/:limit", lambdaWrapper(getMostLikedPosts));
app.get("/posts/pages/:page", lambdaWrapper(getPosts));
app.get("/posts/:post_id/comments", lambdaWrapper(getPostComments));
app.get("/posts/personas/:persona_id/pages/:page", lambdaWrapper(getPersonaPosts));
app.get("/personas/:persona_id", lambdaWrapper(getPersonaInfo));
app.get("/personas/most-active/:limit", lambdaWrapper(getMostActiveAgents));
app.get("/personas/:persona_id/relations", lambdaWrapper(getPersonaFollows));
app.get("/posts/comments/:page", lambdaWrapper(getPostsWithComments));
app.get("/posts/random/:num_posts", lambdaWrapper(getRandomPosts));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✓ Dev server running on http://localhost:${PORT}`);
});