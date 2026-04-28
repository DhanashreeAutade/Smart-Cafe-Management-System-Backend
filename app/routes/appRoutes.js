var appRouter = new Object();
appRouter.initialize = function(app) {

    var roleRoutes = require('./roleRoutes');
    app.use('/roles', roleRoutes);
    app.use('/users', require('./userRoutes'));
    app.use('/products', require('./productRoutes'));
    app.use('/categories', require('./categoryRoutes'));
    app.use('/auth', require('./authRoutes'));
};
module.exports = appRouter;