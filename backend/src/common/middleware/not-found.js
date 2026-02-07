function notFound(req, res) {
    return res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Rota nao encontrada: ${req.method} ${req.originalUrl}`,
            requestId: req.requestId,
        },
    });
}

module.exports = {
    notFound,
};
