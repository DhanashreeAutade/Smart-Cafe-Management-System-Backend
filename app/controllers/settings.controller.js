const settingsService = require('../services/settings.service.js');

exports.getSettings = async (req, res) => {
    try {
        const settings = await settingsService.getSettings();

        res.json({
            success: true,
            settings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        if (req.user?.roleName !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only admins can update settings'
            });
        }

        const { maxTables } = req.body;

        if (maxTables === undefined || maxTables === null) {
            return res.status(400).json({
                success: false,
                error: 'maxTables is required'
            });
        }

        const settings = await settingsService.updateMaxTables(maxTables);

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};
