var appRouter = new Object();
appRouter.initialize = function(app) {

    var roleRoutes = require('./roleRoutes');
    app.use('/roles', roleRoutes);
    app.use('/users', require('./userRoutes'));
};
module.exports = appRouter;