export default function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { data } = req.body;

    if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid input format" });
    }

    // SIMPLE version (reuse your logic here if needed)
    return res.status(200).json({
        user_id: "manaspatil_02092005",
        email_id: "mp4791@srmist.edu.in",
        college_roll_number: "RA2311003011682",
        hierarchies: [],
        invalid_entries: [],
        duplicate_edges: [],
        summary: {
            total_trees: 0,
            total_cycles: 0,
            largest_tree_root: ""
        }
    });
}