const Settings = require('../models/settings.model.js');

const DEFAULT_MAX_TABLES = 10;

exports.getSettings = async () => {
    let settings = await Settings.findOne({ key: 'cafe' });

    if (!settings) {
        settings = await Settings.create({ key: 'cafe', maxTables: DEFAULT_MAX_TABLES });
    }

    return {
        maxTables: settings.maxTables
    };
};

exports.updateMaxTables = async (maxTables) => {
    const parsed = parseInt(maxTables, 10);

    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
        throw new Error('Table limit must be between 1 and 100');
    }

    const settings = await Settings.findOneAndUpdate(
        { key: 'cafe' },
        { maxTables: parsed },
        { new: true, upsert: true }
    );

    return {
        maxTables: settings.maxTables
    };
};
