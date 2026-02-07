class PresetsController {
    constructor(service) {
        this.service = service;
    }

    list = async (req, res) => {
        const result = await this.service.listPresets(req.query, req.auth);
        return res.status(200).json({ data: result });
    };

    getById = async (req, res) => {
        const preset = await this.service.getPreset(req.params.presetId, req.auth);
        return res.status(200).json({ data: preset });
    };

    create = async (req, res) => {
        const preset = await this.service.createPreset(req.body, req.auth);
        return res.status(201).json({ data: preset });
    };

    clone = async (req, res) => {
        const preset = await this.service.clonePreset(req.params.presetId, req.auth);
        return res.status(201).json({ data: preset });
    };

    update = async (req, res) => {
        const preset = await this.service.updatePreset(req.params.presetId, req.body, req.auth);
        return res.status(200).json({ data: preset });
    };

    remove = async (req, res) => {
        const payload = await this.service.deletePreset(req.params.presetId, req.auth);
        return res.status(200).json({ data: payload });
    };
}

module.exports = {
    PresetsController,
};
