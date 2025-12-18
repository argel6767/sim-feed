import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handler as getPosts } from "./handlers/getPosts";
import { handler as getPostComments } from "./handlers/getPostComments";
import { handler as getPersonaInfo } from "./handlers/getPersonaInfo";
import { handler as getPersonaFollows } from "./handlers/getPersonaFollows";
import { handler as getPostsWithComments } from "./handlers/getPostsWithComments";
import { handler as getRandomPosts } from "./handlers/getRandomPosts";

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

app.get("/posts/:page", lambdaWrapper(getPosts));
app.get("/posts/:post_id/comments", lambdaWrapper(getPostComments));
app.get("/persona/:persona_id", lambdaWrapper(getPersonaInfo));
app.get("/persona/:persona_id/relations", lambdaWrapper(getPersonaFollows));
app.get("/posts/comments/:page", lambdaWrapper(getPostsWithComments));
app.get("/posts/random/:num_posts", lambdaWrapper(getRandomPosts));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✓ Dev server running on http://localhost:${PORT}`);
});