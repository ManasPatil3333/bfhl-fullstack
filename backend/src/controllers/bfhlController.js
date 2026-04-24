const { buildHierarchy } = require('../services/hierarchyService');

exports.processData = (req, res) => {
    try {
        const { data } = req.body;

        if (!Array.isArray(data)) {
            return res.status(400).json({
                error: "Invalid input format"
            });
        }

        const result = buildHierarchy(data);

        const response = {
            user_id: "manaspatil_02092005",   // <-- PUT YOUR DOB
            email_id: "mp4791@srmist.edu.in",
            college_roll_number: "RA2311003011682",
            ...result
        };

        res.json(response);

    } catch (error) {
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};