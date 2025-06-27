// setup-app.ts
import express, { Express, Request, Response } from "express";

interface Video {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  createdAt: string;
  publicationDate: string;
  availableResolutions: string[];
}

let videos: Video[] = [];
let nextId = 1;

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.delete("/hometask_01/api/testing/all-data", (_req, res) => {
    videos = [];
    nextId = 1;
    res.sendStatus(204);
  });

  app.get("/hometask_01/api/videos", (_req, res) => {
    res.status(200).json(videos);
  });

  app.get("/hometask_01/api/videos/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    const video = videos.find((v) => v.id === id);
    if (!video) return res.sendStatus(404);
    res.status(200).json(video);
  });

  app.post("/hometask_01/api/videos", (req: Request, res: Response) => {
    const { title, author, availableResolutions } = req.body;

    if (!title || !author || !Array.isArray(availableResolutions)) {
      return res.status(400).json({
        errorsMessages: [
          {
            message: "Invalid input",
            field: "title/author/availableResolutions",
          },
        ],
      });
    }

    const now = new Date().toISOString();
    const newVideo: Video = {
      id: nextId++,
      title,
      author,
      canBeDownloaded: true,
      minAgeRestriction: null,
      createdAt: now,
      publicationDate: now,
      availableResolutions,
    };
    videos.push(newVideo);
    res.status(201).json(newVideo);
  });

  app.put("/hometask_01/api/videos/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    const video = videos.find((v) => v.id === id);
    if (!video) return res.sendStatus(404);

    const {
      title,
      author,
      availableResolutions,
      canBeDownloaded,
      minAgeRestriction,
      publicationDate,
    } = req.body;

    if (!title || !author || !Array.isArray(availableResolutions)) {
      return res.status(400).json({
        errorsMessages: [
          {
            message: "Invalid input",
            field: "title/author/availableResolutions",
          },
        ],
      });
    }

    Object.assign(video, {
      title,
      author,
      availableResolutions,
      canBeDownloaded,
      minAgeRestriction,
      publicationDate,
    });

    res.sendStatus(204);
  });

  app.delete("/hometask_01/api/videos/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    const index = videos.findIndex((v) => v.id === id);
    if (index === -1) return res.sendStatus(404);
    videos.splice(index, 1);
    res.sendStatus(204);
  });

  return app;
};
