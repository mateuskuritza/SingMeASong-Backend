import { Request, Response } from "express";
import * as recommendationsServices from "../services/recommendationsServices";

export async function newRecommendation(req: Request, res: Response) {
    try {
        const { name, youtubeLink, genresIds } = req.body;
        const validRecommendation = await recommendationsServices.validRecommendation(name, youtubeLink, genresIds)
        if (!validRecommendation) return res.status(400).send("Invalid name, youtube link or genre id");
        const alreadyExists = await recommendationsServices.findByYoutubeLink(youtubeLink);
        if (alreadyExists) return res.status(400).send("Youtube link already exists");
        await recommendationsServices.saveRecommendation(name, youtubeLink, genresIds);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err);
    }
}

export async function upvoteRecommendation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const recommendation = await recommendationsServices.findById(Number(id));
        if (!recommendation) return res.status(404).send("No recommendation found");
        await recommendationsServices.upvoteRecommendation(recommendation.id_recommendation);
        res.status(200).send({ score: recommendation.score + 1 });
    } catch (err) {
        res.status(500).send(err);
    }
}

export async function downvoteRecommendation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const recommendation = await recommendationsServices.findById(Number(id));
        if (!recommendation) return res.status(404).send("No recommendation found");
        if (recommendation.score === -5) {
            await recommendationsServices.deleteRecommendation(recommendation.id_recommendation);
            return res.status(200).send("Recommendation deleted");
        }
        await recommendationsServices.downvoteRecommendation(recommendation.id_recommendation);
        res.status(200).send({ score: recommendation.score - 1 });
    } catch (err) {
        res.status(500).send(err);
    }
}

