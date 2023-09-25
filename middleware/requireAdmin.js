const requireAdmin = (req, res, next) => {
    const { roles } = req.user

    if (!roles.includes('admin')) {
        return res.status(401).json({error: 'Root is only accessable for Admin'})
    } else {
        next()
    }
}

module.exports = requireAdmin

