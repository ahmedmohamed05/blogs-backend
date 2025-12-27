import { Router } from "express";
import prisma from "../lib/prisma";
import ApiError from "../utils/apiError";

const userRouter = Router();

// Find user by id
userRouter.get("/:username", async (req, res) => {
	let username = req.params.username;

	if (!username)
		throw new ApiError(400, "No Username Found, this account might be deleted");

	const user = await prisma.user.findUnique({
		where: { username },
		omit: {
			hashedPassword: true,
			id: true,
		},
		include: {
			posts: true,
		},
	});

	if (!user) return res.status(404).send({ msg: "User not found" });

	res.json(user);
});

// TODO: find user by first name (first or last)

export default userRouter;
