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

const validResolutions = [
  "P144", "P240", "P360", "P480",
  "P720", "P1080", "P1440", "P2160"
];

let videos: Video[] = [];
let nextId = 1;

export const setupApp = (app: Express) => {
  app.use(express.json());

  // DELETE /testing/all-data
  app.delete("/testing/all-data", (_req, res) => {
    videos = [];
    nextId = 1;
    res.sendStatus(204);
  });

  app.get("/videos", (_req, res) => {
    res.status(200).json(videos);
  });

  app.get("/videos/:id", (req, res) => {
    const id = +req.params.id;
    const video = videos.find(v => v.id === id);
    if (!video) return res.sendStatus(404);
    res.status(200).json(video);
  });

  app.post("/videos", (req: Request, res: Response) => {
    const { title, author, availableResolutions } = req.body;
    const errors = [];

    if (!title || typeof title !== "string") {
      errors.push({ message: "Invalid value", field: "title" });
    }
    if (!author || typeof author !== "string") {
      errors.push({ message: "Invalid value", field: "author" });
    }
    if (
      !Array.isArray(availableResolutions) ||
      !availableResolutions.every(r => validResolutions.includes(r))
    ) {
      errors.push({ message: "Invalid value", field: "availableResolutions" });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errorsMessages: errors });
    }

    const createdAt = new Date().toISOString();
    const publicationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newVideo: Video = {
      id: nextId++,
      title,
      author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt,
      publicationDate,
      availableResolutions,
    };

    videos.push(newVideo);
    res.status(201).json(newVideo);
  });

  app.put("/videos/:id", (req: Request, res: Response) => {
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

    const errors = [];

    if (!title || typeof title !== "string") {
      errors.push({ message: "Invalid value", field: "title" });
    }
    if (!author || typeof author !== "string") {
      errors.push({ message: "Invalid value", field: "author" });
    }
    if (
      !Array.isArray(availableResolutions) ||
      !availableResolutions.every(r => validResolutions.includes(r))
    ) {
      errors.push({ message: "Invalid value", field: "availableResolutions" });
    }
    if (typeof canBeDownloaded !== "boolean") {
      errors.push({ message: "Invalid value", field: "canBeDownloaded" });
    }
    if (minAgeRestriction !== null && (typeof minAgeRestriction !== "number" || minAgeRestriction < 0 || minAgeRestriction > 18)) {
      errors.push({ message: "Invalid value", field: "minAgeRestriction" });
    }
    if (!publicationDate || typeof publicationDate !== "string" || isNaN(Date.parse(publicationDate))) {
      errors.push({ message: "Invalid value", field: "publicationDate" });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errorsMessages: errors });
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

  app.delete("/videos/:id", (req: Request, res: Response) => {
    const id = +req.params.id;
    const index = videos.findIndex((v) => v.id === id);
    if (index === -1) return res.sendStatus(404);
    videos.splice(index, 1);
    res.sendStatus(204);
  });

  return app;
};
