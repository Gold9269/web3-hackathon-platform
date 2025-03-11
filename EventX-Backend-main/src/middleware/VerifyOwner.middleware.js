import { Hackathon } from "../models/hackathon.model.js";

export const verifyHackathonOwner = async (req, res, next) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const hackathon = await Hackathon.findById(id);
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

        if (!user.ownedHackathons.includes(hackathon._id)) {
            return res.status(403).json({ message: "Access denied. You are not the owner of this hackathon." });
        }

        next(); // Proceed if the user is the owner
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
