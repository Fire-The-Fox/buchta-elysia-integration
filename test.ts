import Elysia from "elysia";
import { buchta } from "./index.ts";

const ely = new Elysia().get("/api", () => "Hey there!");
ely.use(buchta);
