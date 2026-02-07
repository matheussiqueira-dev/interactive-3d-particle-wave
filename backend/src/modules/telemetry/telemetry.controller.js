class TelemetryController {
    constructor(service) {
        this.service = service;
    }

    submit = async (req, res) => {
        const payload = await this.service.submitTelemetry(req.body, req.auth);
        return res.status(202).json({ data: payload });
    };

    summary = async (req, res) => {
        const payload = await this.service.getSummary(req.query.windowMinutes);
        return res.status(200).json({ data: payload });
    };
}

module.exports = {
    TelemetryController,
};
