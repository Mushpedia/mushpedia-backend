const debug = require('debug')('app:error-handler');

const ErrorHandler = (err, req, res, next) => {
    debug(`${req.method} ${req.originalUrl} - Request error`, err);
    const errStatus = err.statusCode || 500;

    let errMsg = 'Error';
    if (errStatus === 400) {
        errMsg = 'Resource not found';
    } else if (errStatus === 500) {
        errMsg = 'Internal server error';
    }

    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};

module.exports = ErrorHandler;
