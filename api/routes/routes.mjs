import express from "express";
import db from "../db/connect.mjs";
import debugModule from "debug";
import ValidationError from "../errorhandling/ValidationError.mjs";

const debug = debugModule('http');
const router = express.Router();

router.get("/mushrooms", async (req, res, next) => {
    const { limit = 10, offset = 0 } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    debug(`${req.method} /mushroom - Received request`, { limit: parsedLimit, offset: parsedOffset });

    try {
        const [result] = await db.collection("mushrooms").aggregate([
            { $sort: { name: 1 } },
            {
                $facet: {
                    metadata: [{ $count: 'totalCount' }],
                    data: [
                        { $skip: parsedOffset },
                        { $limit: parsedLimit }
                    ]
                }
            }
        ]).toArray();

        const metadata = result.metadata[0] || { totalCount: 0 };
        const data = result.data;

        return res.status(200).json({
            success: true,
            mushrooms: {
                metadata: { totalCount: metadata.totalCount, offset: parsedOffset, limit: parsedLimit },
                data: data
            }
        });
    } catch (error) {
        return next(error);
    }
});


router.get("/mushroom/search", async (req, res, next) => {
    const { term, limit = 10, offset = 0 } = req.query;

    if (!term) {
        return next(new ValidationError("Search term is required."));
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    debug(`${req.method} /mushroom/search - Received search request`, { term, limit: parsedLimit, offset: parsedOffset });

    try {
        const cursor = db.collection("mushrooms").aggregate([
            {
                $search: {
                    index: "mushroom_search",
                    text: {
                        query: term,
                        path: { wildcard: "*" },
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 0,
                            maxExpansions: 50,
                        },
                    },
                },
            },
            { $sort: { name: 1 } },
            {
                $facet: {
                    metadata: [{ $count: 'totalCount' }],
                    data: [
                        { $skip: parsedOffset },
                        { $limit: parsedLimit },
                    ],
                },
            },
        ]);

        const results = await cursor.toArray();
        const metadata = results[0].metadata[0];

        return res.status(200).json({
            success: true,
            mushrooms: {
                metadata: { totalCount: metadata.totalCount, offset: parsedOffset, limit: parsedLimit },
                data: results[0].data,
            },
        });
    } catch (error) {
        return next(error);
    }
});

router.get("/mushroom/search/autocomplete", async (req, res, next) => {
    const { term } = req.query;

    if (!term) {
        return next(new ValidationError("Search term is required."));
    }

    debug(`${req.method} /mushroom/search/autocomplete - Received search request`, { term });

    const normalizedTerm = term.toLowerCase();

    try {
        const cursor = db.collection("mushrooms").aggregate([
            {
                $search: {
                    index: "autoCompleteMushrooms",
                    compound: {
                        should: [
                            { autocomplete: { query: normalizedTerm, path: "name" } },
                            { autocomplete: { query: normalizedTerm, path: "eng_name" } },
                            { autocomplete: { query: normalizedTerm, path: "family" } },
                        ],
                    },
                },
            },
            { $limit: 10 },
            { $project: { _id: 1, name: 1, eng_name: 1, family: 1 } },
        ]);

        const results = await cursor.toArray();
        const parsedResults = await parseResults(results, term);

        return res.status(200).json({
            success: true,
            mushrooms: {
                data: parsedResults,
            },
        });
    } catch (error) {
        return next(error);
    }
});

// TODO: add (joi) validation if these are going to be used
/*
router.post("/mushroom", async (req, res, next) => {
    const newMushroom = req.body;
    debug(`${req.method} /mushroom - Received request`, newMushroom);
    try {
        const result = await db.collection("mushrooms").insertOne(newMushroom);
        debug(`${req.method} /mushroom - Request error`, error);
        console.log(`New mushroom created with the following id: ${result.insertedId}`);
        debug(`${req.method} /mushroom - New mushroom created with the following id: ${result.insertedId}`);

        res.send(result).status(200);
    } catch (error) {
        return next(error);
    }
});

router.post("/mushrooms", async (req, res, next) => {
    const newMushrooms = req.body;
    debug(`${req.method} /mushroom - Received request`, newMushroom);
    try {
        const results = await db.collection("mushrooms").insertMany(newMushrooms);
        debug(`${req.method} /mushroom - New mushrooms created with the following id(s): ${results.insertedIds}`);

        res.send(results).status(200);
    } catch (error) {
        return next(error);
    }
});
*/

async function parseResults(results, term) {
    let parsedRes = [];
    for (let index = 0; index < results.length; index++) {
        let res = results[index];

        let name = res.name.toLowerCase();
        let eng_name = res.eng_name.toLowerCase();

        if (name.includes(term)) {
            parsedRes[index] = { _id: res._id, complete: res.name }
        } else if (eng_name.includes(term)) {
            parsedRes[index] = { _id: res._id, complete: res.eng_name }
        } else {
            parsedRes[index] = { _id: res._id, complete: res.family }
        }
    }

    return parsedRes;
}

export default router;