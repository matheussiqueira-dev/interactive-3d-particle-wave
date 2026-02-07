class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    register = async (req, res) => {
        const user = await this.authService.register(req.body, req.auth);

        return res.status(201).json({
            data: user,
        });
    };

    login = async (req, res) => {
        const payload = await this.authService.login(req.body);
        return res.status(200).json({ data: payload });
    };

    me = async (req, res) => {
        const user = await this.authService.me(req.auth.userId);
        return res.status(200).json({ data: user });
    };
}

module.exports = {
    AuthController,
};
