export const unifiedResponseMiddleware = (handler) => {
    return async (req, res, next) => {
        try {
             const result = await handler(req, res, next);
            if (res.headersSent) {
                return;
            }

            return res.status(result?.meta?.status || 200).json({
                success: true,
                data: result?.data || null,
                message: result?.message || "Request successful",
                meta: result?.meta || {}
            });
            
        } catch (error) {
            next(error);
        }
    };
};